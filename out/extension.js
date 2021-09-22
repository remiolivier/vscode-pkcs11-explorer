'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const pkcs11View_1 = require("./view/pkcs11View");
function activate(context) {
    new pkcs11View_1.Pkcs11View(context);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map