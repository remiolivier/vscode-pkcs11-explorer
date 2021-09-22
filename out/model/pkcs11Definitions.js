"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Definitions = void 0;
const graphene = require("graphene-pk11");
class Definitions {
}
exports.Definitions = Definitions;
Definitions.basicTemplate = {
    id: null,
    label: null
};
Definitions.certificateTemplate = {
    id: null,
    label: null,
    certType: null
};
Definitions.privateKeyTemplate = {
    id: null,
    label: null,
    keyType: null
};
Definitions.objectTypeTemplateMap = new Map([
    [graphene.ObjectClass.CERTIFICATE, this.certificateTemplate],
    [graphene.ObjectClass.DATA, this.basicTemplate],
    [graphene.ObjectClass.PUBLIC_KEY, this.basicTemplate],
    [graphene.ObjectClass.PRIVATE_KEY, this.privateKeyTemplate],
    [graphene.ObjectClass.SECRET_KEY, this.privateKeyTemplate]
]);
Definitions.objectClassToType = new Map([
    [graphene.ObjectClass.CERTIFICATE, "CertType"],
    [graphene.ObjectClass.PRIVATE_KEY, "KeyType"],
    [graphene.ObjectClass.SECRET_KEY, "KeyType"]
]);
Definitions.supportedSignEncodingInputData = ["ascii", "base64", "hex", "utf8"];
Definitions.supportedSignEncodingOutputData = ["ascii", "base64", "hex", "utf8"];
//# sourceMappingURL=pkcs11Definitions.js.map