import { ParserOptions } from 'src/models/parser-options';
import { TokenType, Token } from 'src/models/token';
import { CommandType, Command } from 'src/models/command';
import { GlossData, initGlossData, initGlossElement } from 'src/models/gloss-data';
import { gatherLines, tokenizeLine } from 'src/token-functions';
import { iterateParser, makeTokenError, isComment, getCommand, getCombinedElement } from 'src/parse-functions';


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
            case CommandType.Preamble:
                this.parseStringField(params, str => ({ preamble: str }));
                break;

            case CommandType.Translation:
                this.parseStringField(params, str => ({ translation: str }));
                break;

            case CommandType.LevelA:
                if (this.isNlevel) throw `command “${text}” can't be used in nlevel mode`;
                this.parseGlossElement(params, str => ({ levelA: str }));
                break;

            case CommandType.LevelB:
                if (this.isNlevel) throw `command “${text}” can't be used in nlevel mode`;
                this.parseGlossElement(params, str => ({ levelB: str }));
                break;

            case CommandType.LevelC:
                if (this.isNlevel) throw `command “${text}” can't be used in nlevel mode`;
                this.parseGlossElement(params, str => ({ levelC: str }));
                break;

            case CommandType.Combined:
                if (!this.isNlevel) throw `command “${text}” can't be used in regular mode`;
                this.parseCombinedElements(params);
                break;

            default: throw `command “${text}” is not known`;
        }
    }

    private parseStringField(params: Token[], func: (str: string) => any) {
        const string = params.map(t => t.text).join(" ");
        Object.assign(this.glossData, func(string));
    }

    private parseGlossElement(params: Token[], func: (str: string) => any) {
        const elements = this.glossData.elements;

        while (elements.length < params.length) {
            elements.push(initGlossElement());
        }

        for (let ix = 0; ix < elements.length; ix += 1) {
            Object.assign(elements[ix], func(params[ix]?.text ?? ""));
        }
    }

    private parseCombinedElements(params: Token[]) {
        const elements = this.glossData.elements;
        elements.length = 0;

        const errTokens = iterateParser(params, getCombinedElement, elem => elements.push(elem));
        if (errTokens != null) throw `don't know how to parse ${makeTokenError(errTokens)}`;
    }
};