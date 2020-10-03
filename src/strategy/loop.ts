/**
 * @file loop.ts
 * 
 * @author Brandt
 * @date 2020/10/03
 * @license Zlib
 * 
 * Looping wrapper for target following strategies.
 */

import { TargetFollowingStrategy } from "../core/target-follower";
import { Graph } from "../data/graph";
import { Deque } from "../util";

/**
 * Looping strategy decorator.
 * 
 * Wraps a strategy to make it infinite (i.e. `onFinish` always returns false).
 */
export class LoopingStrategy<
    T,
    U extends Graph<T>,
    A extends Array<unknown> = any[]
> implements TargetFollowingStrategy<T, U>
{
    /**
     * @param f - Strategy class to be wrapped.
     * @returns a constructor for a looping strategy over the wrapped one. 
     */
    static wrap<T, U extends Graph<T>, A extends Array<unknown>>(
        f: new (...args: A) => TargetFollowingStrategy<T, U>
    ): (new (...args_: A) => LoopingStrategy<T, U>)
    {
        return class extends LoopingStrategy<T, U> {
            constructor(...args: A)
            {
                super(f, ...args);
            }
        };
    }

    private readonly _wrapped: TargetFollowingStrategy<T, U>;

    private constructor(
        f: new (...args: A) => TargetFollowingStrategy<T, U>,
        ...args: A
    )
    {
        this._wrapped = new f(...args);
    }

    path(): Deque<T> | undefined {
        return this._wrapped.path();
    }

    update(map: U): void {
        this._wrapped.update(map);
    }

    onFail(map: U): void {
        this._wrapped.onFail(map);
    }

    onFinish(map: U, v: T): boolean {
        this._wrapped.onFinish(map, v);
        return false;
    }
}
