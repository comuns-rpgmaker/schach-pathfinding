import { PriorityQueue } from "util/priority-queue";
import { Deque } from "util/deque";

import { floodFill } from "algorithm/flood-fill";

import { ColoredSquareGridMap } from "data/graph";

const p = PriorityQueue.from<number>([9, 4, 6, 1, 2], (a, b) => a < b);
const q = Deque.from<number>([9, 4, 6, 1, 2]);

const m = new ColoredSquareGridMap(3, 3, false);

floodFill([0, 0], true, m, console.log);

export {
    ColoredSquareGridMap,
    PriorityQueue,
    Deque,
    floodFill
};
