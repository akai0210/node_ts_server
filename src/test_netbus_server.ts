import netbus, { PROTO_TYPE } from './netbus/netbus';

const netbug = new netbus();
export default class test_netbus_server {

    private static _instance: test_netbus_server;

    public static get Instance(): test_netbus_server {
        if (!test_netbus_server._instance) {
            test_netbus_server._instance = new test_netbus_server();
        }

        return test_netbus_server._instance;


    }

    constructor(){
        this._start_server();
    }

    private _start_server(): void {
        //tcp服务
        netbug.start_tcp_server("127.0.0.1",6080,PROTO_TYPE.PROTO_BUF);
        // netbug.start_tcp_server("127.0.0.1",6080,PROTO_TYPE.PROTO_JSON);
        

        //ws服务
        netbug.start_ws_server("127.0.0.1",6081,PROTO_TYPE.PROTO_BUF);
        // netbug.start_ws_server("127.0.0.1",6081,PROTO_TYPE.PROTO_JSON);
        




    }



}