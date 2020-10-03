import { Graph } from "../data/graph";
/**
 * @file target-follower.ts
 * 
 * @author Brandt
 * @date 2020/10/02
 * @license Zlib
 * 
 * Interface for a target-following object.
 */

import { Deque } from "../util/deque";

/**
 * Interface for an strategy used to follow some target.
 */
export interface TargetFollowingStrategy<U, G extends Graph<U>>
{
    path(): Deque<U> | undefined;
    update(map: G): void;
    onFail(map: G): void;
    onFinish(map: G, v: U): void;
}

/**
 * Interface for an object that can follow a target.
 */
export interface TargetFollower<T, U, G extends Graph<U> = Graph<U>>
{
    follow<H extends G>(
        target: T,
        strategy: new (s: this, t: T) => TargetFollowingStrategy<U, H>
    ): void;
}
