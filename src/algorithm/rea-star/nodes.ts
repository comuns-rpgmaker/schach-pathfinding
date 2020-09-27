/**
 * @file nodes.ts
 * 
 * @author Brandt
 * @date 2020/09/26
 * @license Zlib
 * 
 * REA* node type and related classes.
 */

 import { Point2 } from "data/square-grid";
import { ArrayMap } from "util/array-map";

export type REANode = {
    gvalue: number,
    hvalue?: number,
    fvalue?: number
};

export class REAStarNodeMap
{
    readonly _data: ArrayMap<ArrayMap<REANode>>;

    constructor()
    {
        this._data = new ArrayMap();
    }

    get([x, y]: Point2): REANode
    {
        return this._data.get(x)?.get(y) || { gvalue: Infinity };
    }

    set([x, y]: Point2, gvalue: number, hvalue?: number)
    {
        if (this._data.get(x) === undefined)
        {
            this._data.set(x, new ArrayMap(() => ({ gvalue: Infinity })));
        }

        const row = this._data.get(x)!;
        if (row.get(y) === undefined)
        {
            row.set(y, {
                gvalue,
                hvalue,
                fvalue: hvalue ? gvalue + hvalue : undefined
            });
        }
        else
        {
            const cell = row.get(y)!;
            cell.gvalue = gvalue;
            cell.hvalue = hvalue || cell.hvalue;
            cell.fvalue = cell.hvalue ? cell.hvalue + gvalue : undefined;
        }
    }
}