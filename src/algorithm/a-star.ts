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
import { Deque } from "util/deque";

import type { Graph, Weighted } from "data/graph";

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
    const sourceId = g.id(source)!;
    const targetId = g.id(target)!;

    const gscore = new Map<number, number>();
    gscore.set(sourceId, 0);

    const fscore = new Map<number, number>();
    fscore.set(sourceId, heuristic(source, target));

    const q = new PriorityQueue<{ id: number, node: T }>(
        ({ id: idA }, { id: idB }) => fscore.get(idA)! < fscore.get(idB)!);

    const open = new Set<number>();
    q.add({ id: sourceId, node: source });

    const cameFrom = new Map<number, T>();

    for (let current = q.next(); !current.done; current = q.next()) {
        const { id: nodeId, node } = current.value;

        if (nodeId == targetId)
        {
            return makePath(g, target, cameFrom);
        }
        else
        {
            open.delete(nodeId);
            const nodeScore = gscore.get(nodeId)!;

            g.from(node).forEach((neighbor) =>
            {
                const score = nodeScore + g.weight(node, neighbor)!;

                const neighborId = g.id(neighbor)!;
                if (score < (gscore.get(neighborId) ?? Infinity))
                {
                    cameFrom.set(neighborId, node);
                    gscore.set(neighborId, score);
                    fscore.set(neighborId, score + heuristic(neighbor, target));

                    if (!open.has(neighborId)) {
                        q.add({ id: neighborId, node: neighbor });
                        open.add(neighborId);
                    }
                }
            });
        }
    }

    return undefined;
}

function makePath<T>(g: Graph<T>, target: T, cameFrom: Map<number, T>): Deque<T>
{
    const path = new Deque<T>();
    path.push(target);

    let currentId: number;
    let current = target;
    while (cameFrom.has(currentId = g.id(current)!))
    {
        current = cameFrom.get(currentId)!;
        path.unshift(current);
    }

    return path;
}
