import { BufferUtils } from "./bufferUtils";

export class Handle {
    /**
     * Converts PKCS11 Handle to string
     *
     * @static
     * @param {Buffer} buffer
     * @returns {string}
     */
    public static toString(buffer: Buffer): string {
        return BufferUtils.BufferToHexString(buffer);
    }

    /**
     * Converts hex value to PKCS11 Handle
     *
     * @static
     * @param {string} hex
     * @returns {Buffer}
     */
    public static toBuffer(hex: string): Buffer {
        return BufferUtils.HexStringToBuffer(hex);
    }
}
