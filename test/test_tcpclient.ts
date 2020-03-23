import net from 'net';
import { Socket } from 'dgram';

export default class test_tcpclient {

    private _socket: net.Socket;


    private _ConnectServer() {
        this._socket = net.connect({
            port: 6080,
            host: "127.0.0.1",
        }, () => {
            console.log('connected to server!');
        });


        this._socket.on("connect", () => {
            console.log("connet success");

            // const buf_set = _netBus.tes


        })


    }

}
