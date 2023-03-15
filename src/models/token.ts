export enum TokenType {
    Simple,
    Bracketed,
}

export interface Token {
    text: string;
    type: TokenType;
}