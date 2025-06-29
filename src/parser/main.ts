import { IGlossData, IGlossOptions, createGlossData, createGlossElement } from "src/data/gloss";
import { IToken, ICommand, CommandTable, SetOptionTable } from "src/data/parser";
import { PluginSettingsWrapper } from "src/settings/wrapper";
import { Result, resultOk, resultErr, arrayFill, TObject } from "src/utils";

import { paramsJoin, paramsOne, checkNoValues, checkMultiValues, checkAnyValues, checkValueSimple, checkAssertion, gatherValuesQuoted, updateObjectField } from "./helpers";
import { tokenize } from "./tokenize";


export class GlossParser {
    private commandTable: CommandTable<IGlossData> = {
        // Simple string value commands
        ex: (data, params, _) => data.preamble = paramsJoin(params),
        ft: (data, params, _) => data.translation = paramsJoin(params),
        lbl: (data, params, _) => data.label = paramsJoin(params),
        src: (data, params, _) => data.source = paramsJoin(params),
        num: (data, params, _) => data.number.value = paramsOne(params),

        // Individual gloss level commands
        gla: (data, params, _) => this.handleGlossCommand(data, params, 0),
        glb: (data, params, _) => this.handleGlossCommand(data, params, 1),
        glc: (data, params, _) => this.handleGlossCommand(data, params, 2),

        // Combined n-level gloss command
        gl: (data, params, _) => this.handleMultiGlossCommand(data, params),

        // Gloss option changing command
        set: (data, params, star) => this.handleSetCommand(data, params, star),
    };

    private setOptionTable: SetOptionTable<IGlossOptions> = {
        // Assign CSS style classes
        style: { type: "list", key: ["styles", "global"] },
        exstyle: { type: "list", key: ["styles", "preamble"] },
        glastyle: { type: "list", key: ["styles", "levelA"] },
        glbstyle: { type: "list", key: ["styles", "levelB"] },
        glcstyle: { type: "list", key: ["styles", "levelC"] },
        glxstyle: { type: "list", key: ["styles", "levelX"] },
        ftstyle: { type: "list", key: ["styles", "translation"] },
        srcstyle: { type: "list", key: ["styles", "source"] },

        // Replace underscores with spaces
        glaspaces: { type: "flag", key: ["altSpaces"] },

        // Enable advanced text markup
        markup: { type: "flag", key: ["useMarkup"] },
    };

    constructor (private settings: PluginSettingsWrapper) { }

    parse(input: string, nlevel: boolean): Result<IGlossData> {
        const tokenized = tokenize(input);
        if (!tokenized.success) return resultErr(tokenized.errors);

        const glossData = createGlossData(nlevel, this.settings.get("gloss"));

        const procErrors = this.processCommands(tokenized.data, glossData);
        if (procErrors !== null) return resultErr(procErrors);

        return resultOk(glossData);
    }

    private processCommands(commands: ICommand[], data: IGlossData): string[] | null {
        let errors: string[] | null = null;

        for (const command of commands) {
            try {
                const action = this.commandTable[command.name];
                if (action == null) throw "command “@@” is not known";

                action(data, command.params, command.star);
            } catch (error) {
                error = `${error} (line ${command.lineNo})`
                    .replace("@@", command.name)
                    .replace("@1", command.params[0]?.value ?? "");

                errors ??= [];
                errors.push(error);
            }
        }

        return errors;
    }

    private handleGlossCommand(data: IGlossData, params: IToken[], level: number) {
        if (data.nlevel) throw "command “@@” is only allowed in regular mode";

        checkNoValues(params);

        arrayFill(data.elements, params.length, () => createGlossElement());

        for (const [index, elem] of data.elements.entries()) {
            arrayFill(elem.levels, level + 1, () => "");
            elem.levels[level] = params[index]?.value ?? "";
        }
    }

    private handleMultiGlossCommand(data: IGlossData, params: IToken[]) {
        if (!data.nlevel) throw "command “@@” is only allowed in n-level mode";

        checkNoValues(params);
        checkValueSimple(params.first(), "invalid gloss element");

        const bits = gatherValuesQuoted(params);
        const maxLevel = bits.reduce((acc, el) => Math.max(acc, el.length), 0);

        arrayFill(data.elements, bits.length, () => createGlossElement());

        for (const [index, elem] of data.elements.entries()) {
            arrayFill(elem.levels, maxLevel, bit => bits[index][bit] ?? "");
        }
    }

    private handleSetCommand(data: IGlossData, params: IToken[], star: boolean) {
        const [optionParam, ...valueParams] = params;
        checkValueSimple(optionParam, "no option name");

        const option = this.setOptionTable[optionParam!.value];
        checkAssertion(option != null, "unknown option “@1”");

        const object = data.options as TObject;
        const objectKeys = option.key as string[];

        switch (option.type) {
            case "flag":
                checkAnyValues(valueParams);

                // `set` – enable the flag, `set*` – disable the flag
                updateObjectField(object, objectKeys, () => !star);
                break;

            case "one":
                checkNoValues(valueParams);
                checkMultiValues(valueParams);

                updateObjectField(object, objectKeys, () => valueParams[0].value);
                break;

            case "list":
                // Do not allow no values when appending
                if (!star) checkNoValues(valueParams);

                updateObjectField(object, objectKeys, (value: string[]) => {
                    const newValue = valueParams.map(p => p.value);

                    // `set` – append to the list, `set*` – replace the list
                    return star ? newValue : [...value, ...newValue];
                });
                break;
        }
    }
}