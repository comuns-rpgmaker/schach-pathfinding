/**
 * @file a-star.ts
 * 
 * @author Brandt
 * @date 2020/09/19
 * @license Zlib
 * 
 * A* algorithm implementation.
 */

import { PriorityQueue } from "util/priority-queue";

import type { Graph, Weighted } from "data/graph";
import { Deque } from "main";

/**
 * Finds the shortest path between two points on a weighted graph using A*.
 * 
 * @param source - Source node.
 * @param target - Target node.
 * @param g - Weighted graph.
 * @param heuristic - Heuristic function for A*.
 * 
 * @returns shortest path between the source and target nodes as a double ended
 *          queue.
 */
export function aStar<T>(
    source: T,
    target: T,
    g: Graph<T> & Weighted<T>,
    heuristic: (s: T, t: T) => number
): Deque<T> | undefined
{
    // Terrible workaround to deal with the absence of a decent hash map and
    // equality comparison function
    const pool: any = {
        [source as any]: source,
        [target as any]: target
    };

    const visited = new Set<T>();

    const gscore = new Map<T, number>();
    gscore.set(source, 0);

    const fscore = new Map<T, number>();
    fscore.set(source, heuristic(source, target));

    const q = new PriorityQueue<T>(
        (a: T, b: T) => fscore.get(a)! < fscore.get(b)!);
    q.add(source);

    const cameFrom = new Map<T, T>();

    for (let current = q.next(); !current.done; current = q.next()) {
        if (!(current.value in pool)) pool[current.value] = current.value;
        const node = pool[current.value];
        visited.add(node);

        if (node === target)
        {
            return makePath(target, cameFrom);
        }
        else
        {
            g.from(node)
            .map(neighbor => neighbor in pool ? pool[neighbor] : (pool[neighbor] = neighbor))
            .filter(neighbor => !visited.has(neighbor))
            .forEach((neighbor) =>
            {
                const score = gscore.get(node)! + g.weight(node, neighbor)!;

                if (score < (gscore.get(neighbor) || Infinity))
                {
                    cameFrom.set(neighbor, node);
                    gscore.set(neighbor, score);
                    fscore.set(neighbor, score + heuristic(neighbor, target));

                    if (!q.has(neighbor)) q.add(neighbor);
                }
            });
        }
    }

    return undefined;
}

function makePath<T>(target: T, cameFrom: Map<T, T>): Deque<T>
{
    const path = new Deque<T>();
    path.push(target);

    let current = target;
    while (cameFrom.has(current))
    {
        current = cameFrom.get(current)!;
        path.unshift(current);
    }

    return path;
}
