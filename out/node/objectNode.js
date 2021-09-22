"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectNode = void 0;
const graphene = require("graphene-pk11");
const path = require("path");
const pkcs11Node_1 = require("./pkcs11Node");
const certificateItem_1 = require("../model/certificateItem");
const vscode_1 = require("vscode");
const definitions_1 = require("../model/definitions");
const dataItem_1 = require("../model/dataItem");
const privateKeyItem_1 = require("../model/privateKeyItem");
const secretKeyItem_1 = require("../model/secretKeyItem");
const publicKeyItem_1 = require("../model/publicKeyItem");
class ObjectNode extends pkcs11Node_1.Pkcs11Node {
    constructor(id, label, description, type, objectTypeNode, object) {
        super(id, label, description, type, false);
        this.objectTypeNode = objectTypeNode;
        this.object = object;
    }
    getChildren(model) {
        return null;
    }
    toTreeItem() {
        if (this.type == definitions_1.NodeType.CertificateObject) {
            return new certificateItem_1.CertificateItem(this.label, this.description, this.isExpandable ? vscode_1.TreeItemCollapsibleState.Collapsed : vscode_1.TreeItemCollapsibleState.None, this.getIcon());
        }
        else if (this.type == definitions_1.NodeType.DataObject) {
            return new dataItem_1.DataItem(this.label, this.description, this.isExpandable ? vscode_1.TreeItemCollapsibleState.Collapsed : vscode_1.TreeItemCollapsibleState.None, this.getIcon());
        }
        else if (this.type == definitions_1.NodeType.PublicKeyObject) {
            return new publicKeyItem_1.PublicKeyItem(this.label, this.description, this.isExpandable ? vscode_1.TreeItemCollapsibleState.Collapsed : vscode_1.TreeItemCollapsibleState.None, this.getIcon());
        }
        else if (this.type == definitions_1.NodeType.PrivateKeyObject) {
            return this.asPrivateKeyItem();
        }
        else if (this.type == definitions_1.NodeType.SecretKeyObject) {
            return new secretKeyItem_1.SecretKeyItem(this.label, this.description, this.isExpandable ? vscode_1.TreeItemCollapsibleState.Collapsed : vscode_1.TreeItemCollapsibleState.None, this.getIcon());
        }
    }
    asPrivateKeyItem() {
        const keyType = this.object.getAttribute("keyType");
        let iconPath;
        if (keyType == graphene.KeyType.RSA) {
            iconPath = path.join(this.iconDirectory, 'dark', 'rsa.svg');
        }
        else if (keyType == graphene.KeyType.EC || keyType == graphene.KeyType.ECDSA) {
            iconPath = path.join(this.iconDirectory, 'dark', 'ecc.svg');
        }
        else {
            iconPath = path.join(this.iconDirectory, 'dark', 'private_key.svg');
        }
        return new privateKeyItem_1.PrivateKeyItem(this.label, this.description, this.isExpandable ? vscode_1.TreeItemCollapsibleState.Collapsed : vscode_1.TreeItemCollapsibleState.None, iconPath);
    }
    getIcon() {
        if (this.type == definitions_1.NodeType.CertificateObject) {
            return {
                light: path.join(this.iconDirectory, 'light', 'certificate.svg'),
                dark: path.join(this.iconDirectory, 'dark', 'certificate.svg')
            };
        }
        else if (this.type == definitions_1.NodeType.DataObject) {
            return {
                light: path.join(this.iconDirectory, 'light', 'data.svg'),
                dark: path.join(this.iconDirectory, 'dark', 'data.svg')
            };
        }
        else if (this.type == definitions_1.NodeType.PublicKeyObject) {
            return {
                light: path.join(this.iconDirectory, 'light', 'public_key.svg'),
                dark: path.join(this.iconDirectory, 'dark', 'public_key.svg')
            };
        }
        else if (this.type == definitions_1.NodeType.PrivateKeyObject) {
            return {
                light: path.join(this.iconDirectory, 'light', 'ecc.svg'),
                dark: path.join(this.iconDirectory, 'dark', 'ecc.svg')
            };
        }
        else if (this.type == definitions_1.NodeType.SecretKeyObject) {
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
exports.ObjectNode = ObjectNode;
//# sourceMappingURL=objectNode.js.map