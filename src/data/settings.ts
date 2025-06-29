import { IGlossOptions, getDefaultGlossOptions } from "./gloss";


export type GlossAlignMode = "none" | "default" | "custom";

export interface IPluginSettings {
    alignMode: GlossAlignMode;
    alignCenter: boolean;
    alignLevel: number;
    alignCustom: string[];
    gloss: IGlossOptions;
}


export const getDefaultAlignMarkers = (): string[] => (["-", "=", "~"]);

export const getDefaultPluginSettings = (): IPluginSettings => ({
    alignMode: "none",
    alignCenter: false,
    alignLevel: 0,
    alignCustom: getDefaultAlignMarkers(),
    gloss: getDefaultGlossOptions(),
});