import { GlossData, GlossLineStyle } from 'src/models/gloss-data';


const withNbsp = (text: string) =>
    text.replace(/\s+/g, "\u00A0");

const textOrNbsp = (text: string, style?: GlossLineStyle) => {
    if (text.length < 1) return "\u00A0";

    if (style?.altSpaces) {
        text = text.replace(/[_]+/g, "\u00A0");
    }

    return withNbsp(text);
}

const styleClasses = (style?: GlossLineStyle) =>
    style?.classes.filter(x => x.length > 0).map(x => `ling-style-${x}`) ?? [];

export const glossPrinter = (gloss: GlossData, dest: HTMLElement) => {
    const container = dest.createDiv({ cls: "ling-gloss" });

    container.createDiv({
        text: withNbsp(gloss.number),
        cls: "ling-gloss-number",
    });

    const body = container.createDiv({
        cls: ["ling-gloss-body", ...styleClasses(gloss.options.global)],
    });

    if (gloss.label.length > 0) {
        body.createDiv({
            text: gloss.label,
            cls: "ling-gloss-label",
        });
    }

    if (gloss.preamble.length > 0) {
        body.createDiv({
            text: gloss.preamble,
            cls: ["ling-gloss-preamble", ...styleClasses(gloss.options.preamble)],
        });
    }

    if (gloss.elements.length > 0) {
        const elements = body.createDiv({ cls: "ling-gloss-elements" });

        const hasLevelB = gloss.elements.some(el => el.levelB?.length > 0);
        const hasLevelC = gloss.elements.some(el => el.levelC?.length > 0);
        const maxNlevel = gloss.elements.reduce((acc, el) => Math.max(acc, el.nlevels.length), 0);

        for (const glelem of gloss.elements) {
            const element = elements.createDiv({ cls: "ling-gloss-element" });

            element.createDiv({
                text: textOrNbsp(glelem.levelA, gloss.options.levelA),
                cls: ["ling-gloss-level-a", ...styleClasses(gloss.options.levelA)],
            });

            if (hasLevelB) {
                element.createDiv({
                    text: textOrNbsp(glelem.levelB, gloss.options.levelA),
                    cls: ["ling-gloss-level-b", ...styleClasses(gloss.options.levelB)],
                });
            }

            if (hasLevelC) {
                element.createDiv({
                    text: textOrNbsp(glelem.levelC, gloss.options.levelA),
                    cls: ["ling-gloss-level-c", ...styleClasses(gloss.options.levelC)],
                });
            }

            for (let index = 0; index < maxNlevel; index += 1) {
                element.createDiv({
                    text: textOrNbsp(glelem.nlevels[index] ?? ""),
                    cls: ["ling-gloss-level-x", ...styleClasses(gloss.options.nlevels)],
                });
            }
        }
    }

    const hasTranslation = gloss.translation.length > 0;
    const hasSource = gloss.source.length > 0;

    if (hasTranslation || hasSource) {
        const postamble = body.createDiv({ cls: "ling-gloss-postamble" });

        if (hasTranslation) {
            postamble.createDiv({
                text: gloss.translation,
                cls: ["ling-gloss-translation", ...styleClasses(gloss.options.translation)],
            });
        }

        if (hasSource) {
            postamble.createDiv({
                text: gloss.source,
                cls: ["ling-gloss-source", ...styleClasses(gloss.options.source)],
            });
        }
    }

    if (!body.hasChildNodes()) {
        errorPrinter([ "the gloss is empty, there's nothing to display" ], dest);
    }
}

export const errorPrinter = (messages: string[], dest: HTMLElement) => {
    for (const msg of messages) {
        dest.createDiv({
            text: msg,
            cls: "ling-gloss-error",
        });
    }
}