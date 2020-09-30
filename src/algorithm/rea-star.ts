import { ColoredSquareGridMap, Point2 } from "../data/square-grid";

export declare namespace REAStarWASM
{
    type Point2 = [number, number];

    interface Grid<T>
    {
        at(p: Point2): T;
        set(p: Point2, value: T): void;
        readonly width: number;
        readonly height: number;
    }

    class BooleanGrid implements Grid<boolean>
    {
        constructor(width: number, height: number, defaultValue: boolean);
        at(p: Point2): boolean;
        set(p: Point2, value: boolean): void;
        get width(): number;
        get height(): number;
    }

    function rectangleExpansionAStar(
        source: Point2,
        target: Point2,
        grid: BooleanGrid
    ): { size(): number, get(i: number): Point2 };
}

export declare const initREAStarWASM: () => Promise<typeof REAStarWASM>;

/**
 * WASM Instance for REA*
 */
export let WASM: typeof REAStarWASM;

/**
 * Initializes the REA* algorithm module.
 */
export async function init(): Promise<void>
{
    WASM = await initREAStarWASM();
}

/**
 * Applies REA* to find the shortest path between two points on a map.
 * 
 * @param source - starting point.
 * @param target - goal point.
 * @param map - colored map.
 */
export function rectangleExpansionAStar<C>(
    source: Point2,
    target: Point2,
    map: ColoredSquareGridMap<C>
): Point2[] | undefined
{
    if (!WASM) throw "REA* is uninitialized";

    const color = map.color(source);

    if (map.color(target) !== color) return undefined;

    // TODO: Not this
    const grid = new WASM.BooleanGrid(map.width, map.height, false);
    for (let x = 0; x < map.width; x++)
    {
        for (let y = 0; y < map.height; y++)
        {
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
