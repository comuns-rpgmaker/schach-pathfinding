import { PriorityQueue } from "util/priority-queue";
import { Deque } from "util/deque";

import { floodFill } from "algorithm/flood-fill";
import { aStar } from "algorithm/a-star";

import { SquareGridMap } from "data/graph";

const p = PriorityQueue.from<number>([9, 4, 6, 1, 2], (a, b) => a < b);
const q = Deque.from<number>([9, 4, 6, 1, 2]);

const m = new SquareGridMap(3, 3).colored(false);

floodFill([0, 0], true, m, console.log);

export {
    SquareGridMap,
    PriorityQueue,
    Deque,
    floodFill,
    aStar
};
