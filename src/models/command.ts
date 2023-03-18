import { Token } from 'src/models/token';

export enum CommandType {
    ex,
    ft,
    gla,
    glb,
    glc,
    gl,
    set,
}

export enum SetOptionType {
    exstyle,
    ftstyle,
    glastyle,
    glbstyle,
    glcstyle,
}

export interface Command {
    text: string;
    type: CommandType | null;
    params: Token[];
}

export interface SetOption {
    text: string;
    type: SetOptionType | null;
    values: string[];
}