export type Nullable<T> = T | null | undefined;

export type TObject = { [key: string]: any };

export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

export type KeysOfType<O, T> = { [K in keyof O]: O[K] extends T ? K : never }[keyof O];

export type ChainedKeysOf<T> = { [K in keyof T]: T[K] extends object ? [K, ...ChainedKeysOf<T[K]>] : [K] }[keyof T];

export type Result<T> = {
    success: true;
    data: T;
} | {
    success: false;
    errors: string[];
};


export const resultOk = <T>(data: T): Result<T> =>
    ({ success: true, data });

export const resultErr = <T = any>(errors: string[]): Result<T> =>
    ({ success: false, errors });


const isObject = (value: any): value is TObject =>
    value !== null && typeof value === "object" && !Array.isArray(value);

export const deepMerge = <T extends TObject>(target: T, source: DeepPartial<T>): T => {
    const result: TObject = { ...target };

    if (source == null) return result as T;

    for (const key of Object.keys(source)) {
        if (isObject(source[key])) {
            result[key] = isObject(result[key])
                ? deepMerge(result[key], source[key] as any)
                : { ...source[key] };
        } else {
            result[key] = source[key];
        }
    }

    return result as T;
}

export const deepCopy = <T extends any>(source: T, arrays = true): T => {
    if (isObject(source)) {
        const result: TObject = {};

        for (const key of Object.keys(source)) {
            result[key] = deepCopy(source[key] as any, arrays);
        }

        return result as T;
    }

    if (arrays && Array.isArray(source)) {
        return source.map((el: any) => deepCopy(el, arrays)) as T;
    }

    return source;
}


export function* range(limit: number, start = 0): Generator<number> {
    for (let index = start; index < limit; index += 1) yield index;
}

export const arrayFill = <T>(array: T[], limit: number, func: (index: number) => T): T[] => {
    if (array.length < limit) {
        const from = array.length;
        array.length = limit;

        for (const index of range(limit, from)) {
            array[index] = func(index);
        }
    }

    return array;
}


const CssClassRegex = /[^a-z0-9_-]+/ig;

export const sanitizeCssClass = <T extends string | string[]>(classes: T): T =>
    Array.isArray(classes)
        ? classes.map(cls => cls.replace(CssClassRegex, "-")) as T
        : classes.replace(CssClassRegex, "-") as T;