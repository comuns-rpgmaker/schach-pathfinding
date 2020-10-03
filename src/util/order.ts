/**
 * @file order.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * Ordering relation definitions.
 */

/**
 * Generic relation truth-function type.
 * 
 * @template T domain of the relation.
 */
export type Relation<T> = (lhs: T, rhs: T) => boolean;

/**
 * Defines a strict order between values.
 * 
 * @param lhs - left hand side.
 * @param rhs - right hand side.
 */
export function less<T>(lhs: T, rhs: T) { return lhs < rhs; }
