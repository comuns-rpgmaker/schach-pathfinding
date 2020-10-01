import { SquareGridMap, Point2 } from "../data/square-grid";
import { Colored } from '../data/graph';

export declare namespace REAStarWASM
{
    interface Grid<T>
    {
        at(p: Point2): T;
        set(p: Point2, value: T): void;
        readonly width: number;
        readonly height: number;
        delete(): void;
    }

    class BooleanGrid implements Grid<boolean>
    {
        constructor(map: SquareGridMap & Colored<Point2, boolean>);
        at(p: Point2): boolean;
        set(p: Point2, value: boolean): void;
        get width(): number;
        get height(): number;
        delete(): void;
    }

    function rectangleExpansionAStar(
        source: Point2,
        target: Point2,
        grid: BooleanGrid
    ): { size(): number, get(i: number): Point2, delete(): void; };
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
export function rectangleExpansionAStar(
    source: Point2,
    target: Point2,
    map: SquareGridMap & Colored<Point2, boolean>
): Point2[] | undefined
{
    if (!WASM) throw "REA* is uninitialized";

    const color = map.color(source);
    if (map.color(target) !== color) return undefined;

    let grid = new WASM.BooleanGrid(map);

    const path = WASM.rectangleExpansionAStar(source, target, grid);
    const size = path.size();

    const result: Point2[] = [];
    for (let i = 0; i < size; i++) result.push(path.get(i));

    grid.delete();
    path.delete();

    return result;
}
