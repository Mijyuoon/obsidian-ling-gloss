import { IGlossOptions, getDefaultGlossOptions } from "./gloss";


export type GlossAlignMode = "none" | "default" | "custom";

export interface IFancyRenderFlags {
    cliticMarks: boolean;
    infixBrackets: boolean;
    nullElement: boolean;
}

export interface IPluginSettings {
    alignMode: GlossAlignMode;
    alignCenter: boolean;
    alignLevel: number;
    alignCustom: string[];
    fancyRender: IFancyRenderFlags;
    gloss: IGlossOptions;
}


export const getDefaultAlignMarkers = (): string[] => (["-", "=", "~"]);

export const getDefaultFancyRenderFlags = (): IFancyRenderFlags => ({
    cliticMarks: false,
    infixBrackets: false,
    nullElement: false,
});

export const getDefaultPluginSettings = (): IPluginSettings => ({
    alignMode: "none",
    alignCenter: false,
    alignLevel: 0,
    alignCustom: getDefaultAlignMarkers(),
    fancyRender: getDefaultFancyRenderFlags(),
    gloss: getDefaultGlossOptions(),
});