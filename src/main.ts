export * from "util/priority-queue";
export * from "util/deque";

export * from "algorithm/flood-fill";
export * from "algorithm/a-star";
export * from "algorithm/rea-star";

export * from "data/square-grid";

import { rectangleExpansionAStar, showTile } from "algorithm/rea-star";
import { ColoredSquareGridMap, Point2, SquareGridMap } from "data/square-grid";

import { initREAStarWASM, REAStarWASM } from "rea-star-wasm";

export let REAStarWASMInstance: typeof REAStarWASM;

export async function init() {
    REAStarWASMInstance = await initREAStarWASM();
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
};

export function test(p: Point2, q: Point2)
{
    let m = new REAStarWASMInstance.BooleanGrid($gameMap.width(), $gameMap.height(), true);

    for (let x = 0; x < $gameMap.width(); x++) {
        for (let y = 0; y < $gameMap.height(); y++) {
            const pass = $gameMap.checkPassage(x, y, 0xf);
            const collides = $gameMap.eventsXyNt(x, y).some(event => event.isNormalPriority());
            m.set([x, y], pass && !collides);
        }
    }

    let cm = Object.assign(new SquareGridMap(m.width, m.height), {
        color(p: Point2): boolean { return m.at(p); },
        setColor(p: Point2, value: boolean): void { m.set(p, value); }
    }) as ColoredSquareGridMap<boolean>;

    let path = rectangleExpansionAStar(p, q, cm)!;
    while (path.length > 0)
    {
        const p = path.shift()!;
        showTile(p, 'blue');
    }
}
