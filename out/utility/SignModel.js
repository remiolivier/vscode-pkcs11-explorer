"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignModel = void 0;
const interactions_1 = require("./interactions");
const definitions_1 = require("../model/definitions");
class SignModel {
    constructor(session) {
        this.session = session;
    }
    async sign(key, keyType) {
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
            signature = this.session.createSign(signMechanism.mechanism, key).once(data);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to sign data.\n${err}`);
            return;
        }
        return {
            data: signature,
            encoding: dataResultType
        };
    }
    async signMultipart(key, keyType) {
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
            const sign = this.session.createSign(signMechanism.mechanism, key);
            for (const data of dataArray) {
                sign.update(data);
            }
            signature = sign.final();
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to sign data.\n${err}`);
            return;
        }
        return {
            data: signature,
            encoding: dataResultType
        };
    }
}
exports.SignModel = SignModel;
//# sourceMappingURL=SignModel.js.map