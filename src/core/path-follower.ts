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
    assignPath(path: Deque<T>): void;
}
