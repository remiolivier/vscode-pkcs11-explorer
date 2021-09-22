import * as graphene from 'graphene-pk11';
import { Interactions } from './interactions';
import { BufferWithEncoding } from '../model/bufferWithEncoding';
import { Definitions } from '../model/definitions';

export interface DigestResult {
	data: BufferWithEncoding,
	mechanism: string
}

export class DigestModel {
	session: graphene.Session;

	constructor(session: graphene.Session) {
		this.session = session;
	}

	public async generate(): Promise<DigestResult> {	
		const digestMechanism = await Interactions.showQuickPick(
			Definitions.SupportedDigestAlgorithms, 
			"Digest mechanism.");
		if (digestMechanism == undefined) {
			return;
		}

		const dataArray: Buffer[] = await Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data");
		if (dataArray == undefined || dataArray.length == 0) {
			return;
		}

		let result: Buffer;
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
			} catch (err) { /* No action needed */}
			throw (err);
		}

		return {
			data: new BufferWithEncoding(result, "hex"),
			mechanism: digestMechanism
		};
	}
}