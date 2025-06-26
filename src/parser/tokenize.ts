import { ICommand, IToken } from "src/data/parser";
import { Result, resultOk, resultErr } from "src/utils";


interface ILine {
    line: string;
    lineNo: number;
    indent: boolean;
}

const NewLineRegex = /\r\n|[\r\n\u2028\u2029]/;
const IndentRegex = /^[ \t\v\f\u00A0]+/;

function* iterateLines(input: string): Generator<ILine> {
    let lineNo = 0;

    for (let line of input.split(NewLineRegex)) {
        const indent = IndentRegex.test(line);

        line = line.trim();
        lineNo += 1;

        // Skip lines with comments
        if (line.startsWith("#")) continue;

        if (line.length > 0) {
            yield { line, lineNo, indent };
        }
    }
}

function tokenizeLine(lineNo: number, line: string): IToken[] {
    let isEscape = false;
    let isQuoted = false;

    const buffer = <string[]>[];
    const tokens = <IToken[]>[];

    for (const char of line) {
        if (isEscape) {
            isEscape = false;

            switch (char) {
                case '[':
                case ']':
                case '^':
                    buffer.push(char);
                    break;

                default:
                    // Print the escape character verbatim for stuff that doesn't need escaping
                    buffer.push('^');
                    buffer.push(char);
                    break;
            }
        } else if (isQuoted) {
            switch (char) {
                case '[':
                    throw `found an invalid “[” (line ${lineNo})`;

                case '^':
                    isEscape = true;
                    break;

                case ']':
                    tokens.push({
                        type: "quoted",
                        value: buffer.join(""),
                    });

                    buffer.length = 0;
                    isQuoted = false;
                    break;

                default:
                    buffer.push(char);
                    break;
            }
        } else {
            switch (char) {
                case ']':
                    throw `found an invalid “]” (line ${lineNo})`;

                case '^':
                    isEscape = true;
                    break;

                case '[':
                case ' ':
                case '\t':
                case '\v':
                case '\f':
                case '\u00A0':
                    if (buffer.length > 0) {
                        tokens.push({
                            type: "simple",
                            value: buffer.join(""),
                        });
                    }

                    buffer.length = 0;
                    isQuoted = (char === '[');
                    break;

                default:
                    buffer.push(char);
                    break;
            }
        }
    }

    if (isQuoted) {
        throw `found a “[” without a matching “]” (line ${lineNo})`;
    }

    if (buffer.length > 0) {
        tokens.push({
            type: "simple",
            value: buffer.join(""),
        });
    }

    return tokens;
}

function tryGetCommand(lineNo: number, token?: IToken): ICommand | null {
    if (token?.type !== "simple") return null;
    if (!token.value.startsWith('\\')) return null;

    const star = token.value.endsWith('*');
    const name = star ? token.value.slice(1, -1) : token.value.slice(1);

    return { lineNo, name, star, params: [] };
}


export const tokenize = (input: string): Result<ICommand[]> => {
    const commands = <ICommand[]>[];
    let errors: string[] | null = null;

    for (const {lineNo, line, indent} of iterateLines(input)) {
        try {
            const tokens = tokenizeLine(lineNo, line);

            // Get the last command if the line starts with an indent
            // Or try to parse the next command if it doesn't
            const command = indent ? commands.last() : tryGetCommand(lineNo, tokens.shift());
            if (command == null) throw `found values without a command (line ${lineNo})`;

            command.params.push(...tokens);

            if (!indent) {
                // Append the newly parsed command to the final list
                commands.push(command);
            }
        } catch (error) {
            errors ??= [];
            errors.push(error);
        }
    }

    return errors !== null ? resultErr(errors) : resultOk(commands);
}