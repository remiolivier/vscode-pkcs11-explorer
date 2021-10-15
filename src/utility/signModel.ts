import * as graphene from 'graphene-pk11';
import { Interactions, SignVerifyMechanism } from './interactions';
import { Definitions } from '../model/definitions';
import { BufferWithEncoding } from '../model/bufferWithEncoding';

export class SignModel {
	readonly session: graphene.Session;

	constructor(session: graphene.Session) {
		this.session = session;
	}

	public async sign(key: graphene.PrivateKey, keyType: graphene.KeyType): Promise<BufferWithEncoding> {
		const signMechanism: SignVerifyMechanism = await Interactions.getSignVerifyData(keyType);
		if (signMechanism == undefined) {
			return;
		}
		
		const data = await Interactions.showInputBoxWithQuickPickDataType("Type of data input.", "Data to sign");
		if (data == undefined) {
			return;
		}

		const dataResultType = await Interactions.showQuickPick(
			Definitions.SupportedSignEncodingOutputData,
			"Type of data output.");

		if (dataResultType == undefined) {
			return;
		}

		const signature: Buffer = this.session.createSign(signMechanism.mechanism, key).once(data);
		return new BufferWithEncoding(signature, dataResultType);
	}

	public async signMultipart(key: graphene.PrivateKey, keyType: graphene.KeyType): Promise<BufferWithEncoding> {
		const signMechanism: SignVerifyMechanism = await Interactions.getSignVerifyData(keyType);
		if (signMechanism == undefined) {
			return;
		}
		
		const dataArray: Buffer[] = await Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data to sign");
		if (dataArray == undefined || dataArray.length == 0) {
			return;
		}

		const dataResultType = await Interactions.showQuickPick(
			Definitions.SupportedSignEncodingOutputData,
			"Type of data output.");

		if (dataResultType == undefined) {
			return;
		}

		let signature: Buffer;
		const sign: graphene.Sign = this.session.createSign(signMechanism.mechanism, key);

		try {
			for (const data of dataArray) {
				sign.update(data);
			}
			signature = sign.final();
		}
		catch (err) {
			try {
				sign.final();
			} catch (err) { /* No aciton needed */ }
			throw (err);
		}
        
		return new BufferWithEncoding(signature, dataResultType);
	}
}