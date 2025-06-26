import { ChainedKeysOf } from "src/utils";

type TokenType = "simple" | "quoted";

export interface IToken {
    type: TokenType;
    value: string;
}

export interface ICommand {
    lineNo: number;
    name: string;
    star: boolean;
    params: IToken[];
}


export type CommandCallback<T> = (data: T, params: IToken[], star: boolean) => void;

export type CommandTable<T> = Record<string, CommandCallback<T>>;


type SetOptionType = "flag" | "one" | "list";

export type SetOptionParams<T> = {type: SetOptionType, key: ChainedKeysOf<T>};

export type SetOptionTable<T> = Record<string, SetOptionParams<T>>;