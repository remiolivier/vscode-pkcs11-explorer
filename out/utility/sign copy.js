"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11Model = void 0;
const interactions_1 = require("./interactions");
const pkcs11ExplorerOuputChannelView_1 = require("../provider/pkcs11ExplorerOuputChannelView");
const definitions_1 = require("../model/definitions");
const vscode_1 = require("vscode");
class Pkcs11Model extends vscode_1.Disposable {
    constructor() {
        super(...arguments);
        this.outputChannel = new pkcs11ExplorerOuputChannelView_1.Pkcs11ExplorerOuputChannelView();
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
}
exports.Pkcs11Model = Pkcs11Model;
//# sourceMappingURL=sign%20copy.js.map