/**
 * @file flood-fill.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * Flood fill algorithm implementation.
 */

import { Deque } from '../util/deque';
import { isEmpty } from '../util/maybe';

import type { Graph, DiGraph, Colored } from '../data/graph';

/**
 * Applies flood-fill to a generic colored graph.
 * 
 * @param start - starting vertex.
 * @param color - color to fill in.
 * @param g - colored graph.
 * @param callback - callback for each recolored vertex.
 * 
 * @note if `g` defines `size`, it is used to preallocate resources. This will
 *       usually yield significantly better performance.
 * 
 * @returns a list with all return values from the callback calls.
 */
export function floodFill<T, C, U>(
    start: T,
    color: C,
    g: (Graph<T> | DiGraph<T>) & Colored<T, C>,
    callback?: (v: T, c?: C) => U
): U[]
{
    const startColor = g.color(start);
    if (startColor === color) return [];
    
    g.setColor(start, color);

    const q = new Deque<T>();
    q.push(start);

    const mapped: U[] = [];

    for (let current = q.shift(); !isEmpty(current); current = q.shift())
    {
        const vertex = current.value;
        if (callback) mapped.push(callback(vertex));

        const next = 'from' in g ? g.from(vertex) : g.neighbors(vertex);
        next.filter(target => g.color(target) === startColor)
            .forEach(target =>
                {
                    g.setColor(target, color);
                    q.push(target);
                }
            );
    }

    return mapped;
}
