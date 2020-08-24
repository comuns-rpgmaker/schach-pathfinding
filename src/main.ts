import { PriorityQueue } from './util/priority-queue';
import { Deque } from './util/deque';

import { floodFill } from './algorithm/flood-fill';

import { SquareGridMap4Dir, Colored } from './data/graph';

const p = PriorityQueue.from<number>([9, 4, 6, 1, 2], (a, b) => a < b);
const q = Deque.from<number>([9, 4, 6, 1, 2]);

class ColoredSquareGridMap4Dir<C>
extends SquareGridMap4Dir
implements Colored<[number, number], C>
{
    private readonly _defaultColor;
    private _map = new Map<number, Map<number, C>>();

    constructor(width: number, height: number, defaultColor: C)
    {
        super(width, height);
        this._defaultColor = defaultColor;
    }

    color([x, y]: [number, number]): C
    {
        return this._map.get(x)?.get(y) || this._defaultColor;
    }

    setColor([x, y]: [number, number], color: C): void
    {
        let m = this._map.get(x);

        if (m === undefined)
        {
            m = new Map();
            this._map.set(x, m);
        }

        m.set(y, color);
    }
}

const m = new ColoredSquareGridMap4Dir(3, 3, false);

floodFill([0, 0], true, m, console.log);
