/**
 * @file array.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * Array utility functions. 
 */

export function flatMap<T, U>(array: T[], f: (x: T) => U[]): U[]
{
    return array.reduce((acc, x) => [...acc, ...f(x)], []);
}

export function zip<T, U>(a: T[], b: U[]): [T, U][]
{
    return a.map((x, index) => [x, b[index]]);
}
