import { Token, TokenType } from 'src/models/token';
import { Command, CommandType } from 'src/models/command';
import { GlossElement, initGlossElement } from 'src/models/gloss-data';


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


export const makeTokenError = (tokens: Token[]) => {
    const maxlen = 20;

    const text = tokens.slice(0, 2).map(t => t.text).join(" ");
    if (text.length <= maxlen) return text;

    return text.substring(0, maxlen).trim() + "…";
}


export const isComment = (tokens: Token[]): boolean =>
    tokens[0]?.text?.startsWith("#") ?? false;


export const getCommand: ParserFunc<Command> = (tokens) => {
    if (tokens[0]?.type !== TokenType.Simple) return [null, tokens];

    const match = tokens[0]?.text?.match(/^\\(.+)$/);
    if (match == null) return [null, tokens];

    const cname = match[1].toLowerCase();
    const ctype = Object.values(CommandType).find(x => x == cname);

    const command: Command = {
        text: match[1],
        type: ctype ?? null,
        params: tokens.slice(1),
    };

    return [command, []];
}

export const getCombinedElement: ParserFunc<GlossElement> = (tokens) => {
    if (tokens[0]?.type != TokenType.Simple) return [null, tokens];

    const levels = [tokens[0]?.text];
    if (levels[0] == null) return [null, tokens];

    let sliceAt = 1;

    while (tokens[sliceAt]?.type == TokenType.Bracketed) {
        levels.push(tokens[sliceAt].text);
        sliceAt += 1;
    }

    const element = initGlossElement();
    element.levelA = levels[0];
    element.levelB = levels[1] ?? "";
    element.levelC = levels[2] ?? "";

    return [element, tokens.slice(sliceAt)];
}