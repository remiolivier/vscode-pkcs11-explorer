export class BufferWithEncoding {
	data: Buffer;
	encoding: BufferEncoding;

	constructor(data: Buffer, encoding: string) {
		this.data = data;
		this.encoding = encoding as BufferEncoding;
	}

    public toString = () : string => {
        return this.data.toString(this.encoding);
    }
}