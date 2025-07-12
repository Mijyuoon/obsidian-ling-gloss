import { IGlossData } from "src/data/gloss";
import { getDefaultAlignMarkers } from "src/data/settings";
import { PluginSettingsWrapper } from "src/settings/wrapper";

import { formatWhitespace, getLevelMetadata, getStyleClasses, getStyleKind, renderBlock } from "./helpers";


interface IFormatFlags {
    useNbsp?: boolean;
    glaSpaces?: boolean;
    useMarkup?: boolean;
}

export class GlossRenderer {
    constructor(private settings: PluginSettingsWrapper) { }

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
            format: (text) => formatWhitespace(text, true),
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
            format: (text) => this.formatText(text, { useMarkup }),
        });

        if (data.elements.length > 0) {
            const elements = gloss.createDiv({ cls: getStyleKind("elements") });

            const alignMarkers = this.getAlignMarkers();

            for (const { levels } of data.elements) {
                const element = elements.createDiv({ cls: getStyleKind("element") });

                if (alignMarkers) {
                    const level = levels[this.settings.get("alignLevel")] ?? "";

                    const isLeft = alignMarkers.some(mark => level.startsWith(mark));
                    const isRight = alignMarkers.some(mark => level.endsWith(mark));

                    if (isLeft && !isRight) {
                        element.addClass(getStyleKind("align-left"));
                    } else if (!isLeft && isRight) {
                        element.addClass(getStyleKind("align-right"));
                    } else if (this.settings.get("alignCenter")) {
                        // Center align if either none or both sides have a marker
                        element.addClass(getStyleKind("align-center"));
                    }
                }

                for (const [levelNo, level] of levels.entries()) {
                    const [levelKind, styleKey] = getLevelMetadata(levelNo);

                    // Alternative whitespace syntax only for level-A elements
                    const glaSpaces = altSpaces && levelNo === 0;

                    renderBlock(element, {
                        kind: levelKind,
                        cls: styles[styleKey],
                        text: level,
                        always: true,
                        format: (text) => this.formatText(text, {
                            useMarkup,
                            glaSpaces,
                            useNbsp: true,
                        }),
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
                format: (text) => this.formatText(text, { useMarkup }),
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

    private getAlignMarkers(): string[] | null {
        switch (this.settings.get("alignMode")) {
            case "none": return null;
            case "default": return getDefaultAlignMarkers();
            case "custom": return this.settings.get("alignCustom");
        }
    }

    private formatText(text: string, format: IFormatFlags): string | DocumentFragment {
        if (format.glaSpaces) {
            // Replace underscores with whitespace
            text = text.replace(/[_]+/, " ");
        }

        // TODO: Implement markup rendering
        if (format.useMarkup) {
            throw "not implemented yet";
        }

        return formatWhitespace(text, format.useNbsp);
    }
}