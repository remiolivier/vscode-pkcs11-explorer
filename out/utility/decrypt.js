"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encrypt = void 0;
const graphene = require("graphene-pk11");
const interactions_1 = require("./interactions");
const definitions_1 = require("../model/definitions");
class Encrypt {
    async decrypt(node) {
        const keyType = node.object.getAttribute("keyType");
        const mechanism = await this.getEncryptDecryptMechanism(keyType);
        if (mechanism == undefined) {
            return;
        }
        const encryptedData = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of encrypted data input.", "Data to decrypt");
        if (encryptedData == undefined || encryptedData.length == 0) {
            return;
        }
        const dataResultType = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedSignEncodingOutputData, "Type of data output.");
        if (dataResultType == undefined) {
            return;
        }
        let result = Buffer.from("");
        let decipher;
        try {
            const key = node.object.toType();
            const decipher = node.object.session.createDecipher(mechanism, key);
            const enc = decipher.update(encryptedData);
            result = Buffer.concat([enc, decipher.final()]);
        }
        catch (err) {
            try {
                // Always call final
                decipher.final();
            }
            catch (err) { /* ignore error*/ }
            interactions_1.Interactions.showErrorMessage(`Failed to decrypt data.\n${err}`);
            return;
        }
        return {
            data: result,
            encoding: dataResultType
        };
    }
    async decryptOnce(node) {
        const keyType = node.object.getAttribute("keyType");
        const mechanism = await this.getEncryptDecryptMechanism(keyType);
        if (mechanism == undefined) {
            return;
        }
        const encryptedData = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of encrypted data input.", "Data to decrypt");
        if (encryptedData == undefined || encryptedData.length == 0) {
            return;
        }
        const dataResultType = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedSignEncodingOutputData, "Type of data output.");
        if (dataResultType == undefined) {
            return;
        }
        let result = Buffer.from("");
        let decipher;
        try {
            const key = node.object.toType();
            result = node.object.session.createDecipher(mechanism, key).once(encryptedData, result);
        }
        catch (err) {
            try {
                // Always call final
                decipher.final();
            }
            catch (err) { /* ignore error*/ }
            interactions_1.Interactions.showErrorMessage(`Failed to decrypt data.\n${err}`);
            return;
        }
        return {
            data: result,
            encoding: dataResultType
        };
    }
    async getEncryptDecryptMechanism(keyType) {
        if (!definitions_1.Definitions.EncryptDecryptAlgorithmsByType.has(keyType)) {
            interactions_1.Interactions.showErrorMessage("Unsupported algorithm to encrypt/decrypt.");
            return;
        }
        const algorithms = definitions_1.Definitions.EncryptDecryptAlgorithmsByType.get(keyType);
        const mechanism = await interactions_1.Interactions.showQuickPick(algorithms, "Select the algorithm.");
        if (mechanism == undefined) {
            return;
        }
        // Handles RSA scenarios
        if (keyType == graphene.KeyType.RSA) {
            if (mechanism == definitions_1.RsaEncryptDecryptAlgorithms.RsaPkcs) {
                return definitions_1.RsaEncryptDecryptAlgorithms.RsaPkcs;
            }
            else if (mechanism == definitions_1.RsaEncryptDecryptAlgorithms.RsaOaep) {
                const hashFunction = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedRsaHashFunctionsEncryptDecryptAlgorithms, "Select the hash function.");
                if (hashFunction == undefined) {
                    return;
                }
                return {
                    name: definitions_1.RsaEncryptDecryptAlgorithms.RsaOaep,
                    params: new graphene.RsaOaepParams(graphene.MechanismEnum[hashFunction], graphene.RsaMgf["MGF1_" + hashFunction])
                };
            }
        }
        if (keyType == graphene.KeyType.EC || keyType == graphene.KeyType.ECDSA) {
            return "ECDSA";
        }
        if (keyType == graphene.KeyType.AES) {
            // Handle the rest
            const isIvRequested = await interactions_1.Interactions.showYesNoQuickPick("Use Initialization Vector?");
            let iv = Buffer.alloc(0);
            if (isIvRequested) {
                iv = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of initialization vector.", "Initialization Vector");
                if (iv == undefined) {
                    return;
                }
            }
            if (mechanism == definitions_1.AesEncryptDecryptAlgorithms.AesGcm) {
                const isAadRequested = await interactions_1.Interactions.showYesNoQuickPick("Use additional authenticated data?");
                let aad;
                if (isAadRequested) {
                    aad = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of additional authenticated data input.", "Additional Authenticated Data");
                    if (aad == undefined || aad.length == 0) {
                        return;
                    }
                }
                return {
                    name: mechanism,
                    params: isAadRequested ?
                        new graphene.AesGcm240Params(iv, aad) : // IV + AAD
                        new graphene.AesGcm240Params(iv) // IV
                };
            }
            return {
                name: mechanism,
                params: iv // IV
            };
        }
        interactions_1.Interactions.showErrorMessage("Unsupported key type: " + keyType.toString());
        return;
    }
}
exports.Encrypt = Encrypt;
//# sourceMappingURL=decrypt.js.map