import * as vscode from 'vscode';

function replacer(key, value) {
	if(value instanceof Map) {
		return {
			dataType: 'Map',
			value: Array.from(value.entries()), // or with spread: value: [...value]
		};
	} else {
		return value;
	}
}

function reviver(key, value) {
	if(typeof value === 'object' && value !== null) {
		if (value.dataType === 'Map') {
			return new Map(value.value);
		}
	}
	return value;
}

export class Pkcs11ExplorerConfigurationInfo {
	modules: Map<string, string>;
}

export class Pkcs11ExplorerConfiguration {
	configuration: Pkcs11ExplorerConfigurationInfo;
	configurationKey = 'conf.resource.pkcs11view.data';
	modulesCountKey = 'pkcs11view.modulesCount';

	public load() {
		try {
			const configurationTarget = vscode.workspace.getConfiguration().get<string>(this.configurationKey);
			this.configuration = JSON.parse(configurationTarget, reviver);
			vscode.commands.executeCommand('setContext', this.modulesCountKey, this.configuration.modules.size);
		}
		catch (err) {
			console.log("No configuration found.");
			this.configuration = new Pkcs11ExplorerConfigurationInfo();
			this.configuration.modules = new Map<string, string>();
		}
	}

	protected save() {
		vscode.workspace.getConfiguration()
			.update(this.configurationKey, JSON.stringify(this.configuration, replacer), vscode.ConfigurationTarget.Global);

			vscode.commands.executeCommand('setContext', this.modulesCountKey, this.configuration.modules.size);
	}

	public addModule(name: string, filePath: string) {
		if (!this.configuration.modules) {
			this.configuration.modules = new Map<string, string>();
		}

		this.configuration.modules.set(name, filePath);
		this.save();
	}

	public removeModule(name: string) {
		if (!this.configuration.modules) {
			return;
		}

		this.configuration.modules.delete(name);
		this.save();
	}

	public getModules(): Map<string, string> {
		return this.configuration.modules;
	}
}