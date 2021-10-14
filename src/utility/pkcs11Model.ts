import * as graphene from 'graphene-pk11';
import * as fs from 'fs';
import { Pkcs11ExplorerConfiguration } from "./pkcs11ExplorerConfiguration";
import { Pkcs11Node } from '../node/pkcs11Node';
import { Interactions } from './interactions';
import { Handle } from './handleUtils';
import { Pkcs11ExplorerOuputChannelView } from '../provider/pkcs11ExplorerOuputChannelView';
import { Definitions } from '../model/definitions';
import { ModuleNode } from '../node/moduleNode';
import { SlotNode } from '../node/slotNode';
import { ObjectTypeNode } from '../node/objectTypeNode';
import { ObjectNode } from '../node/objectNode';
import { Disposable } from 'vscode';
import { Mutex } from './mutex';
import { SignModel } from './signModel';
import { BufferWithEncoding } from '../model/bufferWithEncoding';
import { VerifyModel } from './verifyModel';
import { EncryptModel } from './encryptModel';
import { DecryptModel } from './decryptModel';
import { DigestModel, DigestResult } from './digestModel';

export class Pkcs11Model extends Disposable {
	configuration: Pkcs11ExplorerConfiguration;
	modules: Map<string, graphene.Module> = new Map<string, graphene.Module>();
	outputChannel: Pkcs11ExplorerOuputChannelView = new Pkcs11ExplorerOuputChannelView();
	openSessionMutex: Mutex = new Mutex();
	
	constructor(configuration: Pkcs11ExplorerConfiguration) {
		super(() => this.dispose());
		this.configuration = configuration;
	}

	public dispose() {
		for(const module of this.modules) {
			try {
				this.closeModule(module[1]);
			}
			catch(err) {
				console.log("Close module failed.\n" + err);
			}
		}
	}

	public async addModule() {
		const moduleName = await Interactions.showInputBox("The friendly name for this module");
		
		if (!moduleName) {
			return;
		}

		const modulePath = await Interactions.showOpenDialog();

		if (modulePath == undefined) {
			return;
		}

		if (!fs.existsSync(modulePath[0].path)) {
			Interactions.showErrorMessage(`Could not add the '${moduleName}' module. '${modulePath}' does not exist.`);
			return;
		}

		const modulesConfiguration = this.configuration.getModules();

		if(modulesConfiguration && modulesConfiguration.has(moduleName)) {
			Interactions.showErrorMessage("Module already exists.");
			return;
		}

		this.configuration.addModule(moduleName, modulePath[0].path);
		Interactions.showInformationMessage("Module added.");
	}

	public getModules() : Thenable<Pkcs11Node[]> {
		const moduleNodes: Pkcs11Node[] = [];

		const modulesConfiguration = this.configuration.getModules();
		if (modulesConfiguration) {
			for (const [key, value] of modulesConfiguration) {
				try {
					if (!this.modules.has(key)) {
						console.log(`Module '${key}' not found, loading module...`);
		
						const module: graphene.Module = graphene.Module.load(value, key);
						module.initialize();
						this.modules.set(key, module);
					}
					console.log(`Module '${key}' loaded.`);
					moduleNodes.push(new ModuleNode(key, key, value, true));
				}
				catch (err) {
					moduleNodes.push(new ModuleNode(key, key, "Failed to initialize", false));
					Interactions.showErrorMessage(`Failed to load module '${key}' with error: ${err.message}`);
				}
			}
		}

		return Promise.resolve(moduleNodes);
	}

	public getSlots(moduleName: string) : Thenable<Pkcs11Node[]> {
		const module: graphene.Module = this.modules.get(moduleName);
		const slots = module.getSlots();

		const nodes:Pkcs11Node[] = [];

		if (slots.length > 0) {
			for (let i = 0; i < slots.length; i++) {
				const slot = slots.items(i);

				let label: string;
				let isExpandable: boolean;

				if ((slot.flags & graphene.SlotFlag.TOKEN_PRESENT) 
					&& (slot.getToken().flags & graphene.TokenFlag.TOKEN_INITIALIZED)) {
					label = `${slot.getToken().label} (${Handle.toString(slot.handle)})`;
					isExpandable = true;
				}
				else {
					label = `${Handle.toString(slot.handle)} (Not initialized)`;
					isExpandable = false;
				}

				nodes.push(new SlotNode(
					slot.handle.toString(),
					label,
					slot.slotDescription,
					isExpandable,
					slot)
				);
			}
		}

		return Promise.resolve(nodes);
	}

	public getObjectTypes(slotNode: SlotNode) : Thenable<Pkcs11Node[]> {
		const types:ObjectTypeNode[] = new Array<ObjectTypeNode>();
		
		for(const objectType of Definitions.ObjectTypesMap) {
			types.push(new ObjectTypeNode(objectType[1], objectType[0], "", true, slotNode));
		}

		return Promise.resolve(types);
	}

	protected formatLabel(id: string, label: string) : string {
		if (id == label) {
			return id;
		}
		else if (!label) {
			return id;
		}
		else {
			return label;
		}
	}

	protected formatDescription(attributes: graphene.ITemplate, certTypeLabel: string) : string {
		let certKeyType = "Unknown";
		
		if (graphene.CertificateType[attributes.certType]) {
			certKeyType =  graphene.CertificateType[attributes.certType];
		}
		else if (graphene.KeyType[attributes.keyType]) {
			certKeyType = graphene.KeyType[attributes.keyType];
		}

		return `id: ${Buffer.from(attributes.id).toString("hex")}\nlabel: ${Buffer.from(attributes.label).toString()}\n${certTypeLabel}: ${certKeyType}`;
	}

	public async openSession(slotNode: SlotNode): Promise<graphene.Session> {
		let session: graphene.Session;
		const slot = slotNode.slot;

		if (!slotNode.session) {
			const unlock = await this.openSessionMutex.lock();

			try {
				if (!slotNode.session) {
					session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);	
					
					if (slot.getToken().flags & graphene.TokenFlag.USER_PIN_INITIALIZED
						&& session.state < 3) {
						const userPin = await Interactions.getUserPin(Handle.toString(slot.handle));
						session.login(userPin);
						Interactions.saveUserPin(Handle.toString(slot.handle), userPin);
					}
		
					slotNode.session = session;
				}
			}
			finally {
				await Interactions.invalidateUserPin(Handle.toString(slot.handle));
				unlock();
			}
	
			return slotNode.session;
		}

		return slotNode.session;
	}

	public async getObjects(node: ObjectTypeNode) : Promise<Pkcs11Node[]> {
		const objects:Pkcs11Node[] = [];
		const type = node.id;
		const session: graphene.Session = await this.openSession(node.slotNode);

		const objectsFound = session.find({class: graphene.ObjectClass[type]});
		
		if (objectsFound.length > 0) {
			for (let i = 0; i < objectsFound.length; i++) {
				const attributesTemplate: graphene.ITemplate = Definitions.ObjectTypeTemplateMap.has(graphene.ObjectClass[type]) ? Definitions.ObjectTypeTemplateMap.get(graphene.ObjectClass[type]) : Definitions.BasicTemplate; 
				
				const data = objectsFound.items(i);
				const attributes = data.getAttribute(attributesTemplate);
				objects.push( new ObjectNode(
					Buffer.from(attributes.id).toString(), 
					this.formatLabel(Buffer.from(attributes.id).toString("hex"), 
									Buffer.from(attributes.label).toString()), 
					this.formatDescription(attributes, Definitions.ObjectClassToType.get(graphene.ObjectClass[type])),
					type,
					node,
					data)
				);
			}
		}

		return Promise.resolve(objects);
	}

	// PKCS#11 Commands

	public getModuleDescription(node: Pkcs11Node) {
		const module: graphene.Module = this.modules.get(node.id);
		this.outputChannel.printModuleDescription(module);
	}

	public async closeModuleNode(node: Pkcs11Node): Promise<void> {	
		const module: graphene.Module = this.modules.get(node.id);
		this.closeModule(module);
		this.modules.delete(node.id);
		return Promise.resolve();
	}

	public closeModule(module: graphene.Module) {
		try {
			const slots = module.getSlots();
			for (const slot of slots) {
				slot.closeAll();
			}
		}
		catch (err) {
			console.log("Failed to close all session for module.\n" + err);
		}

		try {
			module.finalize();
		}
		catch (err) {
			console.log("Failed to finalize module.\n" + err);
		}

		try {
			module.close();
			return;
		}
		catch (err) {
			Interactions.showErrorMessage("Failed to close module.\n" + err);
			return;
		}
	}

	public closeAllSessions(slot: graphene.Slot) {
		try {
			slot.closeAll();
		}
		catch (err) {
			Interactions.showErrorMessage("Failed to close sessions.\n" + err);
			return;
		}
	}

	public reloadModule(node: Pkcs11Node): Thenable<void> {	
		const module: graphene.Module = this.modules.get(node.id);
		
		try {
			const slots = module.getSlots();
			for (const slot of slots) {
				slot.closeAll();
			}
		}
		catch (err) {
			console.log("Failed to close all session for module.\n" + err);
		}

		try {
			module.finalize();
		}
		catch (err) {
			console.error(err);
			return Promise.resolve();
		}

		try {
			module.initialize();
		}
		catch (err) {
			Interactions.showErrorMessage("Failed to reload module.\n" + err);
		}

		return Promise.resolve();
	}

	public async removeModule(node: Pkcs11Node): Promise<void> {
		const isDeleteConfirmed = await Interactions.showYesNoQuickPick("Confirm remove?");
		if (!isDeleteConfirmed) {
			return;
		}

		try {
			const module: graphene.Module = this.modules.get(node.id);
			module.finalize();
			module.close();
		}
		catch (err) {
			console.error(err);
		}

		this.modules.delete(node.id);
		this.configuration.removeModule(node.id);
	}

	public async deleteSlot(node: SlotNode): Promise<void> {
		const isDeleteConfirmed = await Interactions.showYesNoQuickPick("Confirm deletion?");
		if (!isDeleteConfirmed) {
			return;
		}

		const slot: graphene.Slot = node.slot;
		
		try
		{
			slot.closeAll();
		}
		catch (err) {
			Interactions.showErrorMessage(`Failed to delete slot iwth error.\n${err.message}`);
		}
	}

	public getSlotDescription(node: SlotNode) {
		const slot: graphene.Slot = node.slot;
		try {
			this.outputChannel.printSlotDescription(slot);
		}
		catch(err) {
			Interactions.showErrorMessage("Failed to get slot description.");
		}
	}

	public getSlotAvailableMechanisms(node: SlotNode) {
		const slot: graphene.Slot = node.slot;
		try {
			this.outputChannel.printSlotAvailableMechanisms(slot);
		}
		catch(err) {
			Interactions.showErrorMessage("Failed to get available mechanisms for slot.");
		}
	}

	public async initializeSlot(node: SlotNode) : Promise<void> {
		const slot: graphene.Slot = node.slot;

		if ((slot.flags & graphene.SlotFlag.TOKEN_PRESENT) 
			&& (slot.getToken().flags & graphene.TokenFlag.TOKEN_INITIALIZED)) {
			const overrideToken = await Interactions.showYesNoQuickPick("The token is already initialized. Enter yes to reinitialize the toke. Note: it will delete all the data in the current token.");

			if (!overrideToken) {
				return;
			}
		}
	
		try
		{
			const userSoPin = await Interactions.showPasswordInputBox("The SO's initial PIN");
			const tokenLabel = await Interactions.showInputBox("The token label. Can be empty.");

			slot.initToken(userSoPin, tokenLabel);
			Interactions.showInformationMessage("Token initialized.");
		}
		catch (err){
			Promise.reject(`Failed to initialize token.\n${err.message}`);
		}
	}

	public async setSlotUserPin(node: SlotNode) {
		const slot: graphene.Slot = node.slot;
	
		try
		{
			const oldPin = await Interactions.showPasswordInputBox("Old PIN");
			const newPin = await Interactions.showPasswordInputBox("New PIN");

			if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
				const session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);
				if (session.state < 2) {
					session.login(oldPin, graphene.UserType.USER);
				}

				session.setPin(oldPin, newPin);
				session.logout();
				session.close();

				await Interactions.invalidateUserPin(Handle.toString(slot.handle));
				Interactions.showInformationMessage("User PIN was changed successfully");
			}

			Interactions.showErrorMessage("Token not initialized.");
		}
		catch (err){
			Interactions.showErrorMessage(`Failed to set user PIN for User.\n${err.message}`);
		}
	}

	public async initializeSlotUserPin(node: SlotNode) {
		const slot: graphene.Slot = node.slot;
	
		try
		{
			const soPin = await Interactions.getSoPin(Handle.toString(slot.handle));
			const newPin = await Interactions.showPasswordInputBox("User PIN");

			if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
				slot.closeAll();
				let session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);
				session.login(soPin, graphene.UserType.SO);
				session.initPin(newPin);
				session.logout();
				session.close();
				session = slot.open();
				session.login(newPin, graphene.UserType.USER);
				session.logout();
				session.close();

				Interactions.showInformationMessage("User PIN initialized.");
			}
		}
		catch (err){
			Interactions.showErrorMessage("Failed to initialize user PIN.\n" + err.message);
		}
	}

	public async generateAesKey(node: SlotNode) {
		const slot: graphene.Slot = node.slot;
	
		try
		{
			const session = await this.openSession(node);
			
			const sizeString = await Interactions.showQuickPick(Definitions.SupportedAesSizes, "Aes key length");
			if (sizeString == undefined) {
				return;
			}
			const size = Number.parseInt(sizeString);
			
			const id = await Interactions.showInputBox("ID for AES key");
			if (id == undefined) {
				return;
			}

			const label = await Interactions.showInputBox("Label for AES key");
			if (label == undefined) {
				return;
			}

			const isSensitive = await Interactions.showYesNoQuickPick("Sensitive? (default=no)");
			if (isSensitive == undefined) {
				return;
			}

			const isExtractable = await Interactions.showYesNoQuickPick("Extractable?");
			if (isExtractable == undefined) {
				return;
			}

			session.generateKey(graphene.KeyGenMechanism.AES, {
				keyType: graphene.KeyType.AES,
				id: Buffer.from(id),
				label: label,
				valueLen: size / 8,
				encrypt: true,
				decrypt: true,
				sign: true,
				verify: true,
				wrap: true,
				unwrap: true,
				derive: true,
				token: true,
				sensitive: isSensitive,
				extractable: isExtractable
			});

			Interactions.showInformationMessage("AES key generated successfully.");
		}
		catch (err){
			Interactions.showErrorMessage("Failed to generate AES key.\n" + err.message);
		}
	}

	public async generateRsaKey(node: SlotNode) {
		const slot: graphene.Slot = node.slot;
	
		try
		{
			const session = await this.openSession(node);

			const sizeString = await Interactions.showQuickPick(Definitions.SupportedRsaKeySizes, "RSA key length");
			if (sizeString == undefined) {
				return;
			}
			const size = Number.parseInt(sizeString);

			const id = await Interactions.showInputBox("ID for RSA key");
			if (id == undefined) {
				return;
			}

			const label = await Interactions.showInputBox("Label for RSA key");
			if (label == undefined) {
				return;
			}

			let pulicExponentString = await Interactions.showQuickPick(Definitions.SupportedRsaPublicExponents, "RSA public exponent");
									
			if (pulicExponentString == "custom...")
			{
				pulicExponentString = await Interactions.showInputBox("Public Exponent (integer between 3 and 65537).");
			}

			if (pulicExponentString == undefined) {
				return;
			}

			const pulicExponent = Number.parseInt(pulicExponentString);

			session.generateKey(graphene.KeyGenMechanism.RSA, {
					keyType: graphene.KeyType.RSA,
					id: Buffer.from(id),
					label: label,
					modulusBits: size,
					publicExponent: Buffer.from([pulicExponent]),
					token: true,
					verify: true,
					encrypt: true,
					wrap: true
				});

			Interactions.showInformationMessage("RSA key generated successfully.");
		}
		catch (err){
			Interactions.showErrorMessage("Failed to generate RSA key.\n" + err.message);
		}
	}

	public async generateRsaKeyPair(node: SlotNode) {
		const slot: graphene.Slot = node.slot;
	
		try
		{
			const session = await this.openSession(node);

			const sizeString = await Interactions.showQuickPick(Definitions.SupportedRsaKeySizes, "RSA key length");
			if (sizeString == undefined) {
				return;
			}
			const size = Number.parseInt(sizeString);

			const id = await Interactions.showInputBox("ID for RSA key");
			if (id == undefined) {
				return;
			}

			const label = await Interactions.showInputBox("Label for RSA key");
			if (label == undefined) {
				return;
			}

			let pulicExponentString = await Interactions.showQuickPick(Definitions.SupportedRsaPublicExponents, "RSA public exponent");
									
			if (pulicExponentString == "custom...")
			{
				pulicExponentString = await Interactions.showInputBox("Public Exponent (integer between 3 and 65537).");
			}

			if (pulicExponentString == undefined) {
				return;
			}

			const pulicExponent = Number.parseInt(pulicExponentString);

			session.generateKeyPair(graphene.KeyGenMechanism.RSA, {
					keyType: graphene.KeyType.RSA,
					id: Buffer.from(id),
					label: label,
					modulusBits: size,
					publicExponent: Buffer.from([pulicExponent]),
					token: true,
					verify: true,
					encrypt: true,
					wrap: true
				}, {
					keyType: graphene.KeyType.RSA,
					id: Buffer.from(id),
					label: label,
					token: true,
					sign: true,
					decrypt: true,
					unwrap: true,
			});

			Interactions.showInformationMessage("RSA key generated successfully.");
		}
		catch (err){
			Interactions.showErrorMessage("Failed to generate RSA key.\n" + err.message);
		}
	}

	public async generateEccKey(node: SlotNode) {
		const slot: graphene.Slot = node.slot;
	
		try
		{
			const session = await this.openSession(node);

			const namedCurve = await Interactions.showQuickPick(Definitions.SupportedEccNamedCurves, 
			"Select the named curve.");
			if (namedCurve == undefined) {
				return;
			}
			
			const id = await Interactions.showInputBox("ID for ECC key");
			if (id == undefined) {
				return;
			}

			const label = await Interactions.showInputBox("Label for ECC key");
			if (label == undefined) {
				return;
			}

			const paramsEc: Buffer = graphene.NamedCurve.getByName(namedCurve).value;

			session.generateKey(graphene.KeyGenMechanism.EC, {
				keyType: graphene.KeyType.EC,
				id: Buffer.from(id),
				label: label,
				paramsEC: paramsEc,
				token: true,
				verify: true,
				encrypt: true,
				wrap: true,
				derive: false
				});

			Interactions.showInformationMessage("ECC key generated successfully.");
		}
		catch (err){
			Interactions.showErrorMessage("Failed to generate RSA key.\n" + err.message);
		}
	}

	public async generateEccKeyPair(node: SlotNode) {
		const slot: graphene.Slot = node.slot;
	
		try
		{
			const session = await this.openSession(node);

			const namedCurve = await Interactions.showQuickPick(Definitions.SupportedEccNamedCurves, 
			"Select the named curve.");
			if (namedCurve == undefined) {
				return;
			}
			
			const id = await Interactions.showInputBox("ID for ECC key");
			if (id == undefined) {
				return;
			}

			const label = await Interactions.showInputBox("Label for ECC key");
			if (label == undefined) {
				return;
			}

			const paramsEc: Buffer = graphene.NamedCurve.getByName(namedCurve).value;

			session.generateKeyPair(graphene.KeyGenMechanism.EC, {
				keyType: graphene.KeyType.EC,
				id: Buffer.from(id),
				label: label,
				paramsEC: paramsEc,
				token: true,
				verify: true,
				encrypt: true,
				wrap: true,
				derive: false
				}, {
				keyType: graphene.KeyType.EC,
				id: Buffer.from(id),
				label: label,
				token: true,
				sign: true,
				decrypt: true,
				unwrap: true,
				derive: false,
			});

			Interactions.showInformationMessage("ECC key generated successfully.");
		}
		catch (err){
			Interactions.showErrorMessage("Failed to generate RSA key.\n" + err.message);
		}
	}

	public async deleteObject(node: ObjectNode) {
		const isDeleteConfirmed = await Interactions.showYesNoQuickPick("Confirm deletion?");
		if (!isDeleteConfirmed) {
			return;
		}

		try {
			node.object.destroy();
			Interactions.showInformationMessage("Object deleted.");
		} 
		catch (err) {
			Interactions.showErrorMessage(`Failed to delete object.\n${err}`);
		}
	}

	public async renameObject(node: ObjectNode) {
		try {
			const id = await Interactions.showInputBox("New ID");

			if (id == undefined) {
				return;
			}

			const label = await Interactions.showInputBox("Label");

			if (label == undefined) {
				return;
			}

			node.object.setAttribute({ id: Buffer.from(id), label: label });
			Interactions.showInformationMessage("Object renamed.");
		} 
		catch (err) {
			Interactions.showErrorMessage(`Failed to rename object.\n${err}`);
		}
	}

	public async getAttribute(node: ObjectNode) {
		let attributeName: string;
		try {
			attributeName = await Interactions.getObjectAttributeName();
			if (attributeName == undefined) {
				return;
			}

			const value: Buffer = node.object.getAttribute(attributeName);
			this.outputChannel.printAttribute(attributeName, value);
		} 
		catch (err) {
			Interactions.showErrorMessage(`Failed to set attribute ${attributeName}.\n${err}`);
		}
	}

	public async getAttributes(node: ObjectNode) {
		const attributes: Map<string, Buffer> = new Map<string, Buffer>();
		for (const key of Definitions.AttributeNameTypes.keys()) {
			try {
				const value: Buffer = node.object.getAttribute(key);
				attributes.set(key, value);
			} 
			catch (err) { /* ignore error, attribute not found */ }
		}
		this.outputChannel.printAttributes(attributes);
	}

	public async setAttribute(node: ObjectNode) {
		let attributeName: string;
		try {
			attributeName = await Interactions.getObjectAttributeName();
			if (attributeName == undefined) {
				return;
			}

			const newValue = await Interactions.showInputBox("value");  
			if (attributeName == undefined) {
				return;
			}

			node.object.setAttribute(attributeName, newValue);
			Interactions.showInformationMessage(`Attribute ${attributeName} set.`);
		} 
		catch (err) {
			Interactions.showErrorMessage(`Failed to set attribute ${attributeName}.\n${err}`);
		}
	}

	public async createDigest(node: SlotNode) {
		const session = await this.openSession(node);

		try
		{
			const digest: DigestModel = new DigestModel(session);
			const result: DigestResult = await digest.generate();

			this.outputChannel.printDigest(result);
			Interactions.showInformationMessage("Digest generated successfully.");
		}
		catch (err){
			Interactions.showErrorMessage("Failed to create digest.\n" + err.message);
		}
	}
	
	public async sign(node: ObjectNode): Promise<void> {
		const session = node.object.session;
		const keyType: graphene.KeyType = node.object.getAttribute("keyType");
		const key = node.object.toType<graphene.PrivateKey>();

		try {
			const signing: SignModel = new SignModel(session);
			const result: BufferWithEncoding = await signing.sign(key, keyType);
			this.outputChannel.printSignature(node.label, result);
		}
		catch (err) {
			Interactions.showErrorMessage(`Failed to sign data.\n${err}`);
		}
	}

	public async signMultipart(node: ObjectNode): Promise<void> {
		const session = node.object.session;
		const keyType: graphene.KeyType = node.object.getAttribute("keyType");
		const key = node.object.toType<graphene.PrivateKey>();

		try {
			const signing: SignModel = new SignModel(session);
			const result: BufferWithEncoding = await signing.signMultipart(key, keyType);
			this.outputChannel.printSignature(node.label, result);
		} catch (err) {
			Interactions.showErrorMessage(`Failed to sign data.\n${err}`);
		}
	}

	public async verify(node: ObjectNode): Promise<void> {
		const session = node.object.session;
		const keyType: graphene.KeyType = node.object.getAttribute("keyType");
		const key = node.object.toType<graphene.PublicKey>();

		let isVerified: boolean;

		try {
			const verify: VerifyModel = new VerifyModel(session);
			isVerified = await verify.verify(key, keyType);
		}
		catch (err) {
			Interactions.showErrorMessage(`Failed to verify data.\n${err}`);
			return;
		}

		if (isVerified) {
			Interactions.showInformationMessage("Signature verified successfully");
		}
		else {
			Interactions.showErrorMessage("Invalid Signature.");
		}
	}

	public async verifyMultipart(node: ObjectNode): Promise<void> {
		const session = node.object.session;
		const keyType: graphene.KeyType = node.object.getAttribute("keyType");
		const key = node.object.toType<graphene.PublicKey>();

		let isVerified: boolean;

		try {
			const verify: VerifyModel = new VerifyModel(session);
			isVerified = await verify.verifyMultipart(key, keyType);
		}
		catch (err) {
			Interactions.showErrorMessage(`Failed to verify data.\n${err}`);
			return;
		}

		if (isVerified) {
			Interactions.showInformationMessage("Signature verified successfully");
		}
		else {
			Interactions.showErrorMessage("Invalid Signature.");
		}
	}

	public async encrypt(node: ObjectNode): Promise<void> {
		const session = node.object.session;
		const keyType: graphene.KeyType = node.object.getAttribute("keyType");
		const key = node.object.toType<graphene.Key>();

		try {
			const encryption: EncryptModel = new EncryptModel(session);
			const result: BufferWithEncoding = await encryption.encrypt(key, keyType);
			this.outputChannel.printEncrypt(result);
		}
		catch (err) {
			Interactions.showErrorMessage(`Failed to encrypt data.\n${err}`);
		}
	}

	public async decrypt(node: ObjectNode): Promise<void> {
		const session = node.object.session;
		const keyType: graphene.KeyType = node.object.getAttribute("keyType");
		const key = node.object.toType<graphene.Key>();

		try {
			const decryption: DecryptModel = new DecryptModel(session);
			const result: BufferWithEncoding = await decryption.decrypt(key, keyType);
			this.outputChannel.printDecrypt(result);
		}
		catch (err) {
			Interactions.showErrorMessage(`Failed to decrypt data.\n${err}`);
		}
	}

	public async importCertificate(node: SlotNode): Promise<void> {
		const session = node.session;
		
		const id = await Interactions.showInputBox("Certificate ID");
		if (id == undefined) {
			return;
		}

		const label = await Interactions.showInputBox("Certificate Label");
		if (label == undefined) {
			return;
		}

		const certificateFormat = await Interactions.showQuickPick(
			Definitions.SupportedCertificatInput,
			"Certificate format");

		if (certificateFormat == undefined) {
			return;
		}
		
		const pickedUri = await Interactions.showOpenDialog();

		if (pickedUri == undefined) {
			return;
		}

		try {
			const certificate = fs.readFileSync(pickedUri[0].path);

			if (certificateFormat == "pem") {
				session.create({
					class: graphene.ObjectClass.CERTIFICATE,
					certType: graphene.CertificateType.X_509,
					private: false,
					token: true,
					id: Buffer.from(id),
					label: label,
					subject: Buffer.from("test subject"),
					value: Buffer.from(certificate),
				});
			}
			else {
				Interactions.showErrorMessage(`Format not supported`);
			}
		}
		catch (err) {
			Interactions.showErrorMessage(`Failed to import certificate ${node.label}.\n${err}`);
		}
	}

	public async exportCertificate(node: ObjectNode): Promise<void> {
		const dataType = await Interactions.showQuickPick(
			Definitions.SupportedCertificateOutput,
			"Output data type");

		if (dataType == undefined) {
			return;
		}

		try {
			const value: Buffer = node.object.getAttribute("value");

			if (dataType == "pem") {
				const base64Cert = new BufferWithEncoding(value, "base64").toString();
				let cert = "-----BEGIN CERTIFICATE-----\n";
				let currentIndex = 0;
				for (let i=64; i <= base64Cert.length; i+=64) {
					cert += base64Cert.slice(currentIndex, i) + "\n";
					currentIndex += 64;
				}
				cert += base64Cert.slice(currentIndex) + "\n";
				cert += "-----END CERTIFICATE-----";

				this.outputChannel.print(cert);
			}
			else {
				this.outputChannel.printBufferWithEncoding(new BufferWithEncoding(value, dataType));
			}
		}
		catch (err) {
			Interactions.showErrorMessage(`Failed to export certificate ${node.label}.\n${err}`);
		}
	}

	public async exportDataObject(node: ObjectNode): Promise<void> {
		const dataType = await Interactions.showQuickPick(
			Definitions.SupportedEncodingOutput,
			"Output data type");

		if (dataType == undefined) {
			return;
		}

		try {
			const value: Buffer = node.object.getAttribute("value");
			this.outputChannel.printBufferWithEncoding(new BufferWithEncoding(value, dataType));
		} 
		catch (err) {
			Interactions.showErrorMessage(`Failed to export object ${node.label}.\n${err}`);
		}
	}

	public async exportPublicKey(node: ObjectNode): Promise<void> {
		const keyType: graphene.KeyType = node.object.getAttribute("keyType");
		const key = node.object.toType<graphene.PublicKey>();

		try {
			if (keyType == graphene.KeyType.RSA) {
				const result: graphene.ITemplate = node.object.getAttribute( { modulus: null, publicExponent: null});
				const modulus: Buffer = result.modulus; 
				const publicExponent: Buffer = result.publicExponent;
				const publicKey = {
					modulus: modulus.toString("base64"),
					publicExponent: publicExponent.toString("base64")
				};
				this.outputChannel.print(JSON.stringify(publicKey));
			}
		} 
		catch (err) {
			Interactions.showErrorMessage(`Failed to export public key ${node.label}.\n${err}`);
		}
	}

	public async exportSecretKey(node: ObjectNode): Promise<void> {
		const dataType = await Interactions.showQuickPick(
			Definitions.SupportedEncodingOutput,
			"Output data type");

		if (dataType == undefined) {
			return;
		}

		try {
			const value: Buffer = node.object.getAttribute("value");
			this.outputChannel.printBufferWithEncoding(new BufferWithEncoding(value, dataType));
		} 
		catch (err) {
			Interactions.showErrorMessage(`Failed to export secret key ${node.label}.\n${err}`);
		}
	}
}