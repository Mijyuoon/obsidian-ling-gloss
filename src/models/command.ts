import { Token } from 'src/models/token';

export enum CommandType {
    Preamble = "ex",
    Translation = "ft",
    LevelA = "gla",
    LevelB = "glb",
    LevelC = "glc",
    Combined = "gl",
}

export interface Command {
    text: string;
    type: CommandType | null;
    params: Token[];
}