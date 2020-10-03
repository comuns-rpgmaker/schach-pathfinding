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
    isMovementSucceeded(): boolean;

    follow<T extends Game_Character | Point2>(
        target: T,
        strategy: new (s: Game_Character, t: T) => Strategy
    ): void;

    assignPath(path: Deque<Point2>): void;
    clearPath(): void;

    updateFollowPath(): void;
    isFollowingPath(): boolean;

    clearPathFollowingStrategy(): void;
    onFinishFollowingPath(): void;
    onFailFollowingPath(): void;

    walkToPoint(x: number, y: number): void;
    
    private _pathFollowingStrategy: Strategy;
    private _assignedPath?: Deque<Point2>;

    get x(): number;
    get y(): number;
};

const updateStop = Game_Character.prototype.updateStop;
Game_Character.prototype.updateStop = function() {
    updateStop.call(this);

    if (
        this.isMoveRouteForcing()
        || ('canMoveBasic' in this && !this.canMoveBasic())) return;

    if (!this._pathFollowingStrategy) return;
    this._pathFollowingStrategy.update($gameMap.graph());
    this._assignedPath = this._pathFollowingStrategy.path();

    if (this._assignedPath !== undefined) this.updateFollowPath();
};

Game_Character.prototype.follow = function<T  extends Game_Character | Point2>(
    target: T,
    strategy: new (s: Game_Character, t: T) => Strategy
): void
{
    this._pathFollowingStrategy = new strategy(this, target);
}

Game_Character.prototype.clearPathFollowingStrategy = function(): void
{
    this._pathFollowingStrategy = undefined;
}

Game_Character.prototype.clearPath = function(): void
{
    this.clearPathFollowingStrategy();
    this._assignedPath = undefined;
}

Game_Character.prototype.assignPath = function(path: Deque<Point2>): void
{
    this.clearPathFollowingStrategy();
    this._assignedPath = path;
}

Game_Character.prototype.isFollowingPath = function(): boolean
{
    return this._pathFollowingStrategy !== undefined
            || this._assignedPath !== undefined;
}

Game_Character.prototype.updateFollowPath = function(): void
{
    let p = this._assignedPath.bottom();
    if (p === undefined)
    {
        this.onFinishFollowingPath();
        if (!this._assignedPath) return;
        
        p = this._assignedPath.bottom();
        if (!p) return;
    }

    const [x, y] = p;
    if (this.x === x && this.y === y) p = this._assignedPath.shift();

    this.walkToPoint(x, y);
}

Game_Character.prototype.onFinishFollowingPath = function(): void
{
    const finished = this._pathFollowingStrategy.onFinish(
        $gameMap.graph(),
        [this.x, this.y]
    );

    if (!finished) this._assignedPath = this._pathFollowingStrategy.path();
    else this._pathFollowingStrategy = this._assignedPath = undefined;
}

Game_Character.prototype.onFailFollowingPath = function(): void
{
    this._pathFollowingStrategy.onFail($gameMap.graph());
}

Game_Character.prototype.walkToPoint = function(x: number, y: number): void
{
    const d = this.findDirectionTo(x, y);
    this.moveStraight(d);

    if (!this.isMovementSucceeded()) this.onFailFollowingPath();
}
