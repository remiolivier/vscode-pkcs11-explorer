import * as graphene from 'graphene-pk11';
import { Interactions, SignVerifyMechanism } from './interactions';

export class VerifyModel {
	readonly session: graphene.Session;

	constructor(session: graphene.Session) {
		this.session = session;
	}

	public async verify(key: graphene.PublicKey, keyType: graphene.KeyType): Promise<boolean> {
		const verifyMechanism: SignVerifyMechanism = await Interactions.getSignVerifyData(keyType);
		if (verifyMechanism == undefined) {
			return;
		}

		const signature = await Interactions.showInputBoxWithQuickPickDataType("Type of signature input.", "Signature to verify");
		if (signature == undefined) {
			return;
		}

		const data = await Interactions.showInputBoxWithQuickPickDataType("Type of data input.", "Data to verify");
		if (data == undefined) {
			return;
		}

		return this.session.createVerify(verifyMechanism.mechanism, key).once(data, signature);
	}

	public async verifyMultipart(key: graphene.PublicKey, keyType: graphene.KeyType): Promise<boolean> {
		const verifyMechanism: SignVerifyMechanism = await Interactions.getSignVerifyData(keyType);
		if (verifyMechanism == undefined) {
			return;
		}

		const signature = await Interactions.showInputBoxWithQuickPickDataType("Type of signature input.", "Signature to verify");
		if (signature == undefined) {
			return;
		}

		const dataArray: Buffer[] = await Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data to verify");
		if (dataArray == undefined || dataArray.length == 0) {
			return;
		}

		const verify: graphene.Verify = this.session.createVerify(verifyMechanism.mechanism, key);
		try {
			for (const data of dataArray) {
				verify.update(data);
			}
			return verify.final(signature);
		}
		catch (err) {
			try {
				verify.final(signature);
			} catch (err) { /* No action needed */}
			throw (err);
		}
	}
}