import * as graphene from 'graphene-pk11';
import { Interactions } from './interactions';
import { Definitions, AesEncryptDecryptAlgorithms, RsaEncryptDecryptAlgorithms } from '../model/definitions';
import { BufferWithEncoding } from '../model/bufferWithEncoding';

export class EncryptModel {
	readonly session: graphene.Session;

	constructor(session: graphene.Session) {
		this.session = session;
	}
	
	public async encrypt(key: graphene.Key, keyType: graphene.KeyType): Promise<BufferWithEncoding> {
		if (keyType == graphene.KeyType.RSA) {
			return this.performEncryptOnce(key, keyType);
		}
		else {
			return this.performEncrypt(key, keyType);
		}
	}

	protected async performEncrypt(key: graphene.Key, keyType: graphene.KeyType): Promise<BufferWithEncoding> {
		const mechanism = await this.getEncryptDecryptMechanism(keyType);
		if (mechanism == undefined) {
			return;
		}

		const dataArray: Buffer[] = await Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data to encrypt");
		if (dataArray == undefined) {
			return;
		}

		const dataResultType = await Interactions.showQuickPick(
			Definitions.SupportedSignEncodingOutputData,
			"Type of data output.");

		if (dataResultType == undefined) {
			return;
		}

		let result: Buffer = Buffer.alloc(0);
		const cipher = this.session.createCipher(mechanism, key);

		try {
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
			catch (err) { /* No action needed */ }
			throw (err);
		}
        
		return new BufferWithEncoding(result, dataResultType);
	}

	protected async performEncryptOnce(key: graphene.Key, keyType: graphene.KeyType): Promise<BufferWithEncoding> {
		const mechanism = await this.getEncryptDecryptMechanism(keyType);
		if (mechanism == undefined) {
			return;
		}

		const data: Buffer = await Interactions.showInputBoxWithQuickPickDataType("Type of data input.", "Data to encrypt");
		if (data == undefined || data.length == 0) {
			return;
		}

		const dataResultType = await Interactions.showQuickPick(
			Definitions.SupportedSignEncodingOutputData,
			"Type of data output.");

		if (dataResultType == undefined) {
			return;
		}

		let result: Buffer = Buffer.alloc(4096);

		let cipher: graphene.Cipher;
		try {
			const cipher = this.session.createCipher(mechanism, key);
			result = cipher.once(data, result);
		
		}
		catch (err) {
			try {
				// Always call final
				cipher.final();
			}
			catch (err) { /* ignore error*/ }

			Interactions.showErrorMessage(`Failed to encrypt data once.\n${err}`);
			return;
		}
        
		return new BufferWithEncoding(result, dataResultType);
	}

	private async getEncryptDecryptMechanism(keyType: graphene.KeyType): Promise<graphene.MechanismType> {
		if (!Definitions.EncryptDecryptAlgorithmsByType.has(keyType)) {
			Interactions.showErrorMessage("Unsupported algorithm to encrypt/decrypt.");
			return;
		}

		const algorithms = Definitions.EncryptDecryptAlgorithmsByType.get(keyType);
		const mechanism = await Interactions.showQuickPick(
			algorithms, 
			"Select the algorithm.");
		if (mechanism == undefined) {
			return;
		}

		// Handles RSA scenarios
		if (keyType == graphene.KeyType.RSA) {
			if (mechanism == RsaEncryptDecryptAlgorithms.RsaPkcs) {
				return RsaEncryptDecryptAlgorithms.RsaPkcs;
			}
			else if (mechanism == RsaEncryptDecryptAlgorithms.RsaOaep) {
				const hashFunction = await Interactions.showQuickPick(
					Definitions.SupportedRsaHashFunctionsEncryptDecryptAlgorithms, 
					"Select the hash function.");
				if (hashFunction == undefined) {
					return;
				}

				return {
					name: RsaEncryptDecryptAlgorithms.RsaOaep,
					params: new graphene.RsaOaepParams(graphene.MechanismEnum[hashFunction], graphene.RsaMgf["MGF1_" + hashFunction])
				};
			}
		}

		if (keyType == graphene.KeyType.AES) {
			// Handle the rest
			const isIvRequested = await Interactions.showYesNoQuickPick("Use Initialization Vector?");
			let iv: Buffer = Buffer.alloc(0);		
			if (isIvRequested) {
				iv = await Interactions.showInputBoxWithQuickPickDataType("Type of initialization vector.", "Initialization Vector");
				if (iv == undefined) {
					return;
				}
			}

			if (mechanism == AesEncryptDecryptAlgorithms.AesGcm) {
				const isAadRequested = await Interactions.showYesNoQuickPick("Use additional authenticated data?");
				let aad: Buffer;
				if (isAadRequested) {
					aad = await Interactions.showInputBoxWithQuickPickDataType("Type of additional authenticated data input.", "Additional Authenticated Data");
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

		Interactions.showErrorMessage("Unsupported key type: " + keyType.toString());
		return;
	}
}