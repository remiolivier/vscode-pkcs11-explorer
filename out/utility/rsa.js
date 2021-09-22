"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RsaKey = void 0;
const graphene = require("graphene-pk11");
const interactions_1 = require("./interactions");
const pkcs11ExplorerOuputChannelView_1 = require("../provider/pkcs11ExplorerOuputChannelView");
const definitions_1 = require("../model/definitions");
const mutex_1 = require("./mutex");
class RsaKey {
    constructor() {
        this.outputChannel = new pkcs11ExplorerOuputChannelView_1.Pkcs11ExplorerOuputChannelView();
        this.openSessionMutex = new mutex_1.Mutex();
    }
    async sign(node) {
        const keyType = node.object.getAttribute("keyType");
        const signMechanism = await interactions_1.Interactions.getSignVerifyData(keyType);
        if (signMechanism == undefined) {
            return;
        }
        const data = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of data input.", "Data to sign");
        if (data == undefined) {
            return;
        }
        const dataResultType = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedSignEncodingOutputData, "Type of data output.");
        if (dataResultType == undefined) {
            return;
        }
        let signature;
        try {
            const privObj = node.object.toType();
            signature = node.object.session.createSign(signMechanism.mechanism, privObj).once(data);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to sign data.\n${err}`);
            return;
        }
        this.outputChannel.printSignature(node.label, signature, dataResultType);
    }
    async signMultipart(node) {
        const keyType = node.object.getAttribute("keyType");
        const signMechanism = await interactions_1.Interactions.getSignVerifyData(keyType);
        if (signMechanism == undefined) {
            return;
        }
        const dataArray = await interactions_1.Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data to sign");
        if (dataArray == undefined || dataArray.length == 0) {
            return;
        }
        const dataResultType = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedSignEncodingOutputData, "Type of data output.");
        if (dataResultType == undefined) {
            return;
        }
        let signature;
        try {
            const privObj = node.object.toType();
            const sign = node.object.session.createSign(signMechanism.mechanism, privObj);
            for (const data of dataArray) {
                sign.update(data);
            }
            signature = sign.final();
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to sign data.\n${err}`);
            return;
        }
        this.outputChannel.printSignature(node.label, signature, dataResultType);
    }
    async verify(node) {
        const keyType = node.object.getAttribute("keyType");
        const verifyMechanism = await interactions_1.Interactions.getSignVerifyData(keyType);
        if (verifyMechanism == undefined) {
            return;
        }
        const signature = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of signature input.", "Signature to verify");
        if (signature == undefined) {
            return;
        }
        const data = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of data input.", "Data to verify");
        if (data == undefined) {
            return;
        }
        let isVerified;
        try {
            const pubKey = node.object.toType();
            isVerified = node.object.session.createVerify(verifyMechanism.mechanism, pubKey).once(data, signature);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to verify data.\n${err}`);
            return;
        }
        if (isVerified) {
            interactions_1.Interactions.showInformationMessage("Signature verified successfully");
        }
        else {
            interactions_1.Interactions.showErrorMessage("Invalid Signature.");
        }
    }
    async verifyMultipart(node) {
        const keyType = node.object.getAttribute("keyType");
        const verifyMechanism = await interactions_1.Interactions.getSignVerifyData(keyType);
        if (verifyMechanism == undefined) {
            return;
        }
        const signature = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of signature input.", "Signature to verify");
        if (signature == undefined) {
            return;
        }
        const dataArray = await interactions_1.Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data to verify");
        if (dataArray == undefined || dataArray.length == 0) {
            return;
        }
        let isVerified;
        try {
            const pubKey = node.object.toType();
            const verify = node.object.session.createVerify(verifyMechanism.mechanism, pubKey);
            for (const data of dataArray) {
                verify.update(data);
            }
            isVerified = verify.final(signature);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to verify data.\n${err}`);
            return;
        }
        if (isVerified) {
            interactions_1.Interactions.showInformationMessage("Signature verified successfully");
        }
        else {
            interactions_1.Interactions.showErrorMessage("Invalid Signature.");
        }
    }
    async encrypt(node) {
        const keyType = node.object.getAttribute("keyType");
        const mechanism = await this.getEncryptDecryptMechanism(keyType);
        if (mechanism == undefined) {
            return;
        }
        const dataArray = await interactions_1.Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data to encrypt");
        if (dataArray == undefined) {
            return;
        }
        const dataResultType = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedSignEncodingOutputData, "Type of data output.");
        if (dataResultType == undefined) {
            return;
        }
        let result = Buffer.alloc(0);
        let cipher;
        try {
            const key = node.object.toType();
            // const cipher = node.object.session.createCipher(mechanism, key as graphene.PublicKey);
            // const encrypted = Buffer.alloc(4096);
            // const enc = cipher.once(dataArray[0], encrypted);
            // result = enc;
            const cipher = node.object.session.createCipher(mechanism, key);
            for (const data of dataArray) {
                const enc = cipher.update(data);
                result = Buffer.concat([result, enc]);
            }
            result = Buffer.concat([result, cipher.final()]);
        }
        catch (err) {
            try {
                // Always call final
                cipher.final();
            }
            catch (err) { /* ignore error*/ }
            interactions_1.Interactions.showErrorMessage(`Failed to encrypt data.\n${err}`);
            return;
        }
        this.outputChannel.printEncrypt(result, dataResultType);
    }
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
        this.outputChannel.printDecrypt(result, dataResultType);
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
                // return {
                // 	name: RsaEncryptDecryptAlgorithms.RsaOaep,
                // 	params: new graphene.RsaOaepParams(graphene.MechanismEnum[hashFunction], graphene.RsaMgf["MGF1_" + hashFunction])
                // };
                return { name: "RSA_PKCS_OAEP", params: new graphene.RsaOaepParams() };
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
exports.RsaKey = RsaKey;
//# sourceMappingURL=rsa.js.map