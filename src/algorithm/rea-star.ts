import { ColoredSquareGridMap, Point2 } from "data/square-grid";

import { initREAStarWASM, REAStarWASM } from "algorithm/rea-star.wasm";

export let WASM: typeof REAStarWASM;

export async function init() {
    WASM = await initREAStarWASM();
}

export function rectangleExpansionAStar<C>(
    source: Point2,
    target: Point2,
    map: ColoredSquareGridMap<C>
): Point2[] | undefined {
    const color = map.color(source);

    if (map.color(target) !== color) return undefined;

    // TODO: Not this
    let grid = new WASM.BooleanGrid(map.width, map.height, false);
    for (let x = 0; x < map.width; x++) {
        for (let y = 0; y < map.height; y++) {
            const p: Point2 = [x, y];
            grid.set(p, map.color(p) == color);
        }
    }

    const path = WASM.rectangleExpansionAStar(source, target, grid);
    const size = path.size();

    const result: Point2[] = [];
    for (let i = 0; i < size; i++) result.push(path.get(i));

    return result;
}
