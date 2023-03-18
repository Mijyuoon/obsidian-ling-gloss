import { ParserOptions } from 'src/models/parser-options';
import { Token } from 'src/models/token';
import { CommandType, Command, SetOptionType, SetOption } from 'src/models/command';
import { GlossData, GlossElement, GlossOptions, GlossLineStyle, initGlossData, initGlossElement, initGlossLineStyle } from 'src/models/gloss-data';
import { gatherLines, tokenizeLine, makeTokenError } from 'src/token-functions';
import { iterateParser, isComment, getCommand, getCombinedElement, getSetOption } from 'src/parse-functions';


type KeysOfType<O, T> = { [K in keyof O]: O[K] extends T ? K : never }[keyof O]
type OptionalKeysOfType<O, T> = NonNullable<{ [K in keyof O]?: O[K] extends T | undefined ? K : never }[keyof O]>


const GlossStrings: Partial<Record<CommandType, KeysOfType<GlossData, string>>> = {
    [CommandType.ex]: "preamble",
    [CommandType.ft]: "translation",
}

const GlossLevels: Partial<Record<CommandType, keyof GlossElement>> = {
    [CommandType.gla]: "levelA",
    [CommandType.glb]: "levelB",
    [CommandType.glc]: "levelC",
}

const GlossLineStyles: Partial<Record<SetOptionType, OptionalKeysOfType<GlossOptions, GlossLineStyle>>> = {
    [SetOptionType.exstyle]: "preamble",
    [SetOptionType.ftstyle]: "translation",
    [SetOptionType.glastyle]: "levelA",
    [SetOptionType.glbstyle]: "levelB",
    [SetOptionType.glcstyle]: "levelC",
}

export class GlossParser {
    private isNlevel: boolean;

    private glossData: GlossData;
    private errorMessages: string[] = [];

    constructor(options?: ParserOptions) {
        this.isNlevel = options?.nlevel ?? false;
    }

    public errors(): string[] { return this.errorMessages; }

    public parse(input: string): GlossData {
        this.glossData = initGlossData();
        this.errorMessages = [];

        for (const line of gatherLines(input)) {
            try {
                const tokens = tokenizeLine(line);
                if (isComment(tokens)) continue;

                const errTokens = iterateParser(tokens, getCommand, cmd => this.parseCommand(cmd));
                if (errTokens != null) throw `don't know what to do with “${makeTokenError(errTokens)}”`;
            } catch (err) {
                this.errorMessages.push(err);
            }
        }

        return this.glossData;
    }

    private parseCommand({ text, type, params }: Command) {
        switch (type) {
            case CommandType.ex:
            case CommandType.ft:
                this.parseStringField(params, GlossStrings[type]!);
                break;

            case CommandType.gla:
            case CommandType.glb:
            case CommandType.glc:
                if (this.isNlevel) throw `command “${text}” can't be used in nlevel mode`;
                this.parseGlossElement(params, GlossLevels[type]!);
                break;

            case CommandType.gl:
                if (!this.isNlevel) throw `command “${text}” can't be used in regular mode`;
                this.parseCombinedElements(params);
                break;

            case CommandType.set:
                this.parseOptionsList(params);
                break;

            default: throw `command “${text}” is not known`;
        }
    }

    private parseSetOption({ text, type, values }: SetOption) {
        switch (type) {
            case SetOptionType.exstyle:
            case SetOptionType.ftstyle:
            case SetOptionType.glastyle:
            case SetOptionType.glbstyle:
            case SetOptionType.glcstyle:
                this.parseLineStyleArrayField(values, GlossLineStyles[type]!, "classes");
                break;

            default: throw `option “${text}” is not known`;
        }
    }

    private parseStringField(params: Token[], key: KeysOfType<GlossData, string>) {
        if (params.length < 1) throw `no value provided for “${key}”`;

        this.glossData[key] = params.map(t => t.text).join(" ");
    }

    private parseGlossElement(params: Token[], key: KeysOfType<GlossElement, string>) {
        const elements = this.glossData.elements;

        while (elements.length < params.length) {
            elements.push(initGlossElement());
        }

        for (let ix = 0; ix < elements.length; ix += 1) {
            elements[ix][key] = params[ix]?.text ?? "";
        }
    }

    private parseCombinedElements(params: Token[]) {
        const elements = this.glossData.elements;
        elements.length = 0;

        const errTokens = iterateParser(params, getCombinedElement, elem => elements.push(elem));
        if (errTokens != null) throw `don't know how to parse ${makeTokenError(errTokens)}`;
    }

    private parseOptionsList(params: Token[]) {
        const options: SetOption[] = [];

        const errTokens = iterateParser(params, getSetOption, opt => options.push(opt));
        if (errTokens != null) throw `don't know how to parse ${makeTokenError(errTokens)}`;

        options.forEach(opt => this.parseSetOption(opt));
    }

    private parseLineStyleArrayField(values: string[], section: OptionalKeysOfType<GlossOptions, GlossLineStyle>, field: KeysOfType<GlossLineStyle, string[]>) {
        if (values.length < 1) throw `no values provided for “${section}”`;

        const invalid = values.find(x => !/^[a-z0-9-]+$/i.test(x));
        if (invalid != null) throw `“${invalid}” isn't a valid style name`;

        const option = this.glossData.options[section] ??= initGlossLineStyle();
        option[field] = values;
    }
}