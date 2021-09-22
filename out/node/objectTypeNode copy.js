"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTypeNode = void 0;
const definitions_1 = require("../model/definitions");
const pkcs11Node_1 = require("./pkcs11Node");
class ObjectTypeNode extends pkcs11Node_1.Pkcs11Node {
    constructor(id, label, description, slotNode) {
        super(id, label, description, definitions_1.NodeType.ObjectType);
        this.slotNode = slotNode;
    }
}
exports.ObjectTypeNode = ObjectTypeNode;
//# sourceMappingURL=objectTypeNode%20copy.js.map