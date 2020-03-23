import net from 'net';
import ws from 'ws';
import { Log, Level } from '@/utils/log';
import { Tcppkg } from './tcppkg';
export enum PROTO_TYPE {
    PROTO_JSON = 1,
    PROTO_BUF = 2,
}
export class netbus {

    //全局session缓存?
    private _global_session_list: { [key: number]: any } = {};
    //
    private _global_session_key: number = 1;

    constructor() {

    }

    /**
     * 有客户端的session接入进来
     * @param session 客户端传输的session
     * @param proto_type 传输格式
     * @param is_ws 是否是websocket
     */
    public on_session_enter(session: any, proto_type: PROTO_TYPE, is_ws: boolean): void {
        if (is_ws) {
            Log.Instance.log("session enter ", session._socket.remoteAddress, session._socket.remotePort);
        } else {
            Log.Instance.log("session enter ", session.remoteAddress, session.remotePort);
        }

        session.last_pkg = null; //表示存储的上一次没有处理完的TCP包
        session.is_ws = is_ws
        session.proto_type = proto_type;

        //加入到全局的sesion列表
        this._global_session_list[this._global_session_key] = session;
        session.session_key = this._global_session_key;
        this._global_session_key++;

    }

    /**
     * 
     * @param session 传入的session
     */
    private _on_session_exit(session): void {
        Log.Instance.log("session exit!!!!");
        session.last_pkg = null;
        if (this._global_session_list[session.session_key]) {
            this._global_session_list[session.session_key] = null;
            delete this._global_session_list[session.session_key];
            session.session_key = null;
        }
    }

    /**
     * 调用方法要保证是一个整包
     * @param session 传入的session
     * @param str_or_buf 协议对象类型
     */
    private _on_session_recv_cmd(session: any, str_or_buf: any): void {
        Log.Instance.log(str_or_buf);
    }

    /**发送命令 */
    public session_send(session: any, cmd: any): void {
        if (!session.is_ws) {
            let _data = Tcppkg.Instance.packge_data(cmd); //
            session.write(_data);
            return
        } else {
            session.send(cmd);
        }
    }

    /**关闭一个session  */
    public session_close(session: any) {
        if (!session.is_ws) {
            session.end();
            return;
        } else {
            session.close();
        }
    }


    public add_client_session_event(session: any, proto_type: PROTO_TYPE): void {
        session.on("close", this._on_session_exit.apply(this, session));

        //接入data
        session.on("data", (data) => { this._deal_session_data(session, data) });

        session.on("error", (err) => {
            // Log.Instance.Error(Level.ERROR, "session err code" + err);
        });

        this.on_session_enter(session, proto_type, false);
    }

    /**
     * 处理接入的数据
     * @param session 传入的session 
     * @param data 传入的数据
     */
    private _deal_session_data(session: any, data: any): void {

        //
        if (!Buffer.isBuffer(data)) {//校验是否合法数据
            this.session_close(session);
            return;
        }
        //end

        let _last_pkg: any = session.last_pkg;
        if (_last_pkg != null) { //上次剩余没有处理完的半包
            let _buf: Buffer = Buffer.concat([_last_pkg, data], _last_pkg.length + data.length);
            _last_pkg = _buf;
        } else {
            _last_pkg = data;
        }


        let _offset: number = 0;
        let _pkg_len: number = Tcppkg.Instance.read_pkc_size(_last_pkg, _offset);

        if (_pkg_len < 0) {
            return; //不存在
        }

        while (_offset + _pkg_len <= _last_pkg.length) {
            //判断是否有完整的包
            //根据长度信息来读取我们的数据，假设传过来的是文本数据

            let _cmd_buf: Buffer;

            //收到一个完整的数据包
            if (session.proto_type == PROTO_TYPE.PROTO_JSON) {
                const _json_str: string = _last_pkg.toString("utf8", _offset + 2, _offset + _pkg_len);
                if (!_json_str) {
                    this.session_close(session);
                    return;
                }
                this._on_session_recv_cmd(session, _json_str);

            } else {
                _cmd_buf = Buffer.allocUnsafe(_pkg_len - 2); // 2个长度信息
                _last_pkg.copy(_cmd_buf, 0, _offset + 2, _offset + _pkg_len);
                this._on_session_recv_cmd(session, _cmd_buf);
            }

            _offset += _pkg_len;
            if (_offset >= _last_pkg.length) {//正好包处理完了
                break;
            }

            _pkg_len = Tcppkg.Instance.read_pkc_size(_last_pkg, _offset);
            if (_pkg_len < 0) {
                break;
            }

        }

        //能处理的数据包已经处理完成，保存
        if (_offset >= _last_pkg.length) {
            _last_pkg = null;
        } else {
            // offset ,length这段数据拷贝到新的Buffer里面
            const buf: Buffer = Buffer.allocUnsafe(_last_pkg.length - _offset);
            _last_pkg.copy(buf, 0, _offset, _last_pkg.length);
            _last_pkg = buf;
        }
        session.last_pkg = _last_pkg;

    }

    /**
     * 启动tcp服务
     * @param ip 地址
     * @param port 端口
     * @param proto_type 类型 
     */
    public start_tcp_server(ip: string, port: number, proto_type: PROTO_TYPE): void {
        // Log.Instance.Info("start tcp server .. ")
        const server: net.Server = net.createServer((client_sock) => {
            this.add_client_session_event(client_sock, proto_type);
        });


        //监听事件
        server.on("error", () => {
            //报错
        });

        server.on("close", () => {
            //关闭
        });

        server.listen({
            port: port,
            host: ip,
            exclusive: true,
        });
    }


    /** */
    private _checkSring(obj: any): boolean {
        return Object.prototype.toString.call(obj) == "[object String]"

    }

    private _ws_add_client_session_event(session: any, proto_type: PROTO_TYPE): void {

        // 注册监听
        session.on("close", () => {
            this._on_session_exit(session);
        });

        session("error", () => {
            //
        });

        session.on("message", (data) => {
            if (session.proto_type == PROTO_TYPE.PROTO_JSON) {
                //
                if (!this._checkSring(data)) {
                    this.session_close(session);
                    return;
                }

            } else {
                if (!Buffer.isBuffer(data)) {
                    this.session_close(session);
                    return;
                }
            }
            this._on_session_recv_cmd(session, data);
        });

        this.on_session_enter(session, proto_type, true);
    }

    public start_ws_server(ip: string, port: number, proto_type: PROTO_TYPE): void {
        const server:ws.Server = new ws.Server({
            host: ip,
            port: port,
        });


        server.on("connection", (data)=>{
            this._ws_add_client_session_event(data,proto_type);
        });
        //
        server.on("error", ()=>{
            //
        });
        //
        server.on("close", ()=>{
            //
        });

    }


}