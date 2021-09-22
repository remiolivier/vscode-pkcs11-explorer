"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handle = void 0;
const bufferUtils_1 = require("./bufferUtils");
class Handle {
    /**
     * Converts PKCS11 Handle to string
     *
     * @static
     * @param {Buffer} buffer
     * @returns {string}
     */
    static toString(buffer) {
        return bufferUtils_1.BufferUtils.BufferToHexString(buffer);
    }
    /**
     * Converts hex value to PKCS11 Handle
     *
     * @static
     * @param {string} hex
     * @returns {Buffer}
     */
    static toBuffer(hex) {
        return bufferUtils_1.BufferUtils.HexStringToBuffer(hex);
    }
}
exports.Handle = Handle;
//# sourceMappingURL=handleUtils.js.map