import { IGlossOptionStyles } from "src/data/gloss";
import { sanitizeCssClasses } from "src/utils";


export const getStyleKind = (kind: string) =>
    kind.length > 0 ? `ling-gloss-${kind}` : "ling-gloss";

export const getStyleClasses = (classes: string[]) =>
    sanitizeCssClasses(classes).map(cls => `ling-style-${cls}`);

export const getLevelMetadata = (level: number): [string, keyof IGlossOptionStyles] => {
    switch (level) {
        case 0: return ["level-a", "levelA"];
        case 1: return ["level-b", "levelB"];
        case 2: return ["level-c", "levelC"];
        default: return ["level-x", "levelX"];
    }
}


interface IBlockOptions {
    kind: string;
    text: string;
    cls?: string[];
    always?: boolean;
    format?: (text: string) => string | DocumentFragment;
}

export const formatWhitespace = (text: string, nbsp = false): string =>
    text.replace(/\s+/g, nbsp ? "\u00A0" : " ");

export const renderBlock = (target: HTMLElement, options: IBlockOptions) => {
    if (options.text.length < 1 && !options.always) return;

    target.createDiv({
        text: options.format?.(options.text) ?? formatWhitespace(options.text),
        cls: [getStyleKind(options.kind), ...getStyleClasses(options.cls ?? [])],
    });
};