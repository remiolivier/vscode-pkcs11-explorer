import * as vscode from 'vscode';
import * as graphene from 'graphene-pk11';
import { Handle } from '../utility/handleUtils';
import { BufferWithEncoding } from '../model/bufferWithEncoding';
import { DigestResult } from '../utility/digestModel';


/**
 * Converts Buffer to string and cut all 0s from the beginning
 *
 * @param {Buffer} buffer
 * @returns
 */
function bufferToHex(buffer: Buffer) {
    return buffer.toString("hex").replace(/^0*/, "");
}


export class Pkcs11ExplorerOuputChannelView {
	public static readonly OutputChannelName = "PKCS#11 Explorer";
	
	protected outputChannel: vscode.OutputChannel;
	
	constructor() {
		this.outputChannel = vscode.window.createOutputChannel(Pkcs11ExplorerOuputChannelView.OutputChannelName);
	}
	
	public printModuleDescription(module: graphene.Module) {
		this.outputChannel.clear();
		this.outputChannel.show(true);

		this.outputChannel.appendLine("Module:");
		this.outputChannel.appendLine("\tCryptoki version: " + module.cryptokiVersion.major + "." + module.cryptokiVersion.minor);
		this.outputChannel.appendLine("\tLibrary file: " + module.libFile);
		this.outputChannel.appendLine("\tLibrary name: " + module.libName);
		this.outputChannel.appendLine("\tLibrary description: " + module.libraryDescription);
		this.outputChannel.appendLine("\tLibrary version: " + module.libraryVersion.major + "." + module.libraryVersion.minor);
		this.outputChannel.appendLine("\tManufacturer ID: " + module.manufacturerID);
	}

	public printSlotDescription(slot: graphene.Slot) {
		this.outputChannel.clear();
		this.outputChannel.show(true);

		this.outputChannel.appendLine("Slot ID " + Handle.toString(slot.handle));
		this.outputChannel.appendLine("\tLabel: " + slot.getToken().label);
		this.outputChannel.appendLine("\tDescription: " + slot.slotDescription);
		this.outputChannel.appendLine("\tSerial: " + slot.getToken().serialNumber);
		this.outputChannel.appendLine("\tFirmware version: " + slot.firmwareVersion.major + "." + slot.firmwareVersion.minor);
		this.outputChannel.appendLine("\tHardware version: " + slot.hardwareVersion.major + "." + slot.hardwareVersion.minor);
		this.outputChannel.appendLine("\tManufacturer ID: " + slot.manufacturerID);
		this.outputChannel.appendLine("\tPassword(min/max): " + slot.getToken().minPinLen + "/" + slot.getToken().maxPinLen);
		this.outputChannel.appendLine("\tIs hardware: " + !!(slot.flags & graphene.SlotFlag.HW_SLOT));
		this.outputChannel.appendLine("\tIs removable: " + !!(slot.flags & graphene.SlotFlag.REMOVABLE_DEVICE));
		this.outputChannel.appendLine("\tIs initialized: " + !!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT));
	}

	public printSlotAvailableMechanisms(slot: graphene.Slot) {
		this.outputChannel.clear();
		this.outputChannel.show(true);

		this.outputChannel.appendLine("Mechanisms:");
		this.outputChannel.appendLine("Name                       h/s/v/e/d/w/u");
		this.outputChannel.appendLine("========================================");
		
		function b(v) {
			return v ? "+" : "-";
		}

		function s(v) {
			v = v.toString();
			for (let i_1 = v.length; i_1 < 27; i_1++) {
				v += " ";
			}
			return v;
		}

		const mechs = slot.getMechanisms();
		for (let j = 0; j < mechs.length; j++) {
			const mech = mechs.items(j);
			this.outputChannel.appendLine(s(mech.name) +
				b(mech.flags & graphene.MechanismFlag.DIGEST) + "/" +
				b(mech.flags & graphene.MechanismFlag.SIGN) + "/" +
				b(mech.flags & graphene.MechanismFlag.VERIFY) + "/" +
				b(mech.flags & graphene.MechanismFlag.ENCRYPT) + "/" +
				b(mech.flags & graphene.MechanismFlag.DECRYPT) + "/" +
				b(mech.flags & graphene.MechanismFlag.WRAP) + "/" +
				b(mech.flags & graphene.MechanismFlag.UNWRAP));
		}
	}

	public print(data: string) {
		this.outputChannel.clear();
		this.outputChannel.show(true);
		
		this.outputChannel.appendLine(data);
	}

	public printSignature(keyName: string, signature: BufferWithEncoding) {
		this.outputChannel.clear();
		this.outputChannel.show(true);
		
		this.outputChannel.appendLine("Signed data with key '" + keyName + "'");
		this.outputChannel.appendLine("\n" + signature.toString());
	}

	public printAttribute(attributeName: string, value: Buffer) {
		this.outputChannel.clear();
		this.outputChannel.show(true);
		
		this.outputChannel.appendLine("Attribute:");
		this.printSingleAttribute(attributeName, value);
	}

	public printBufferWithEncoding(value: BufferWithEncoding) {
		this.outputChannel.clear();
		this.outputChannel.show(true);
		
		this.outputChannel.appendLine(value.toString());
	}

	public printAttributes(attributes: Map<string, Buffer>) {
		this.outputChannel.clear();
		this.outputChannel.show(true);
		
		this.outputChannel.appendLine("Attributes:");
		
		for (const [key, value] of attributes) {
			this.printSingleAttribute(key, value);
		}
	}

	public printDigest(digest: DigestResult) {
		this.outputChannel.clear();
		this.outputChannel.show(true);
		
		this.outputChannel.appendLine(`Hash ${digest.mechanism}: ${digest.data.toString()}`);
	}

	public printEncrypt(data: BufferWithEncoding) {
		this.outputChannel.clear();
		this.outputChannel.show(true);
		
		this.outputChannel.appendLine("Encrypted data:");
		this.outputChannel.appendLine(data.toString());
	}

	public printDecrypt(data: BufferWithEncoding) {
		this.outputChannel.clear();
		this.outputChannel.show(true);
		
		this.outputChannel.appendLine("Decrypted data:");
		this.outputChannel.appendLine(data.toString());
	}

	private printSingleAttribute(attributeName: string, value: Buffer) {
		if (Object.prototype.toString.call(value).endsWith("Array]")) {
			this.outputChannel.appendLine("\t" + attributeName + ": " + value.toString("base64"));
		}
		else if (attributeName == "id") {
			this.outputChannel.appendLine("\t" + attributeName + ": " + Handle.toString(value));
		}
		else {
			this.outputChannel.appendLine("\t" + attributeName + ": " + value);
		}
	}
}