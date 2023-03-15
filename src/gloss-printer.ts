import { GlossData } from 'src/models/gloss-data';


const textOrNbsp = (text: string) => text.length > 0 ? text : "\u00A0";

export const glossPrinter = (gloss: GlossData, dest: HTMLElement) => {
    const container = dest.createDiv({ cls: "ling-gloss" });

    if (gloss.preamble?.length > 0) {
        const preamble = container.createDiv({ cls: "ling-gloss-preamble" });
        preamble.innerText = gloss.preamble;
    }

    if (gloss.elements.length > 0) {
        const elements = container.createDiv({ cls: "ling-gloss-elements" });

        const hasLevelB = gloss.elements.some(el => el.levelB?.length > 0);
        const hasLevelC = gloss.elements.some(el => el.levelC?.length > 0);

        for (const glelem of gloss.elements) {
            const element = elements.createDiv({ cls: "ling-gloss-element" });

            const levelA = element.createDiv({ cls: "ling-gloss-level-a" });
            levelA.innerText = textOrNbsp(glelem.levelA ?? "");

            if (hasLevelB) {
                const levelB = element.createDiv({ cls: "ling-gloss-level-b" });
                levelB.innerText = textOrNbsp(glelem.levelB ?? "");
            }

            if (hasLevelC) {
                const levelC = element.createDiv({ cls: "ling-gloss-level-c" });
                levelC.innerText = textOrNbsp(glelem.levelC ?? "");
            }
        }
    }

    if (gloss.translation?.length > 0) {
        const translation = container.createDiv({ cls: "ling-gloss-translation" });
        translation.innerText = gloss.translation;
    }

    if (!container.hasChildNodes()) {
        errorPrinter([ "the gloss is empty, there's nothing to display" ], dest);
    }
};

export const errorPrinter = (messages: string[], dest: HTMLElement) => {
    for (const msg of messages) {
        const error = dest.createDiv({ cls: "ling-gloss-error" });
        error.innerText = msg;
    }
};