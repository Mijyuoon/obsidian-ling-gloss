import { IToken } from "src/data/parser";
import { Nullable, TObject, range } from "src/utils";

export const checkAssertion = (assert: boolean, errorType: string) => {
    if (!assert) throw `${errorType} provided to “@@” command`;
}

export const checkNoValues = (params: IToken[]) =>
    checkAssertion(params.length > 0, "no values");

export const checkMultiValues = (params: IToken[]) =>
    checkAssertion(params.length < 2, "more than one value");

export const checkAnyValues = (params: IToken[]) =>
    checkAssertion(params.length < 1, "more than no values");

export const checkValueSimple = (param: Nullable<IToken>, errorType: string) =>
    checkAssertion(param?.type === "simple", errorType);

export const paramsJoin = (params: IToken[]): string => {
    checkNoValues(params);

    return params.map(p => p.value).join(" ");
}

export const paramsOne = (params: IToken[]): string => {
    checkNoValues(params);
    checkMultiValues(params);

    return params.first()?.value ?? "";
}

export const gatherValuesQuoted = (params: IToken[]): string[][] => {
    const result = <string[][]>[];

    for (const param of params) {
        if (param.type === "quoted") {
            const group = result.last();
            if (group == null) continue;

            group.push(param.value);
        } else {
            result.push([ param.value ]);
        }
    }

    return result;
}

export const updateObjectField = <T>(object: TObject, keys: string[], func: (value: T) => T) => {
    if (keys.length < 1) return;

    for (const index of range(keys.length - 1)) {
        object = object[keys[index]];
    }

    const key = keys.at(-1)!;
    object[key] = func(object[key]);
};