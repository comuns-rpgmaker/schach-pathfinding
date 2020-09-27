export declare namespace REAStarWASM {
    type Point2 = [number, number];

    interface Grid<T> {
        at(p: Point2): T;
        set(p: Point2, value: T): void;
        width(): number;
        height(): number;
    }

    class BooleanGrid implements Grid<boolean> {
        constructor(width: number, height: number, defaultValue: boolean);
        at(p: Point2): boolean;
        set(p: Point2, value: boolean): void;
        width(): number;
        height(): number;
    }

    enum Cardinal {
        NORTH,
        SOUTH,
        EAST,
        WEST
    }
}

export declare const initREAStarWASM: () => Promise<typeof REAStarWASM>;
