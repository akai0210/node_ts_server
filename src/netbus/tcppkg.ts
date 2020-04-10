export class Tcppkg {

    private static _instance: Tcppkg;
    public static get Instance(): Tcppkg {
        if (!Tcppkg._instance) {
            Tcppkg._instance = new Tcppkg();
        }
        return Tcppkg._instance;
    }

    /**根据封包协议读取包体的长度 */
    public read_pkc_size(pkg_data: Buffer, offset: number): number {
        if (offset > pkg_data.length - 2) {
            return -1;
        }

        let _length = pkg_data.readUInt16LE(offset);
        return _length;
    }

    /**包体数据 */
    public packge_data(data): Buffer {
        const _buf = Buffer.allocUnsafe(2 + data.length);//返回一个指定大小的 Buffer 实例，但是它不会被初始化，所以它可能包含敏感的数据
        _buf.writeInt16LE(2 + data.length, 0);//根据传入的 offset 偏移量和指定的 endian 格式将 value 写入 buffer
        _buf.fill(data, 2);//使用指定的 value 来填充这个 buffer。如果没有指定 offset (默认是 0) 并且 end (默认是 buffer.length) ，将会填充整个buffer。
        return _buf;
    }

}