import { Token, TokenType } from 'src/models/token';
import { Command, CommandType, SetOption, SetOptionType } from 'src/models/command';
import { GlossElement } from 'src/models/gloss-data';


export type ParserFunc<T> = (tokens: Token[]) => [T | null, Token[]];
export type ParserCallback<T> = (element: T) => void;

export const iterateParser = <T>(tokens: Token[], parser: ParserFunc<T>, callback: ParserCallback<T>): Token[] | null => {
    while (tokens.length > 0) {
        const [item, remainder] = parser(tokens);
        if (item == null) return remainder;

        callback(item);
        tokens = remainder;
    }

    return null;
}


const isSimple = (tokens: Token[], index = 0) =>
    tokens[index]?.type === TokenType.Simple;

const gatherBracketed = (tokens: Token[], start = 1) => {
    let index = start;
    while (tokens[index]?.type === TokenType.Bracketed) {
        index += 1;
    }

    return tokens.slice(start, index);
}

export const isComment = (tokens: Token[]): boolean =>
    isSimple(tokens) && tokens[0].text.startsWith("#");

export const getCommand: ParserFunc<Command> = (tokens) => {
    if (!isSimple(tokens)) return [null, tokens];

    const match = tokens[0].text.match(/^\\(.+)$/);
    if (match == null) return [null, tokens];

    const cmdText = match[1];
    // @ts-ignore
    const cmdType = CommandType[cmdText.toLowerCase()];

    const command: Command = {
        text: cmdText,
        type: cmdType ?? null,
        params: tokens.slice(1),
    };

    return [command, []];
}

export const getCombinedElement: ParserFunc<GlossElement> = (tokens) => {
    if (!isSimple(tokens)) return [null, tokens];

    const levels = gatherBracketed(tokens).map(x => x.text);

    const element: GlossElement = {
        levelA: tokens[0].text,
        levelB: levels[0] ?? "",
        levelC: levels[1] ?? "",
    };

    return [element, tokens.slice(levels.length + 1)];
}

export const getSetOption: ParserFunc<SetOption> = (tokens) => {
    if (!isSimple(tokens)) return [null, tokens];

    const optText = tokens[0].text;
    // @ts-ignore
    const optType = SetOptionType[optText.toLowerCase()];

    const option: SetOption = {
        text: optText,
        type: optType ?? null,
        values: tokens.slice(1).map(x => x.text),
    };

    return [option, []];
}