import { GlossData, GlossLineStyle } from 'src/models/gloss-data';


const textOrNbsp = (text: string, style?: GlossLineStyle) => {
    if (text.length < 1) return "\u00A0";

    if (style?.altSpaces) {
        text = text.replace(/[_]+/g, "\u00A0");
    }

    return text.replace(/\s+/g, "\u00A0");
}

const styleClasses = (style?: GlossLineStyle) =>
    style?.classes.filter(x => x.length > 0).map(x => `ling-style-${x}`) ?? [];


export const glossPrinter = (gloss: GlossData, dest: HTMLElement) => {
    const container = dest.createDiv({ cls: "ling-gloss" });
    container.addClasses(styleClasses(gloss.options.global));

    if (gloss.preamble?.length > 0) {
        const preamble = container.createDiv({ cls: "ling-gloss-preamble" });
        preamble.innerText = gloss.preamble;
        preamble.addClasses(styleClasses(gloss.options.preamble));
    }

    if (gloss.elements.length > 0) {
        const elements = container.createDiv({ cls: "ling-gloss-elements" });

        const hasLevelB = gloss.elements.some(el => el.levelB?.length > 0);
        const hasLevelC = gloss.elements.some(el => el.levelC?.length > 0);
        const maxNlevel = gloss.elements.reduce((acc, el) => Math.max(acc, el.nlevels.length), 0);

        for (const glelem of gloss.elements) {
            const element = elements.createDiv({ cls: "ling-gloss-element" });

            const levelA = element.createDiv({ cls: "ling-gloss-level-a" });
            levelA.innerText = textOrNbsp(glelem.levelA, gloss.options.levelA);
            levelA.addClasses(styleClasses(gloss.options.levelA));

            if (hasLevelB) {
                const levelB = element.createDiv({ cls: "ling-gloss-level-b" });
                levelB.innerText = textOrNbsp(glelem.levelB);
                levelB.addClasses(styleClasses(gloss.options.levelB));
            }

            if (hasLevelC) {
                const levelC = element.createDiv({ cls: "ling-gloss-level-c" });
                levelC.innerText = textOrNbsp(glelem.levelC);
                levelC.addClasses(styleClasses(gloss.options.levelC));
            }

            for (let index = 0; index < maxNlevel; index += 1) {
                const levelX = element.createDiv({ cls: "ling-gloss-level-x" });
                levelX.innerText = textOrNbsp(glelem.nlevels[index] ?? "");
                levelX.addClasses(styleClasses(gloss.options.nlevels));
            }
        }
    }

    if (gloss.translation?.length > 0) {
        const translation = container.createDiv({ cls: "ling-gloss-translation" });
        translation.innerText = gloss.translation;
        translation.addClasses(styleClasses(gloss.options.translation));
    }

    if (!container.hasChildNodes()) {
        errorPrinter([ "the gloss is empty, there's nothing to display" ], dest);
    }
}

export const errorPrinter = (messages: string[], dest: HTMLElement) => {
    for (const msg of messages) {
        const error = dest.createDiv({ cls: "ling-gloss-error" });
        error.innerText = msg;
    }
}