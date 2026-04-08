import { PluginSettingsWrapper } from "src/settings/wrapper";
import { formatWhitespace } from "src/utils";

export class MarkupRenderer {
    constructor(private settings: PluginSettingsWrapper) { }

    render(text: string): DocumentFragment {
        const parsed = formatWhitespace(text);
        const fragment = new DocumentFragment();

        fragment.appendText(text);

        return fragment;
    }
}