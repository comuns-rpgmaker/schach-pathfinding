export * from "./data";
export * from "./core";

export * as Util from "./util";
export * as Algorithm from "./algorithm";
export * as Strategy from "./strategy";

import "./patch/game-character";
import "./patch/game-player";
import "./patch/game-map";

import { init as initREAStar } from "./algorithm/rea-star";

export async function init(): Promise<void>
{
    await initREAStar();
}

declare class Scene_Boot {
    create(): void;
    isReady(): boolean;
}

const create = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function(): void
{
    create.call(this);
    
    (async () => {
        await init()
        this._pathfindingLoaded = true
    })();
}

const isReady = Scene_Boot.prototype.isReady;
Scene_Boot.prototype.isReady = function(): boolean
{
    return isReady.call(this) && this._pathfindingLoaded;
}