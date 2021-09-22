"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferWithEncoding = void 0;
class BufferWithEncoding {
    constructor(data, encoding) {
        this.toString = () => {
            return this.data.toString(this.encoding);
        };
        this.data = data;
        this.encoding = encoding;
    }
}
exports.BufferWithEncoding = BufferWithEncoding;
//# sourceMappingURL=bufferWithEncoding.js.map