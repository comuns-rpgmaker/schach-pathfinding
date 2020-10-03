export * from "./util/priority-queue";
export * from "./util/deque";

export * from "./algorithm/flood-fill";
export * from "./algorithm/a-star";

export * from "./data/square-grid";

export * from "./strategy/standard";

import "./patch/game-character";
import "./patch/game-player";
import "./patch/game-map";

import {
    rectangleExpansionAStar,
    init as initREAStar
} from "./algorithm/rea-star";

import { GameMapGraph } from "./data/game-map-graph";

export { rectangleExpansionAStar };

import { Point2 } from "./data/square-grid";

export async function init(): Promise<void>
{
    await initREAStar();
}

declare class Game_Event
{
    isNormalPriority(): boolean;
}

declare const $gameMap: {
    width(): number;
    height(): number;
    checkPassage(x: number, y: number, flag: number): boolean;
    eventsXyNt(x: number, y: number): Game_Event[];
    displayX(): number;
    displayY(): number;
};

declare class Bitmap
{
    constructor(width: number, height: number);

    fillAll(color: string): void;
}

declare class Sprite
{
    x: number;
    y: number;
    opacity: number;

    constructor(bitmap: Bitmap);
}

declare namespace SceneManager
{
    const _scene: { addChild(s: Sprite): void };
}

export function showTile([x, y]: Point2, color: string)
{
    let bmp = new Bitmap(48, 48);
    bmp.fillAll(color);

    let s = new Sprite(bmp);
    s.opacity = 100;

    let update = () => {
        s.x = (x - $gameMap.displayX()) * 48;
        s.y = (y - $gameMap.displayY()) * 48;
        requestAnimationFrame(update);
    };

    requestAnimationFrame(update);

    SceneManager._scene.addChild(s);
}

export function test(p: Point2, q: Point2, maxlen?: number, m?: GameMapGraph): GameMapGraph
{
    m ||= new GameMapGraph();
    let path = rectangleExpansionAStar(p, q, m, maxlen || 65536)!;
    
    while (true) {
        const p = path.shift();
        if (p === undefined) break;

        showTile(p, 'blue');
    }

    return m;
}
