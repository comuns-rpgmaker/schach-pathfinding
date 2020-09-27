/**
 * @file path-builder.ts
 * 
 * @author Brandt
 * @date 2020/09/26
 * @license Zlib
 * 
 * REA* path builder class.
 */

import { SquareGridMap, Point2 } from "data/square-grid";
import { Deque } from "util/deque";

export class REAStarPathBuilder
{
    readonly g: SquareGridMap;
    readonly source: Point2;
    readonly target: Point2;

    readonly _cameFrom: Map<number, Point2>;

    constructor(source: Point2, target: Point2, g: SquareGridMap)
    {
        this.g = g;
        this.source = source;
        this.target = target;
        this._cameFrom = new Map();
    }

    setParent(p: Point2, pp: Point2): void
    {
        this._cameFrom.set(this.g.id(p)!, pp);
    }

    build(): Deque<Point2>
    {
        this._cameFrom.delete(this.g.id(this.source)!);

        const path = new Deque<Point2>();
        path.push(this.target);

        let currentId: number;
        let current = this.target;
        while (this._cameFrom.has(currentId = this.g.id(current)!))
        {
            current = this._cameFrom.get(currentId)!;
            path.unshift(current);
        }

        return path;
    }
}
