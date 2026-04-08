import { Plugin } from "obsidian";

import { IPluginSettings, getDefaultPluginSettings } from "src/data/settings";
import { DeepPartial, deepMerge, pickKeys } from "src/utils";


export class PluginSettingsWrapper {
    private settings: IPluginSettings;

    constructor (private plugin: Plugin) { }

    async load(): Promise<void> {
        this.settings = deepMerge(
            getDefaultPluginSettings(),
            await this.plugin.loadData());
    }

    async save(): Promise<void> {
        await this.plugin.saveData(this.settings);
    }

    async update(newSettings: DeepPartial<IPluginSettings>): Promise<void> {
        this.settings = deepMerge(this.settings, newSettings);

        await this.save();
    }

    get(): IPluginSettings;
    get<K extends keyof IPluginSettings>(key: K): IPluginSettings[K];
    get<K extends keyof IPluginSettings>(key: K[]): Pick<IPluginSettings, K>;
    get<K extends keyof IPluginSettings>(key?: K | K[]) {
        if (key === undefined) return this.settings;
        if (Array.isArray(key)) return pickKeys(this.settings, key);
        return this.settings[key];
    }

    set<K extends keyof IPluginSettings>(key: K, value: IPluginSettings[K]) {
        this.settings[key] = value;
    }
}