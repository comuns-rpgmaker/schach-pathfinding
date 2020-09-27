export * from "util/priority-queue";
export * from "util/deque";

export * from "algorithm/flood-fill";
export * from "algorithm/a-star";
export * from "algorithm/rea-star";

export * from "data/square-grid";

import { rectangleExpansionAStar, showTile } from "algorithm/rea-star";
import { Point2, SquareGridMap } from "data/square-grid";

declare class Game_Event
{
    isNormalPriority(): boolean;
}

declare const $gameMap: {
    width(): number;
    height(): number;
    checkPassage(x: number, y: number, flag: number): boolean;
    eventsXyNt(x: number, y: number): Game_Event[];
};

export function test(p: Point2, q: Point2)
{
    let m = new SquareGridMap($gameMap.width(), $gameMap.height());
    let cm = m.colored(true);

    for (let x = 0; x < $gameMap.width(); x++) {
        for (let y = 0; y < $gameMap.height(); y++) {
            const pass = $gameMap.checkPassage(x, y, 0xf);
            const collides = $gameMap.eventsXyNt(x, y).some(event => event.isNormalPriority());
            cm.setColor([x, y], pass && !collides);
        }
    }

    let path = rectangleExpansionAStar(p, q, cm)!;
    while (path.length > 0)
    {
        const p = path.shift()!;
        showTile(p, 'blue');
    }
}