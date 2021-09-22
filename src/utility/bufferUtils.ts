
/**
 * Adds 0 if hex value has odd length
 *
 * @param {string} hex
 * @returns
 */
 function prepareHex(hex: string) {
    let res = hex;
    while (res.length < 16) {
        res = "0" + res;
    }
    return res;
}

/**
 * Reverts Buffer
 *
 * @param {Buffer} buffer
 * @returns
 */
function revertBuffer(buffer: Buffer) {
    if (buffer.length > 8) {
        throw new TypeError("Wrong Buffer size");
    }
    const b = Buffer.alloc(8);
    b.fill(0);
    for (let i = 0; i < buffer.length; i++) {
        b[buffer.length - 1 - i] = buffer[i];
    }
    return b;
}

/**
 * Converts Buffer to string and cut all 0s from the beginning
 *
 * @param {Buffer} buffer
 * @returns
 */
function bufferToHex(buffer: Buffer) {
    return buffer.toString("hex").replace(/^0*/, "");
}

export class BufferUtils {
	/**
	* Converts a Hex Buffer to string
	*
	* @static
	* @param {Buffer} buffer
	* @returns {string}
	*/
	public static BufferToHexString(buffer: Buffer): string {
		const buf = Buffer.alloc(8);
		buf.fill(0);
		for (let i = 0; i < buffer.length; i++) {
			buf[i] = buffer[i];
		}
		return "0x" + bufferToHex(revertBuffer(buf));
	}

    /**
     * Converts hex string to a buffer
     *
     * @static
     * @param {string} hex
     * @returns {Buffer}
     */
	public static HexStringToBuffer(hex: string): Buffer {
        return revertBuffer(Buffer.from(prepareHex(hex), "hex"));
    }
}