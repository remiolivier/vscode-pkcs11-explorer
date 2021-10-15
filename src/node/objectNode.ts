import * as graphene from 'graphene-pk11';
import * as path from 'path';
import { Pkcs11Node } from "./pkcs11Node";
import { ObjectTypeNode } from "./objectTypeNode";
import { CertificateItem } from '../model/certificateItem';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { NodeType } from '../model/definitions';
import { DataItem } from '../model/dataItem';
import { PrivateKeyItem } from '../model/privateKeyItem';
import { SecretKeyItem } from '../model/secretKeyItem';
import { Pkcs11Model } from '../utility/pkcs11Model';
import { PublicKeyItem } from '../model/publicKeyItem';

export class ObjectNode extends Pkcs11Node {
	constructor(id: string, label: string, description: string, type: string, public objectTypeNode: ObjectTypeNode, public object: graphene.SessionObject) {
		super(id, label, description, type, false);
	}

	public getChildren(model: Pkcs11Model): Pkcs11Node[] | Thenable<Pkcs11Node[]> {
		return null;
	}

	public toTreeItem(): TreeItem {
		if (this.type == NodeType.CertificateObject) {
			return new CertificateItem(
				this.label,
				this.description,
				this.isExpandable ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
				this.getIcon());
		}
		else if (this.type == NodeType.DataObject) {
			return new DataItem(
				this.label,
				this.description,
				this.isExpandable ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
				this.getIcon());
		}
		else if (this.type == NodeType.PublicKeyObject) {
			return new PublicKeyItem(
				this.label,
				this.description,
				this.isExpandable ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
				this.getIcon());
		}
		else if (this.type == NodeType.PrivateKeyObject) {
			return this.asPrivateKeyItem();
		}
		else if (this.type == NodeType.SecretKeyObject) {
			return new SecretKeyItem(
				this.label,
				this.description,
				this.isExpandable ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
				this.getIcon());
		}
	}

	private asPrivateKeyItem(): PrivateKeyItem {
		const keyType: graphene.KeyType = this.object.getAttribute("keyType");
		
		let iconPath: string;
		if (keyType == graphene.KeyType.RSA) {
			iconPath = path.join(this.iconDirectory, 'dark', 'rsa.svg');
		}
		else if (keyType == graphene.KeyType.EC || keyType == graphene.KeyType.ECDSA) {
			iconPath = path.join(this.iconDirectory, 'dark', 'ecc.svg');
		}
		else {
			iconPath = path.join(this.iconDirectory, 'dark', 'private_key.svg');
		}

		return new PrivateKeyItem(
			this.label,
			this.description,
			this.isExpandable ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
			iconPath);
	}

	private getIcon(): any {
		if (this.type == NodeType.CertificateObject) {
			return {
				light: path.join(this.iconDirectory, 'light', 'certificate.svg'),
				dark: path.join(this.iconDirectory, 'dark', 'certificate.svg')
			};
		}
		else if (this.type == NodeType.DataObject) {
			return {
				light: path.join(this.iconDirectory, 'light', 'data.svg'),
				dark: path.join(this.iconDirectory, 'dark', 'data.svg')
			};
		}
		else if (this.type == NodeType.PublicKeyObject) {
			return {
				light: path.join(this.iconDirectory, 'light', 'public_key.svg'),
				dark: path.join(this.iconDirectory, 'dark', 'public_key.svg')
			};
		}
		else if (this.type == NodeType.PrivateKeyObject) {
			return {
				light: path.join(this.iconDirectory, 'light', 'ecc.svg'),
				dark: path.join(this.iconDirectory, 'dark', 'ecc.svg')
			};
		}
		else if (this.type == NodeType.SecretKeyObject) {
			return {
				light: path.join(this.iconDirectory, 'light', 'secret_key.svg'),
				dark: path.join(this.iconDirectory, 'dark', 'secret_key.svg')
			};
		}
		else {
			return {
				light: path.join(this.iconDirectory, 'light', 'secret_key.svg'),
				dark: path.join(this.iconDirectory, 'dark', 'secret_key.svg')
			};
		}
	}
}