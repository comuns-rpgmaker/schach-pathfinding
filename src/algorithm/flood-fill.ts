/**
 * @file flood-fill.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * Flood fill algorithm implementation.
 */

import { Deque } from "../util/deque";

import type { Graph, Colored } from "../data/graph";

/**
 * Applies flood-fill to a generic colored graph.
 * 
 * @param start - starting vertex.
 * @param color - color to fill in.
 * @param g - colored graph.
 * @param callback - callback for each recolored vertex.
 * 
 * @returns a list with all return values from the callback calls.
 */
export function floodFill<T, C, U>(
    start: T,
    color: C,
    g: Graph<T> & Colored<T, C>,
    callback?: (v: T, c?: C) => U
): U[]
{
    const startColor = g.color(start);
    if (!startColor || startColor === color) return [];

    g.setColor(start, color);

    const q = new Deque<T>();
    q.push(start);

    const mapped: U[] = [];

    for (let current = q.shift(); current; current = q.shift())
    {
        const vertex = current;
        if (callback) mapped.push(callback(vertex));

        g.from(vertex)
            .filter(target => g.color(target) === startColor)
            .forEach(target =>
            {
                g.setColor(target, color);
                q.push(target);
            });
    }

    return mapped; 
}
