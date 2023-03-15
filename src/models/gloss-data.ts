export interface GlossElement {
    levelA: string;
    levelB: string;
    levelC: string;
};

export interface GlossData {
    preamble: string;
    elements: GlossElement[];
    translation: string;
};


export const initGlossElement = (): GlossElement => ({
    levelA: "",
    levelB: "",
    levelC: "",
});

export const initGlossData = (): GlossData => ({
    preamble: "",
    elements: [],
    translation: "",
});