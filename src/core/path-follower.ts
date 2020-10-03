/**
 * @file path-follower.ts
 * 
 * @author Brandt
 * @date 2020/10/02
 * @license Zlib
 * 
 * Interface for a path-following object.
 */

import { Deque } from "../util/deque";

/**
 * Interface for an object that can follow a path from a deque.
 */
export interface PathFollower<T>
{
    /**
     * Assigns a path to be followed by this object.
     * 
     * @param path - a double-ended queue of graph vertices.
     */
    assignPath(path: Deque<T>): void;
}
