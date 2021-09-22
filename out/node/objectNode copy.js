"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectNode = void 0;
const pkcs11Node_1 = require("./pkcs11Node");
class ObjectNode extends pkcs11Node_1.Pkcs11Node {
    constructor(id, label, description, type, objectTypeNode) {
        super(id, label, description, type);
        this.objectTypeNode = objectTypeNode;
    }
}
exports.ObjectNode = ObjectNode;
//# sourceMappingURL=objectNode%20copy.js.map