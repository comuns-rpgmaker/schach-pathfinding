/**
 * @file standard.ts
 * 
 * @author Brandt
 * @date 2020/10/03
 * @license Zlib
 * 
 * Standard target following strategy definition.
 */

import { TargetFollowingStrategy } from '../core/target-follower';
import { Point2, SquareGridMap } from '../data/square-grid';
import { Deque } from '../util/deque';

import { rectangleExpansionAStar } from '../algorithm/rea-star';
import { Colored, Weighted } from '../data/graph';
import { aStar } from '../algorithm/a-star';

/**
 * Game character class declaration.
 */
declare class Game_Character
{
    get x(): number;
    get y(): number;
}

/**
 * Standard map type.
 * 
 * This is guaranteed to at least accomodate GameMapGraph.
 * 
 * @see GameMapGraph
 */
export type StandardMap =
    SquareGridMap & Colored<Point2, boolean> & Weighted<Point2>;

/**
 * Standard path following strategy.
 * 
 * This strategy controls the path discovery from a Game_Character source to
 * either a point or Game_Character target.
 * 
 * It will use REA* when possible to generate better-than optimal paths and
 * fallback to simple A* when it fails to derive a full path from that
 * approach.
 * 
 * This strategy completes once the source character reaches the desired target
 * **EXACTLY**. Touching an event does not count as completing the full path.
 * It will keep looking for paths until it is completed.
 * 
 * To avoid running the full pathfinding algorithm at every frame, the strategy
 * will only recalculate it when it receives a failure signal (i.e. `onFail`)
 * or the target's position changes (so be cautious when using it on moving
 * events).
 * 
 * Paths are limited to 128 steps for REA* and 32 for plain A* to avoid
 * lagging.
 * 
 * @see LoopingStrategy
 */
export class StandardStrategy
    implements TargetFollowingStrategy<
        Point2,
        StandardMap
    >
{
    private readonly _source: Game_Character;
    private readonly _target: { x: number, y: number };

    private _targetX: number;
    private _targetY: number;

    private _cached?: Deque<Point2>;

    /**
     * @param source - Source character. 
     * @param target - Target point/character.
     */
    constructor(source: Game_Character, target: Point2 | { x: number, y: number })
    {
        this._source = source;

        if (target instanceof Array)
            this._target = { x: target[0], y: target[1] };
        else
            this._target = target;
    }

    path(): Deque<Point2> | undefined
    {
        return this._cached;
    }

    update(map: StandardMap): void
    {
        if (this.shouldRefresh()) this.refresh(map);
    }

    onFail(map: StandardMap): void {
        this.refresh(map);
    }

    onFinish(map: StandardMap, [x, y]: Point2): boolean
    {
        if (this._target.x !== x || this._target.y !== y)
        {
            this.refresh(map, true);
            return false;
        }

        return true;
    }

    /**
     * Determines whether to recalculate the path.
     */
    shouldRefresh(): boolean
    {
        return this._targetX !== this._target.x
               || this._targetY !== this._target.y;
    }

    /**
     * Recalculates the path to the target.
     * 
     * @param map - Graph on which to calculate the path.
     * @param fallback - Whether to apply fallback behavior (i.e. plain A*).
     */
    refresh(map: StandardMap, fallback: boolean = false): void
    {
        this._cached = undefined;

        this._targetX = this._target.x;
        this._targetY = this._target.y;

        const source: Point2 = [this._source.x, this._source.y];
        const target: Point2 = [this._targetX, this._targetY];
        
        let path: Deque<Point2> | undefined;
        if (fallback) {
            path = aStar(
                source,
                target,
                map,
                SquareGridMap.d1,
                this.aStarSearchLimit()
            );
        } else {
            path = rectangleExpansionAStar(
                source,
                target,
                map,
                this.reaStarSearchLimit()
            );
        }

        path?.shift();

        this._cached = path;
    }

    /**
     * Maximum number of steps allowed on a path using REA*.
     */
    reaStarSearchLimit(): number
    {
        return 128;
    }

    /**
     * Maximum number of steps allowed on a path using A*.
     */
    aStarSearchLimit(): number
    {
        return 32;
    }
}
