import { Plugin } from 'obsidian';

import { GlossParser } from 'src/gloss-parser';
import { errorPrinter, glossPrinter } from 'src/gloss-printer';


export default class LingGlossPlugin extends Plugin {
    onload() {
        this.registerMarkdownCodeBlockProcessor("gloss", (src, el, _) => this.processGlossMarkdown(src, el, false));
        this.registerMarkdownCodeBlockProcessor("ngloss", (src, el, _) => this.processGlossMarkdown(src, el, true));
    }

    private processGlossMarkdown(source: string, el: HTMLElement, nlevel: boolean) {
        const parser = new GlossParser({ nlevel });
        const gloss = parser.parse(source);

        glossPrinter(gloss, el);
        errorPrinter(parser.errors(), el);
    }
}