import { PluginSettingTab, Plugin, Setting } from "obsidian";

import { PluginSettingsWrapper } from "./wrapper";
import { IGlossOptions, IGlossOptionStyles } from "src/data/gloss";
import { KeysOfType, sanitizeCssClass } from "src/utils";


export class PluginSettingsTab extends PluginSettingTab {
    constructor(plugin: Plugin, private settings: PluginSettingsWrapper) {
        super(plugin.app, plugin);
    }

    display() {
        this.containerEl.empty();
        this.addGlossFlagSettings();
        this.addStyleSettings();
    }

    private addGlossFlagSettings() {
        const desc = new DocumentFragment();
        desc.appendText("Default feature flag settings for all glosses.");
        desc.createEl("br");
        desc.appendText("To unset the enabled ones, the ");
        desc.createEl("code", { text: " \\set*" });
        desc.appendText(" command can be used.");

        new Setting(this.containerEl)
            .setName("Feature flags")
            .setDesc(desc)
            .setHeading();

        this.addGlossFlagSettingByKey("altSpaces", "Alternate spaces", "glaspaces");
        this.addGlossFlagSettingByKey("useMarkup", "Process markup", "markup");
    }

    private addStyleSettings() {
        const desc = new DocumentFragment();
        desc.appendText("Default style classes for all glosses. The ");
        desc.createEl("code", { text: "\\set" });
        desc.appendText(" command will append to these.");
        desc.createEl("br");
        desc.appendText("To replace or remove these, the ");
        desc.createEl("code", { text: "\\set*" });
        desc.appendText(" command can be used instead.");

        new Setting(this.containerEl)
            .setName("Style classes")
            .setDesc(desc)
            .setHeading();

        this.addStyleSettingByKey("global", "Global styles", "style");
        this.addStyleSettingByKey("levelA", "Gloss level A", "glastyle");
        this.addStyleSettingByKey("levelB", "Gloss level B", "glbstyle");
        this.addStyleSettingByKey("levelC", "Gloss level C", "glcstyle");
        this.addStyleSettingByKey("levelX", "Other gloss levels", "glxstyle");
        this.addStyleSettingByKey("preamble", "Preamble/example text", "exstyle");
        this.addStyleSettingByKey("translation", "Translation text", "ftstyle");
        this.addStyleSettingByKey("source", "Gloss source", "srcstyle");
    }

    private addStyleSettingByKey(style: keyof IGlossOptionStyles, label: string, command: string) {
        const { styles } = this.settings.get("gloss");

        const desc = new DocumentFragment();
        desc.appendText("Default style classes for the ");
        desc.createEl("code", { text: `\\set ${command}` });
        desc.appendText(" option.");

        new Setting(this.containerEl)
            .setName(label)
            .setDesc(desc)
            .addText(component => {
                component
                    .setPlaceholder("class1 class2 ...")
                    .setValue(styles[style].join(" "))
                    .onChange(async value => {
                        await this.settings.update({
                            gloss: {
                                styles: {
                                    [style]: sanitizeCssClass(value.split(/\s+/)),
                                }
                            }
                        });
                    });

                // Make the text field wider
                component.inputEl.addClass("ling-gloss-settings-wide");
            });
    }

    private addGlossFlagSettingByKey(flag: KeysOfType<IGlossOptions, boolean>, label: string, command: string) {
        const gloss = this.settings.get("gloss");

        const desc = new DocumentFragment();
        desc.appendText("Default setting for the ");
        desc.createEl("code", { text: `\\set ${command}` });
        desc.appendText(" option.");

        new Setting(this.containerEl)
            .setName(label)
            .setDesc(desc)
            .addToggle(component => {
                component
                    .setValue(gloss[flag])
                    .onChange(async value => {
                        await this.settings.update({
                            gloss: {
                                [flag]: value,
                            }
                        });
                    });
            });
    }
}