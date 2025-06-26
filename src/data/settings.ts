import { IGlossOptions, getDefaultGlossOptions } from "./gloss";


export interface IPluginSettings {
    gloss: IGlossOptions;
}

export const getDefaultPluginSettings = (): IPluginSettings => ({
    gloss: getDefaultGlossOptions(),
});