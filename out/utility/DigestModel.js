"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigestModel = void 0;
const interactions_1 = require("./interactions");
const bufferWithEncoding_1 = require("../model/bufferWithEncoding");
class DigestModel {
    constructor(session) {
        this.session = session;
    }
    async generate(digestMechanism) {
        const dataArray = await interactions_1.Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data");
        if (dataArray == undefined || dataArray.length == 0) {
            return;
        }
        const digest = this.session.createDigest({ name: digestMechanism, params: null });
        for (const data of dataArray) {
            digest.update(data);
        }
        const result = digest.final();
        return new bufferWithEncoding_1.BufferWithEncoding(result, "hex");
    }
}
exports.DigestModel = DigestModel;
//# sourceMappingURL=DigestModel.js.map