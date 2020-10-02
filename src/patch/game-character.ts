import { Point2 } from "../data/square-grid";

import { PathFollower } from "../core/path-follower";
import { TargetFollower } from "../core/target-follower";
import { Deque } from "../util/deque";

declare class Game_Character
    implements
        PathFollower<Point2>,
        TargetFollower<Game_Character>,
        TargetFollower<Point2>
{
    updateStop(): void;
    isMoveRouteForcing(): boolean;
    findDirectionTo(x: number, y: number): number;
    moveStraight(d: number): void;

    follow(target: Game_Character | Point2): void;
    assignPath(path: Deque<Point2>): void;
    walkToPoint(x: number, y: number): void;

    private _updateFollowPath(): void;
    private _assignedPath?: Deque<Point2>;
};

const updateStop = Game_Character.prototype.updateStop;
Game_Character.prototype.updateStop = function() {
    updateStop.call(this);
    if (this._assignedPath !== undefined && !this.isMoveRouteForcing())
    {
        this._updateFollowPath();
    }
};

Game_Character.prototype.follow = function(target: Game_Character | Point2): void
{
    if (target instanceof Game_Character)
    {

    }
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
        this._assignedPath = undefined;
        return;
    }

    const [x, y] = p;
    if (this.x === x && this.y === y) p = this._assignedPath.shift();

    this.walkToPoint(x, y);
}

Game_Character.prototype.walkToPoint = function(x: number, y: number): void
{
    const d = this.findDirectionTo(x, y);
    this.moveStraight(d);
}
