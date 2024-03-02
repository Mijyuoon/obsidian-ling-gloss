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
    // Number on the left side
    num,
    // Title or label
    lbl,
    // Source or reference
    src,
    // Miscelaneous options
    set,
}

export enum SetOptionType {
    // Syle classes for gloss elements
    style,
    exstyle,
    ftstyle,
    srcstyle,
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