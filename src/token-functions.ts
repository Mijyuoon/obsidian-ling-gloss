import { Token, TokenType } from 'src/models/token';


const stripIndent = (input: string) => {
    const minIndent = input.match(/^\s*(?=\S)/gm)
        ?.reduce((a, x) => Math.min(a, x.length), Infinity) ?? 0;

    if (minIndent > 0) {
        const regex = new RegExp(`^\\s{${minIndent}}`, "gm");
        return input.replace(regex, "");
    }

    return input;
}

export const gatherLines = (input: string): string[] => {
    const outLines = [];
    const lineBuf = [];

    const trInput = stripIndent(input);
    for (const line of trInput.split(/\n+/)) {
        if (!/^\s+/.test(line)) {
            if (lineBuf.length > 0) {
                outLines.push(lineBuf.join(" "));
            }

            lineBuf.length = 0;
        }

        const trLine = line.trim();
        if (trLine.length > 0) {
            lineBuf.push(trLine);
        }
    }

    if (lineBuf.length > 0) {
        outLines.push(lineBuf.join(" "));
    }

    return outLines;
}


const replaceSpecial = (token: string) => {
    switch (token) {
        case "//": return "";
        default: return token;
    }
}

export const tokenizeLine = (line: string): Token[] => {
    const outTokens: Token[] = [];
    const tokenBuf: string[] = [];

    const makeErrorPos = () =>
        [outTokens.last()?.text ?? "", tokenBuf.join("")]
            .filter(x => x.length > 0)
            .join(" ");

    let isBracket = false;

    for (const char of line.trim()) {
        if (isBracket) {
            switch (char) {
                case '[':
                    throw `invalid “[” found around “${makeErrorPos()}”`;

                case ']':
                    outTokens.push({
                        type: TokenType.Bracketed,
                        text: tokenBuf.join(""),
                    });

                    tokenBuf.length = 0;
                    isBracket = false;
                    break;

                default:
                    tokenBuf.push(char);
                    break;
            }
        } else {
            switch (char) {
                case ']':
                    throw `invalid “]” found around “${makeErrorPos()}”`;

                case '[':
                case ' ':
                case '\t':
                    if (tokenBuf.length > 0) {
                        outTokens.push({
                            type: TokenType.Simple,
                            text: replaceSpecial(tokenBuf.join("")),
                        });
                    }

                    tokenBuf.length = 0;
                    isBracket = (char == '[');
                    break;

                default:
                    tokenBuf.push(char);
                    break;
            }
        }
    }

    if (isBracket) throw `a “[” without matching “]” found around “${makeErrorPos()}”`;

    if (tokenBuf.length > 0) {
        outTokens.push({
            type: TokenType.Simple,
            text: replaceSpecial(tokenBuf.join("")),
        });
    }

    return outTokens;
}


export const makeTokenError = (tokens: Token[]) => {
    const maxlen = 20;

    const text = tokens.slice(0, 2).map(t => t.text).join(" ");
    if (text.length <= maxlen) return text;

    return text.substring(0, maxlen).trim() + "…";
}