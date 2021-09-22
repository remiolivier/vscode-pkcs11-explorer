"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handle = void 0;
class Handle {
    /**
     * Converts PKCS11 Handle to string
     *
     * @static
     * @param {Buffer} buffer
     * @returns {string}
     */
    static toString(buffer) {
        const buf = Buffer.alloc(8);
        buf.fill(0);
        for (let i = 0; i < buffer.length; i++) {
            buf[i] = buffer[i];
        }
        return "0x" + buffer_to_hex(revert_buffer(buf));
    }
    /**
     * Converts hex value to PKCS11 Handle
     *
     * @static
     * @param {string} hex
     * @returns {Buffer}
     */
    static toBuffer(hex) {
        return revert_buffer(Buffer.from(prepare_hex(hex), "hex"));
    }
}
exports.Handle = Handle;
/**
 * Adds 0 if hex value has odd length
 *
 * @param {string} hex
 * @returns
 */
function prepare_hex(hex) {
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
function revert_buffer(buffer) {
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
function buffer_to_hex(buffer) {
    return buffer.toString("hex").replace(/^0*/, "");
}
//# sourceMappingURL=handleUtils.js.map