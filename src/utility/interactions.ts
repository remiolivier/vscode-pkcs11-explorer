import * as vscode from 'vscode';
import * as graphene from 'graphene-pk11';
import { Handle } from './handleUtils';
import { Definitions } from '../model/definitions';

export interface SignVerifyMechanism {
	mechanism: graphene.MechanismType
}

export class Interactions {
	static userPinMap: Map<string, string> = new Map<string, string>();
	
	public static async saveUserPin(slotId: string, userPin: string) {
		if (userPin == null) {
			this.userPinMap.delete(slotId);
		}
		else {
			this.userPinMap.set(slotId, userPin);
		}
	}

	public static async getUserPin(slotId: string): Promise<string> {
		if (!this.userPinMap.has(slotId)) {
			this.userPinMap.set(slotId, await Interactions.showPasswordInputBox("User PIN"));
		}

		return this.userPinMap.get(slotId);
	}

	public static async invalidateUserPin(slotId: string): Promise<void> {
		if (this.userPinMap.has(slotId)) {
			this.userPinMap.delete(slotId);
		}
	}

	public static async getSoPin(slotId: string): Promise<string> {
		return await Interactions.showPasswordInputBox("SO PIN");
	}

	public static showInformationMessage(message: string): Thenable<string | undefined> {
		return vscode.window.showInformationMessage(message);
	}

	public static showErrorMessage(message: string): Thenable<string | undefined> {
		return vscode.window.showErrorMessage(message);
	}

	public static async showInputBox(prompt: string): Promise<string> {
		return await vscode.window.showInputBox({
			ignoreFocusOut: true,
			prompt: prompt,
		});
	}

	public static async showInputBoxWithQuickPickDataType(inputTypePrompt:string, prompt: string): Promise<Buffer> {
		const dataType = await Interactions.showQuickPick(
			Definitions.SupportedSignEncodingInputData, 
			inputTypePrompt);

		if (dataType == undefined) {
			return;
		}
		const data = await Interactions.showInputBox(`${prompt} in ${dataType} format.`);
		return Buffer.from(data, dataType as BufferEncoding);
	}

	public static async showMultipleInputBoxWithQuickPickDataType(inputTypePrompt:string, prompt: string): Promise<Buffer[]> {
		const dataType = await Interactions.showQuickPick(
			Definitions.SupportedSignEncodingInputData, 
			inputTypePrompt);

		if (dataType == undefined) {
			return;
		}

		const dataArray: Buffer[] = new Array<Buffer>();
		let data: string;
		const additionalInformation = "Press enter with no data to finalize the operation";
		do {
			data = await Interactions.showInputBox(`${prompt} in ${dataType} format.${dataArray.length > 0 ? " " + additionalInformation : "" }`);
			if (data != undefined && data != "") {
				dataArray.push(Buffer.from(data, dataType as BufferEncoding));
			}
		} while (data != undefined && data != "");

		return dataArray;
	}

	public static async showPasswordInputBox(prompt: string): Promise<string> {
		return await vscode.window.showInputBox({
			ignoreFocusOut: true,
			prompt: prompt,
			password: true
		});
	}

	public static async showYesNoQuickPick(placeholder?: string): Promise<boolean> {
		const answer = await vscode.window.showQuickPick(
			["yes", "no"],
			{
				canPickMany: false,
				ignoreFocusOut: true,
				placeHolder: placeholder
		});

		return answer == undefined ? undefined : answer == "yes";
	}

	public static async showOpenDialog(): Promise<vscode.Uri[]> {
		return await vscode.window.showOpenDialog(
		{
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false
		});
	}

	public static async showQuickPick(items: string[] | Thenable<string[]>, placeholder: string): Promise<string> {
		return await vscode.window.showQuickPick(
		items, 
		{
			canPickMany: false,
			ignoreFocusOut: true,
			placeHolder: placeholder
		});
	}

	public static async getObjectAttributeName(): Promise<string> {
		const attributes = Array.from(Definitions.AttributeNameTypes.keys());
		return await Interactions.showQuickPick(
			attributes, 
			"Attributes.");
	}

	public static async getSignVerifyData(keyType: graphene.KeyType): Promise<SignVerifyMechanism> {
		let mechanisms: string[];
		let signingMechanism: string;
		let questionAsked = false;

		if (keyType == graphene.KeyType.RSA) {
			mechanisms = Array.from(Definitions.SupportedRsaAlgorithms.keys());
			signingMechanism = await Interactions.showQuickPick(
				mechanisms, 
				"RSA mechanism.");
			
			questionAsked = true;

			signingMechanism = Definitions.SupportedRsaAlgorithms.get(signingMechanism);
		}
		else if (keyType == graphene.KeyType.EC || keyType == graphene.KeyType.ECDSA) {
			mechanisms = Array.from(Definitions.SupportedEccAlgorithms.keys());
			signingMechanism = await Interactions.showQuickPick(
				mechanisms, 
				"ECC mechanism.");
			
			questionAsked = true;
			
			signingMechanism = Definitions.SupportedEccAlgorithms.get(signingMechanism);
		}
		
		if (!signingMechanism && questionAsked) {
			return;
		}

		if (!signingMechanism || signingMechanism == "Custom")
		{
			mechanisms = Object.keys(graphene.MechanismEnum)
			.filter(key => !isNaN(Number(graphene.MechanismEnum[key])));
			signingMechanism = await Interactions.showQuickPick(
				mechanisms, 
				"Mechanism.");
		}

		if (signingMechanism == undefined) {
			return;
		}

		let mechanism: graphene.MechanismType;

        if (graphene.MechanismEnum[signingMechanism.toUpperCase() as any] !== undefined) {
            mechanism = graphene.MechanismEnum[signingMechanism.toUpperCase() as any];
        } else {
            Promise.reject("Unknown algorithm.");
        }

		return {
			mechanism: mechanism
		};
	}

	public static printSlotInfo(slot: graphene.Slot) {
		console.log("Slot info");
		console.log(`  Handle: ${Handle.toString(slot.handle)}`);
		console.log(`  Description: ${slot.slotDescription}`);
		console.log(`  Manufacturer ID: ${slot.manufacturerID}`);
		console.log(`  Firm version: ${slot.firmwareVersion.major}.${slot.firmwareVersion.minor}`);
		console.log(`  Hardware version: ${slot.hardwareVersion.major}.${slot.hardwareVersion.minor}`);
		console.log(`  Flags:`);
		console.log(`    HW: ${!!(slot.flags & graphene.SlotFlag.HW_SLOT)}`);
		console.log(`    Removable device: ${!!(slot.flags & graphene.SlotFlag.REMOVABLE_DEVICE)}`);
		console.log(`    Token present: ${!!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT)}`);
		if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
			console.log(`  Token:`);
			const token = slot.getToken();
			console.log(`    Label: ${token.label}`);
			console.log(`    Manufacturer ID: ${token.manufacturerID}`);
			console.log(`    Model: ${token.model}`);
			console.log(`    Serial number: ${token.serialNumber}`);
			console.log(`    Max PIN length: ${token.maxPinLen}`);
			console.log(`    Min PIN length: ${token.minPinLen}`);
			console.log(`    Max session count: ${token.maxSessionCount}`);
			console.log(`    Session count: ${token.sessionCount}`);
			console.log(`    Max RW session count: ${token.maxRwSessionCount}`);
			console.log(`    RW session count: ${token.rwSessionCount}`);
			console.log(`    Total private memory: ${token.totalPrivateMemory}`);
			console.log(`    Free private memory: ${token.freePrivateMemory}`);
			console.log(`    Total public memory: ${token.totalPublicMemory}`);
			console.log(`    Free public memory: ${token.freePublicMemory}`);
			console.log(`    Firm version: ${slot.firmwareVersion.major}.${slot.firmwareVersion.minor}`);
			console.log(`    Hardware version: ${slot.hardwareVersion.major}.${slot.hardwareVersion.minor}`);
			console.log(`    Flags:`);
			console.log(`      Initialized: ${!!(token.flags & graphene.TokenFlag.TOKEN_INITIALIZED)}`);
			console.log(`      Logged in: ${!!(token.flags & graphene.TokenFlag.USER_PIN_INITIALIZED)}`);
		}
		console.log();
	}
}