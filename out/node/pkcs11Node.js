"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11Node = void 0;
class Pkcs11Node {
    constructor(id, label, description, type, isExpandable) {
        this.id = id;
        this.description = description;
        this.label = label;
        this.type = type;
        this.isExpandable = isExpandable;
    }
}
exports.Pkcs11Node = Pkcs11Node;
//# sourceMappingURL=pkcs11Node.js.map