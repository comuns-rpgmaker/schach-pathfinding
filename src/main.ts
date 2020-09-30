export * from "util/priority-queue";
export * from "util/deque";

export * from "algorithm/flood-fill";
export * from "algorithm/a-star";
export * from "algorithm/rea-star";

export * from "data/square-grid";

import {
    rectangleExpansionAStar,
    init as initREAStar
} from "algorithm/rea-star";

import { Point2, SquareGridMap } from "data/square-grid";

export async function init() {
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

export function test(p: Point2, q: Point2)
{
    let m = new SquareGridMap($gameMap.width(), $gameMap.height()).colored(true);

    for (let x = 0; x < $gameMap.width(); x++) {
        for (let y = 0; y < $gameMap.height(); y++) {
            const pass = $gameMap.checkPassage(x, y, 0xf);
            const collides = $gameMap.eventsXyNt(x, y).some(event => event.isNormalPriority());
            m.setColor([x, y], pass && !collides);
        }
    }

    let path = rectangleExpansionAStar(p, q, m)!;
    path.forEach(p => showTile(p, 'blue'));
}
