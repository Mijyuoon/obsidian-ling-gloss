import { Token } from 'src/models/token';

export enum CommandType {
    // Preamble
    ex,
    // Free translation
    ft,
    // Gloss line level A
    gla,
    // Gloss line level B
    glb,
    // Gloss line level C
    glc,
    // N-level gloss elements
    gl,
    // Number or other label
    num,
    // Miscelaneous options
    set,
}

export enum SetOptionType {
    // Syle classes for gloss elements
    style,
    exstyle,
    ftstyle,
    glastyle,
    glbstyle,
    glcstyle,
    glxstyle,

    // Replace underscores with spaces in A-line
    glaspaces,
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