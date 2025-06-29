import { PluginSettingTab, Plugin, Setting } from "obsidian";

import { IGlossOptions, IGlossOptionStyles } from "src/data/gloss";
import { GlossAlignMode } from "src/data/settings";
import { KeysOfType, sanitizeCssClasses } from "src/utils";

import { makeDesc } from "./helpers";
import { PluginSettingsWrapper } from "./wrapper";


export class PluginSettingsTab extends PluginSettingTab {
    constructor(plugin: Plugin, private settings: PluginSettingsWrapper) {
        super(plugin.app, plugin);
    }

    display() {
        this.containerEl.empty();

        this.addAlignModeSettings();
        this.addSwitchSettings();
        this.addStyleSettings();
    }

    private addAlignModeSettings() {
        const { alignMode, alignCenter, alignLevel, alignCustom } = this.settings.get();

        new Setting(this.containerEl)
            .setName("Align gloss elements")
            .setDesc(makeDesc(desc => {
                desc.appendText("Horizontal alignment of gloss elements that have certain marker characters on either side.");
                desc.createEl("br");
                desc.appendText("The default markers are: ");
                desc.createEl("code", { text: "-" });
                desc.appendText(" (hyphen), ");
                desc.createEl("code", { text: "=" });
                desc.appendText(" (equals sign), ");
                desc.createEl("code", { text: "~" });
                desc.appendText(" (tilde).");
            }))
            .addDropdown(component => {
                component
                    .addOptions({
                        none: "No alignment",
                        default: "Default markers",
                        custom: "Custom markers",
                    })
                    .setValue(alignMode)
                    .onChange(async value => {
                        await this.settings.update({
                            alignMode: value as GlossAlignMode,
                        });
                    });
            });

        new Setting(this.containerEl)
            .setName("Default center alignment")
            .setDesc("Center align gloss elements which do not have any alignment markers on either side.")
            .addToggle(component => {
                component
                    .setValue(alignCenter)
                    .onChange(async value => {
                        await this.settings.update({
                            alignCenter: value,
                        });
                    });
            });

        new Setting(this.containerEl)
            .setName("Gloss line for alignment")
            .setDesc("The line on which gloss elements are checked for the selected alignment markers.")
            .addDropdown(component => {
                component
                    .addOptions({
                        0: "Level A",
                        1: "Level B",
                        2: "Level C",
                    })
                    .setValue(alignLevel.toFixed(0))
                    .onChange(async value => {
                        await this.settings.update({
                            alignLevel: Number(value),
                        });
                    });
            });

        new Setting(this.containerEl)
            .setName("Custom alignment markers")
            .setDesc(makeDesc(desc => {
                desc.appendText("Space separated list of custom marker characters for gloss element alignment.");
                desc.createEl("br");
                desc.appendText("Only has an effect when the gloss element alignment is set to “Custom markers”.");
            }))
            .addText(component => {
                component
                    .setValue(alignCustom.join(" "))
                    .onChange(async value => {
                        await this.settings.update({
                            alignCustom: value.split(/\s+/),
                        });
                    });
            });
    }

    private addSwitchSettings() {
        new Setting(this.containerEl)
            .setName("Feature switches")
            .setDesc(makeDesc(desc => {
                desc.appendText("Default feature switch settings for all glosses.");
                desc.createEl("br");
                desc.appendText("To unset the enabled ones, the ");
                desc.createEl("code", { text: " \\set*" });
                desc.appendText(" command can be used.");
            }))
            .setHeading();

        this.addSwitchSettingByKey("altSpaces", "Alternate spaces", "glaspaces");
        this.addSwitchSettingByKey("useMarkup", "Process markup", "markup");
    }

    private addStyleSettings() {
        new Setting(this.containerEl)
            .setName("Style classes")
            .setDesc(makeDesc(desc => {
                desc.appendText("Default style classes for all glosses. The ");
                desc.createEl("code", { text: "\\set" });
                desc.appendText(" command will append to these.");
                desc.createEl("br");
                desc.appendText("To replace or remove these, the ");
                desc.createEl("code", { text: "\\set*" });
                desc.appendText(" command can be used instead.");
            }))
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

        new Setting(this.containerEl)
            .setName(label)
            .setDesc(makeDesc(desc => {
                desc.appendText("Default style classes for the ");
                desc.createEl("code", { text: `\\set ${command}` });
                desc.appendText(" option.");
            }))
            .addText(component => {
                component
                    .setPlaceholder("class1 class2 ...")
                    .setValue(styles[style].join(" "))
                    .onChange(async value => {
                        await this.settings.update({
                            gloss: {
                                styles: {
                                    [style]: sanitizeCssClasses(value.split(/\s+/)),
                                }
                            }
                        });
                    });

                // Make the text field wider
                component.inputEl.addClass("ling-gloss-settings-wide");
            });
    }

    private addSwitchSettingByKey(flag: KeysOfType<IGlossOptions, boolean>, label: string, command: string) {
        const gloss = this.settings.get("gloss");

        new Setting(this.containerEl)
            .setName(label)
            .setDesc(makeDesc(desc => {
                desc.appendText("Default switch setting for the ");
                desc.createEl("code", { text: `\\set ${command}` });
                desc.appendText(" option.");
            }))
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