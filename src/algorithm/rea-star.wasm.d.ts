export declare namespace REAStarWASM {
    type Point2 = [number, number];

    interface Grid<T> {
        at(p: Point2): T;
        set(p: Point2, value: T): void;
        readonly width: number;
        readonly height: number;
    }

    class BooleanGrid implements Grid<boolean> {
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
