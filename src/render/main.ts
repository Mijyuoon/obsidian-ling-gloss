import { IGlossData, IGlossOptions } from "src/data/gloss";

import { formatWhitespace, getLevelMetadata, getStyleClasses, getStyleKind, renderBlock } from "./helpers";


export class GlossRenderer {
    renderErrors(target: HTMLElement, errors: string[]) {
        target.empty();

        for (const error of errors) {
            renderBlock(target, { kind: "error", text: error });
        }
    }

    renderGloss(target: HTMLElement, data: IGlossData) {
        const { styles, altSpaces, useMarkup } = data.options;

        // TODO: Implement markup rendering
        if (useMarkup) {
            return this.renderErrors(target, ["advanced markup is not supported at the time"]);
        }

        target.empty();

        const container = target.createDiv({ cls: getStyleKind("") });

        renderBlock(container, {
            kind: "number",
            text: data.number.value,
            always: true,
        });

        const gloss = container.createDiv({
            cls: [getStyleKind("body"), ...getStyleClasses(styles.global)]
        });

        renderBlock(gloss, {
            kind: "label",
            text: data.label,
        });

        renderBlock(gloss, {
            kind: "preamble",
            cls: styles.preamble,
            text: data.preamble,
            format: (text) => this.formatText(text, false, useMarkup),
        });

        if (data.elements.length > 0) {
            const elements = gloss.createDiv({ cls: getStyleKind("elements") });

            for (const { levels } of data.elements) {
                const element = elements.createDiv({ cls: getStyleKind("element") });

                for (const [levelNo, level] of levels.entries()) {
                    const [levelKind, styleKey] = getLevelMetadata(levelNo);

                    // Alternative whitespace syntax only for level-A elements
                    const glaSpaces = altSpaces && levelNo === 0;

                    renderBlock(element, {
                        kind: levelKind,
                        cls: styles[styleKey],
                        text: level,
                        always: true,
                        format: (text) => this.formatText(text, glaSpaces, useMarkup),
                    });
                }
            }
        }

        if (data.translation.length > 0 || data.source.length > 0) {
            const postamble = gloss.createDiv({ cls: getStyleKind("postamble") });

            renderBlock(postamble, {
                kind: "translation",
                cls: styles.translation,
                text: data.translation,
                format: (text) => this.formatText(text, false, useMarkup),
            });

            renderBlock(postamble, {
                kind: "source",
                cls: styles.source,
                text: data.source,
            });
        }

        if (!gloss.hasChildNodes()) {
            return this.renderErrors(target, ["this gloss contains no elements"]);
        }
    }

    private formatText(text: string, altSpaces: boolean, useMarkup: boolean): string | DocumentFragment {
        if (altSpaces) {
            // Replace underscores with whitespace
            text = text.replace(/[_]+/, " ");
        }

        // TODO: Implement markup rendering
        if (useMarkup) {
            throw "not implemented yet";
        }

        return formatWhitespace(text);
    }
}