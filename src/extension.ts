'use strict';

import * as vscode from 'vscode';
import { Pkcs11View } from './view/pkcs11View';

export function activate(context: vscode.ExtensionContext) {
	new Pkcs11View(context);
}