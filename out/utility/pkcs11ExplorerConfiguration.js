"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11ExplorerConfiguration = exports.Pkcs11ExplorerConfigurationInfo = void 0;
const vscode = require("vscode");
function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    }
    else {
        return value;
    }
}
function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}
class Pkcs11ExplorerConfigurationInfo {
}
exports.Pkcs11ExplorerConfigurationInfo = Pkcs11ExplorerConfigurationInfo;
class Pkcs11ExplorerConfiguration {
    constructor() {
        this.configurationKey = 'conf.resource.pkcs11view.data';
        this.modulesCountKey = 'pkcs11view.modulesCount';
    }
    load() {
        try {
            const configurationTarget = vscode.workspace.getConfiguration().get(this.configurationKey);
            this.configuration = JSON.parse(configurationTarget, reviver);
            vscode.commands.executeCommand('setContext', this.modulesCountKey, this.configuration.modules.size);
        }
        catch (err) {
            console.log("No configuration found.");
            this.configuration = new Pkcs11ExplorerConfigurationInfo();
            this.configuration.modules = new Map();
        }
    }
    save() {
        vscode.workspace.getConfiguration()
            .update(this.configurationKey, JSON.stringify(this.configuration, replacer), vscode.ConfigurationTarget.Global);
        vscode.commands.executeCommand('setContext', this.modulesCountKey, this.configuration.modules.size);
    }
    addModule(name, filePath) {
        if (!this.configuration.modules) {
            this.configuration.modules = new Map();
        }
        this.configuration.modules.set(name, filePath);
        this.save();
    }
    removeModule(name) {
        if (!this.configuration.modules) {
            return;
        }
        this.configuration.modules.delete(name);
        this.save();
    }
    getModules() {
        return this.configuration.modules;
    }
}
exports.Pkcs11ExplorerConfiguration = Pkcs11ExplorerConfiguration;
//# sourceMappingURL=pkcs11ExplorerConfiguration.js.map