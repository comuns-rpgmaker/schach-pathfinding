
export type Relation<T> = (a: T, b: T) => boolean;

export function less<T>(a: T, b: T) { return a < b; }
