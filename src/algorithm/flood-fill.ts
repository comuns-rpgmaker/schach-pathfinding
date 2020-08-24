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

type Sized = {
    readonly size: number;
}

function isSized(x: Partial<Sized>): x is Sized
{
    return x.size !== undefined;
}

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
 */
export function floodFill<T, C>(
    start: T,
    color: C,
    g: (Graph<T> | DiGraph<T>) & Colored<T, C> & Partial<Sized>,
    callback?: (v: T, c?: C) => unknown
): void
{
    const startColor = g.color(start);
    if (startColor === color) return;
    
    g.setColor(start, color);

    const q = new Deque<T>(isSized(g) ? g.size : 32);
    q.push(start);

    for (let current = q.shift(); !isEmpty(current); current = q.shift())
    {
        const vertex = current.value;
        if (callback) callback(vertex);

        const next = 'from' in g ? g.from(vertex) : g.neighbors(vertex);
        next.filter(target => g.color(target) === startColor)
            .forEach(target =>
                {
                    g.setColor(target, color);
                    q.push(target);
                }
            );
    }
}
