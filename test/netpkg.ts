export default class netpkg {

    //根据封包协议读取包体的长度
    public read_pkg_size(pkg_data: Buffer, offset: number) {

        if (offset > pkg_data.length - 2) { //没有办法获取长度信息
            return -1;
        }

        const len: number = pkg_data.readInt16BE(offset);
        return len;

    }

    //把一个要发送的数据，封包 2个字节的长度 注 1个字节是2的8次方
    //data string 二进制的Buffer
    public packafe_data(data: string | Buffer): Buffer {
        const buf = Buffer.allocUnsafe(2 + data.length);
        buf.writeInt16LE(2 + data.length, 0);
        buf.fill(data, 2);
        return buf
    }

    //模拟底层tcp 粘包的问题
    public test_pkg_two_action(action1, action2): Buffer {
        const buf: Buffer = Buffer.allocUnsafe(2 + 2 + action1.length + action2.length);
        buf.writeInt16LE(2 + action1.length, 0);
        buf.fill(action1,2);

        const offset = 2 + action1.length;
        buf.writeInt16LE(2+action2.length,offset);
        buf.fill(action2,offset+2);

        return buf;
    }


    //模拟一个打的数据包，分两次发送到客户端
    public test_pkg_two_slice(half_cmd1, half_cmd2) {
		// 
		const buf1 = Buffer.allocUnsafe(2 + half_cmd1.length);
		buf1.writeInt16LE(2 + half_cmd1.length +　half_cmd2.length, 0);
		buf1.fill(half_cmd1, 2);

		const buf2 = Buffer.allocUnsafe(half_cmd2.length);
		buf2.fill(half_cmd2, 0);

		return [buf1, buf2];
	}


} 