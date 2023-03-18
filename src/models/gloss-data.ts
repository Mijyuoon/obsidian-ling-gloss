export interface GlossLineStyle {
    classes: string[];
}

export interface GlossOptions {
    preamble?: GlossLineStyle;
    translation?: GlossLineStyle;
    levelA?: GlossLineStyle;
    levelB?: GlossLineStyle;
    levelC?: GlossLineStyle;
}

export interface GlossElement {
    levelA: string;
    levelB: string;
    levelC: string;
}

export interface GlossData {
    preamble: string;
    elements: GlossElement[];
    translation: string;
    options: GlossOptions;
}


export const initGlossElement = (): GlossElement => ({
    levelA: "",
    levelB: "",
    levelC: "",
})

export const initGlossLineStyle = (): GlossLineStyle => ({
    classes: [],
})

export const initGlossData = (): GlossData => ({
    preamble: "",
    elements: [],
    translation: "",
    options: {},
})