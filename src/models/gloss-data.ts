export interface GlossLineStyle {
    classes: string[];
    altSpaces?: boolean;
}

export interface GlossOptions {
    global?: GlossLineStyle;
    preamble?: GlossLineStyle;
    translation?: GlossLineStyle;
    levelA?: GlossLineStyle;
    levelB?: GlossLineStyle;
    levelC?: GlossLineStyle;
    nlevels?: GlossLineStyle;
}

export interface GlossElement {
    levelA: string;
    levelB: string;
    levelC: string;
    nlevels: string[];
}

export interface GlossData {
    label: string;
    preamble: string;
    elements: GlossElement[];
    translation: string;
    options: GlossOptions;
}


export const initGlossElement = (): GlossElement => ({
    levelA: "",
    levelB: "",
    levelC: "",
    nlevels: [],
})

export const initGlossLineStyle = (): GlossLineStyle => ({
    classes: [],
})

export const initGlossData = (): GlossData => ({
    label: "",
    preamble: "",
    elements: [],
    translation: "",
    options: {},
})