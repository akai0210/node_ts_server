import express from 'express';
import path from 'path';

class Main {
    private _app: express.Application;
    private _server_port: number = 6080;

    constructor() {
        this._app = express();
        this._start_server();
    }

    /**启动服务器 */
    private _start_server(): void {
        this._app.listen(this._server_port, () => {
            console.log("server start at success, port is " + this._server_port);
        })
    }
}
