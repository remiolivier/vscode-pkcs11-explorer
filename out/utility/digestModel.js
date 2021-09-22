"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigestModel = void 0;
const interactions_1 = require("./interactions");
const bufferWithEncoding_1 = require("../model/bufferWithEncoding");
const definitions_1 = require("../model/definitions");
class DigestModel {
    constructor(session) {
        this.session = session;
    }
    async generate() {
        const digestMechanism = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedDigestAlgorithms, "Digest mechanism.");
        if (digestMechanism == undefined) {
            return;
        }
        const dataArray = await interactions_1.Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data");
        if (dataArray == undefined || dataArray.length == 0) {
            return;
        }
        let result;
        const digest = this.session.createDigest({ name: digestMechanism, params: null });
        try {
            for (const data of dataArray) {
                digest.update(data);
            }
            result = digest.final();
        }
        catch (err) {
            try {
                digest.final();
            }
            catch (err) { /* No action needed */ }
            throw (err);
        }
        return {
            data: new bufferWithEncoding_1.BufferWithEncoding(result, "hex"),
            mechanism: digestMechanism
        };
    }
}
exports.DigestModel = DigestModel;
//# sourceMappingURL=digestModel.js.map