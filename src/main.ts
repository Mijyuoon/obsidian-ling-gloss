import { Plugin } from "obsidian";

import { GlossParser } from "src/parser/main";
import { GlossRenderer } from "src/render/main";
import { PluginSettingsTab } from "src/settings/main";
import { PluginSettingsWrapper } from "src/settings/wrapper";


export default class LingGlossPlugin extends Plugin {
    settings = new PluginSettingsWrapper(this);
    parser = new GlossParser(this.settings);
    renderer = new GlossRenderer();

    async onload() {
        await this.settings.load();

        this.addSettingTab(new PluginSettingsTab(this, this.settings));

        this.registerMarkdownCodeBlockProcessor("gloss", (src, el, _) => this.processGlossMarkdown(src, el, false));
        this.registerMarkdownCodeBlockProcessor("ngloss", (src, el, _) => this.processGlossMarkdown(src, el, true));
    }

    private processGlossMarkdown(source: string, el: HTMLElement, nlevel: boolean) {
        const glossData = this.parser.parse(source, nlevel);

        if (glossData.success) {
            this.renderer.renderGloss(el, glossData.data);
        } else {
            this.renderer.renderErrors(el, glossData.errors);
        }
    }
}