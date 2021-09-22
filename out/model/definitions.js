"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Definitions = exports.RsaEncryptDecryptAlgorithms = exports.AesEncryptDecryptAlgorithms = exports.NodeType = void 0;
const graphene = require("graphene-pk11");
class NodeType {
}
exports.NodeType = NodeType;
NodeType.Module = "module";
NodeType.Slot = "slot";
NodeType.ObjectType = "type";
NodeType.CertificateObject = "CERTIFICATE";
NodeType.PublicKeyObject = "PUBLIC_KEY";
NodeType.PrivateKeyObject = "PRIVATE_KEY";
NodeType.DataObject = "DATA";
NodeType.SecretKeyObject = "SECRET_KEY";
class AesEncryptDecryptAlgorithms {
}
exports.AesEncryptDecryptAlgorithms = AesEncryptDecryptAlgorithms;
AesEncryptDecryptAlgorithms.AesCbc = "AES_CBC";
AesEncryptDecryptAlgorithms.AesCbcPad = "AES_CBC_PAD";
AesEncryptDecryptAlgorithms.AesCcm = "AES_CCM";
AesEncryptDecryptAlgorithms.AesGcm = "AES_GCM";
class RsaEncryptDecryptAlgorithms {
}
exports.RsaEncryptDecryptAlgorithms = RsaEncryptDecryptAlgorithms;
RsaEncryptDecryptAlgorithms.RsaOaep = "RSA_PKCS_OAEP";
RsaEncryptDecryptAlgorithms.RsaPkcs = "RSA_PKCS";
const TYPE_NUMBER = "number";
const TYPE_BOOL = "boolean";
const TYPE_STRING = "string";
const TYPE_BUFFER = "buffer";
const TYPE_DATE = "date";
class Definitions {
}
exports.Definitions = Definitions;
Definitions.BasicTemplate = {
    id: null,
    label: null
};
Definitions.CertificateTemplate = {
    id: null,
    label: null,
    certType: null
};
Definitions.PrivateKeyTemplate = {
    id: null,
    label: null,
    keyType: null
};
Definitions.ObjectTypesMap = new Map([
    ["Certificates", NodeType.CertificateObject],
    ["Data", NodeType.DataObject],
    ["Public keys", NodeType.PublicKeyObject],
    ["Private keys", NodeType.PrivateKeyObject],
    ["Secret keys", NodeType.SecretKeyObject]
]);
Definitions.ObjectTypeTemplateMap = new Map([
    [graphene.ObjectClass.CERTIFICATE, Definitions.CertificateTemplate],
    [graphene.ObjectClass.DATA, Definitions.BasicTemplate],
    [graphene.ObjectClass.PUBLIC_KEY, Definitions.BasicTemplate],
    [graphene.ObjectClass.PRIVATE_KEY, Definitions.PrivateKeyTemplate],
    [graphene.ObjectClass.SECRET_KEY, Definitions.PrivateKeyTemplate]
]);
Definitions.ObjectClassToType = new Map([
    [graphene.ObjectClass.CERTIFICATE, "CertType"],
    [graphene.ObjectClass.PRIVATE_KEY, "KeyType"],
    [graphene.ObjectClass.SECRET_KEY, "KeyType"]
]);
Definitions.SupportedDigestAlgorithms = [
    "SHA1",
    "SHA224",
    "SHA256",
    "SHA384",
    "SHA512",
    "MD5"
];
Definitions.SupportedRsaHashFunctionsEncryptDecryptAlgorithms = [
    "SHA1",
    "SHA224",
    "SHA256",
    "SHA384",
    "SHA512"
];
Definitions.SupportedRsaAlgorithms = new Map([
    ["SHA-1", "SHA1_RSA_PKCS"],
    ["SHA-224", "SHA224_RSA_PKCS"],
    ["SHA-256", "SHA256_RSA_PKCS"],
    ["SHA-384", "SHA384_RSA_PKCS"],
    ["SHA-512", "SHA512_RSA_PKCS"],
    ["Custom...", "Custom"]
]);
Definitions.SupportedEccAlgorithms = new Map([
    ["ECDSA", "ECDSA"],
    ["SHA-1", "ECDSA_SHA1"],
    ["SHA-224", "ECDSA_SHA224"],
    ["SHA-256", "ECDSA_SHA256"],
    ["SHA-384", "ECDSA_SHA384"],
    ["SHA-512", "ECDSA_SHA512"],
    ["Custom...", "Custom"]
]);
Definitions.SupportedRsaEncryptDecryptAlgorithms = [
    RsaEncryptDecryptAlgorithms.RsaOaep,
    RsaEncryptDecryptAlgorithms.RsaPkcs,
];
Definitions.SupportedAesEncryptDecryptAlgorithms = [
    AesEncryptDecryptAlgorithms.AesCbc,
    AesEncryptDecryptAlgorithms.AesCbcPad,
    AesEncryptDecryptAlgorithms.AesCcm,
    AesEncryptDecryptAlgorithms.AesGcm
];
Definitions.EncryptDecryptAlgorithmsByType = new Map([
    [graphene.KeyType.AES, Definitions.SupportedAesEncryptDecryptAlgorithms],
    [graphene.KeyType.RSA, Definitions.SupportedRsaEncryptDecryptAlgorithms],
    [graphene.KeyType.EC, Array.from(Definitions.SupportedEccAlgorithms.keys())],
    [graphene.KeyType.ECDSA, Array.from(Definitions.SupportedEccAlgorithms.keys())],
]);
Definitions.AttributeNameTypes = new Map([
    ["class", TYPE_NUMBER],
    ["token", TYPE_BOOL],
    ["private", TYPE_BOOL],
    ["label", TYPE_STRING],
    ["application", TYPE_STRING],
    ["value", TYPE_BUFFER],
    ["objectId", TYPE_BUFFER],
    ["certType", TYPE_NUMBER],
    ["issuer", TYPE_BUFFER],
    ["serial", TYPE_BUFFER],
    ["issuerAC", TYPE_BUFFER],
    ["owner", TYPE_BUFFER],
    ["attrTypes", TYPE_BUFFER],
    ["trusted", TYPE_BOOL],
    ["certCategory", TYPE_NUMBER],
    ["javaDomain", TYPE_NUMBER],
    ["url", TYPE_STRING],
    ["ski", TYPE_BUFFER],
    ["aki", TYPE_BUFFER],
    ["checkValue", TYPE_BUFFER],
    ["keyType", TYPE_NUMBER],
    ["subject", TYPE_BUFFER],
    ["id", TYPE_BUFFER],
    ["sensitive", TYPE_BOOL],
    ["encrypt", TYPE_BOOL],
    ["decrypt", TYPE_BOOL],
    ["wrap", TYPE_BOOL],
    ["unwrap", TYPE_BOOL],
    ["sign", TYPE_BOOL],
    ["signRecover", TYPE_BOOL],
    ["verify", TYPE_BOOL],
    ["verifyRecover", TYPE_BOOL],
    ["derive", TYPE_BOOL],
    ["startDate", TYPE_DATE],
    ["endDate", TYPE_DATE],
    ["modulus", TYPE_BUFFER],
    ["modulusBits", TYPE_NUMBER],
    ["publicExponent", TYPE_BUFFER],
    ["privateExponent", TYPE_BUFFER],
    ["prime1", TYPE_BUFFER],
    ["prime2", TYPE_BUFFER],
    ["exp1", TYPE_BUFFER],
    ["exp2", TYPE_BUFFER],
    ["coefficient", TYPE_BUFFER],
    ["prime", TYPE_BUFFER],
    ["subprime", TYPE_BUFFER],
    ["base", TYPE_BUFFER],
    ["primeBits", TYPE_NUMBER],
    ["subprimeBits", TYPE_NUMBER],
    ["valueBits", TYPE_NUMBER],
    ["valueLen", TYPE_NUMBER],
    ["extractable", TYPE_BOOL],
    ["local", TYPE_BOOL],
    ["neverExtractable", TYPE_BOOL],
    ["alwaysSensitive", TYPE_BOOL],
    ["keyGenMechanism", TYPE_NUMBER],
    ["modifiable", TYPE_BOOL],
    ["paramsECDSA", TYPE_BUFFER],
    ["paramsEC", TYPE_BUFFER],
    ["pointEC", TYPE_BUFFER],
    ["secondaryAuth", TYPE_BOOL],
    ["authPinFlags", TYPE_BUFFER],
    ["alwaysAuth", TYPE_BUFFER],
    ["wrapWithTrusted", TYPE_BUFFER],
    ["wrapTemplate", TYPE_BUFFER],
    ["unwrapTemplate", TYPE_BUFFER],
    ["otpFormat", TYPE_BUFFER],
    ["otpLength", TYPE_BUFFER],
    ["otpTimeInterval", TYPE_BUFFER],
    ["otpUserFriendlyMode", TYPE_BUFFER],
    ["otpChallengeReq", TYPE_BUFFER],
    ["otpTimeReq", TYPE_BUFFER],
    ["otpCounterReq", TYPE_BUFFER],
    ["otpPinReq", TYPE_BUFFER],
    ["otpCounter", TYPE_BUFFER],
    ["otpTime", TYPE_BUFFER],
    ["otpUserId", TYPE_BUFFER],
    ["otpServiceId", TYPE_BUFFER],
    ["otpServiceLogo", TYPE_BUFFER],
    ["otpServiceLogoType", TYPE_BUFFER],
    ["hwFeatureType", TYPE_BUFFER],
    ["resetOnInit", TYPE_BUFFER],
    ["hasReset", TYPE_BUFFER],
    ["pixelX", TYPE_BUFFER],
    ["pixelY", TYPE_BUFFER],
    ["resolution", TYPE_BUFFER],
    ["charRows", TYPE_BUFFER],
    ["charCols", TYPE_BUFFER],
    ["color", TYPE_BUFFER],
    ["bitsPerPixel", TYPE_BUFFER],
    ["charSets", TYPE_BUFFER],
    ["encMethod", TYPE_BUFFER],
    ["mimeTypes", TYPE_BUFFER],
    ["mechanismType", TYPE_BUFFER],
    ["requiredCmsAttrs", TYPE_BUFFER],
    ["defaultCmsAttrs", TYPE_BUFFER],
    ["supportedCmsAttrs", TYPE_BUFFER],
    ["allowedMechanisms", TYPE_BUFFER]
]);
Definitions.SupportedAesSizes = ["128", "192", "256"];
Definitions.SupportedRsaKeySizes = ["1024", "2048", "3072", "4096", "8129", "16384"];
Definitions.SupportedRsaPublicExponents = ["3", "5", "17", "257", "65537", "custom..."];
Definitions.SupportedEccNamedCurves = ["secp192r1", "secp256r1", "secp256k1"];
Definitions.SupportedCertificateOutput = ["pem", "ascii", "base64", "hex", "utf8"];
Definitions.SupportedEncodingOutput = ["ascii", "base64", "hex", "utf8"];
Definitions.SupportedSignEncodingInputData = ["ascii", "base64", "hex", "utf8"];
Definitions.SupportedSignEncodingOutputData = ["ascii", "base64", "hex", "utf8"];
//# sourceMappingURL=definitions.js.map