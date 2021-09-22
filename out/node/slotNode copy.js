"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleNode = void 0;
const definitions_1 = require("../model/definitions");
const pkcs11Node_1 = require("./pkcs11Node");
class ModuleNode extends pkcs11Node_1.Pkcs11Node {
    constructor(id, label, description, slot) {
        super(id, label, description, definitions_1.NodeType.Slot);
        this.slot = slot;
    }
}
exports.ModuleNode = ModuleNode;
//# sourceMappingURL=slotNode%20copy.js.map