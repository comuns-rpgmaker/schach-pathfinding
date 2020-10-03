import { Point2 } from "../data/square-grid";

import { PathFollower } from "../core/path-follower";
import { TargetFollower, TargetFollowingStrategy } from "../core/target-follower";
import { Deque } from "../util/deque";
import { StandardMap } from "../strategy/standard";

declare const $gameMap: {
    graph(): StandardMap
};

type Strategy = TargetFollowingStrategy<Point2, StandardMap>;

declare class Game_Character
    implements
        PathFollower<Point2>,
        TargetFollower<Game_Character, Point2, StandardMap>,
        TargetFollower<Point2, Point2, StandardMap>
{
    updateStop(): void;
    isMoveRouteForcing(): boolean;
    findDirectionTo(x: number, y: number): number;
    moveStraight(d: number): void;

    follow<T extends Game_Character | Point2>(
        target: T,
        strategy: new (s: Game_Character, t: T) => Strategy
    ): void;

    assignPath(path: Deque<Point2>): void;
    walkToPoint(x: number, y: number): void;

    private _updateFollowPath(): void;
    private _assignedPath?: Deque<Point2>;
};

const updateStop = Game_Character.prototype.updateStop;
Game_Character.prototype.updateStop = function() {
    updateStop.call(this);

    if (this.isMoveRouteForcing()) return;
    if (!this._pathFollowingStrategy) return;

    this._pathFollowingStrategy.update($gameMap.graph());
    this._assignedPath = this._pathFollowingStrategy.path();

    if (this._assignedPath !== undefined) this._updateFollowPath();
};

Game_Character.prototype.follow = function<T>(
    target: T,
    strategy: new (s: Game_Character, t: T) => Strategy
): void
{
    this._pathFollowingStrategy = new strategy(this, target);
}

Game_Character.prototype.assignPath = function(path: Deque<Point2>): void
{
    this._assignedPath = path;
}

Game_Character.prototype['_updateFollowPath'] = function(): void
{
    let p = this._assignedPath.bottom();
    if (p === undefined)
    {
        this._pathFollowingStrategy.onFinish($gameMap.graph(), [this.x, this.y]);
        this._assignedPath = this._pathFollowingStrategy.path();
        if (!this._assignedPath) return;
    }

    const [x, y] = p;
    if (this.x === x && this.y === y) p = this._assignedPath.shift();

    this.walkToPoint(x, y);
}

Game_Character.prototype.walkToPoint = function(x: number, y: number): void
{
    const d = this.findDirectionTo(x, y);
    this.moveStraight(d);

    if (!this.isMovementSucceeded())
    {
        this._pathFollowingStrategy.onFail($gameMap.graph());
    }
}
