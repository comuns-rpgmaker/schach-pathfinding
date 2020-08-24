/**
 * @file maybe.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * "Maybe" data type.
 */

export type Just<T> = {
    readonly present: true,
    readonly value: T
};

export type Empty = {
    readonly present: false,
    readonly value?: never
};

export type Maybe<T> = Just<T> | Empty;

/** 
 * @param value - value to be returned.
 * 
 * @returns the given value wrapped in a Maybe.
 */
export function just<T>(value: T): Just<T>
{
    return { present: true, value };
}

/**
 * @returns an empty Maybe.
 */
export function empty(): Empty
{
    return { present: false };
}

/**
 * @param m - maybe value to be checked.
 * 
 * @returns `true` if `m` is Empty.
 */
export function isEmpty(m: Maybe<unknown>): m is Empty
{
    return !m.present;
}

/**
 * @param m - maybe value to be mapped.
 * @param f - mapping to be applied on the value.
 * 
 * @returns Empty if `m` is Empty or a Just with the mapped value if it is not.
 */
export function map<T, U>(m: Maybe<T>, f: (v: T) => U): Maybe<U>
{
    if (isEmpty(m)) return empty();

    return just(f(m.value));
}

/**
 * @param m - maybe value to be mapped.
 * @param f - mapping to be applied on the value.
 * 
 * @returns Empty if `m` is Empty or a Just with the mapped value if it is not.
 */
export function flatMap<T, U>(m: Maybe<T>, f: (v: T) => Maybe<U>): Maybe<U>
{
    if (isEmpty(m)) return empty();

    return f(m.value);
}
