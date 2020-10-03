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

declare class Game_Character
{
    get x(): number;
    get y(): number;
}

export type StandardMap =
    SquareGridMap & Colored<Point2, boolean> & Weighted<Point2>;

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

    private _forceRefresh: boolean = true
    private _cached?: Deque<Point2>;

    constructor(source: Game_Character, target: Point2 | { x: number, y: number })
    {
        this._source = source;

        if (target instanceof Array)
            this._target = { x: target[0], y: target[1] };
        else
            this._target = target;

        this._targetX = this._target.x;
        this._targetY = this._target.y;
    }

    onFail(map: StandardMap): void {
        this.refresh(map);
    }

    onFinish(map: StandardMap, [x, y]: Point2): boolean
    {
        if (this._target.x != x || this._target.y != y)
        {
            this.refresh(map);
            return false;
        }

        return true;
    }

    path(): Deque<Point2> | undefined
    {
        return this._cached;
    }

    update(map: StandardMap): void
    {
        if (this.shouldRefresh()) this.refresh(map);
    }

    shouldRefresh(): boolean
    {
        return this._forceRefresh
                || this._targetX !== this._target.x
                || this._targetY !== this._target.y;
    }

    refresh(map: StandardMap): void
    {
        this._cached = undefined;

        const source: Point2 = [this._source.x, this._source.y];
        const target: Point2 = [this._target.x, this._target.y];

        let path = rectangleExpansionAStar(source, target, map, this.reaStarSearchLimit());
        path ||= aStar(source, target, map, SquareGridMap.d1, this.aStarSearchLimit());

        this._cached = path;

        this._forceRefresh = false;
    }

    reaStarSearchLimit(): number
    {
        return 1000;
    }

    aStarSearchLimit(): number
    {
        return 32;
    }
}
