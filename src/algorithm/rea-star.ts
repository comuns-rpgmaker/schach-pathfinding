/**
 * @file rea-star.ts
 * 
 * @author Brandt
 * @date 2020/09/24
 * @license Zlib
 * 
 * Rectangle expansion A* algorithm implementation.
 */

declare class Bitmap
{
    constructor(width: number, height: number);

    fillAll(color: string): void;
}

declare class Sprite
{
    x: number;
    y: number;
    opacity: number;

    constructor(bitmap: Bitmap);
}

declare namespace SceneManager
{
    const _scene: { addChild(s: Sprite): void };
}

declare namespace Graphics
{
    function _updateAllElements(): void;
}

import {
    SquareGridMap,
    ColoredSquareGridMap,
    Point2,
    Cardinal, 
    Cardinals,
    Interval, Rect
} from "data/square-grid";

import { PriorityQueue } from "util/priority-queue";
import { Deque } from "util/deque";

enum REANodeType {
    GPOINT,
    HPOINT
}

type REANode = {
    mode: REANodeType,
    gvalue: number,
    hvalue?: number,
    fvalue?: number
};

type SearchNode = { interval: Interval, minfval: number };

/**
 * Finds the shortest path between two points on a square grid graph using
 * Rectangle Expansion A*, as described on the paper by Zang et. al.
 * 
 * @param source - Source node.
 * @param target - Target node.
 * @param g - Square grid graph.
 * 
 * @returns shortest path between the source and target nodes as a double ended
 *          queue.
 * 
 * @see https://doi.org/10.1016/j.cja.2016.04.023 
 */
export function rectangleExpansionAStar<C>(
    source: Point2,
    target: Point2,
    g: ColoredSquareGridMap<C>
): Deque<Point2> | undefined
{
    return new REAStar(source, target, g).findPath();
}

class REAStar<C>
{
    readonly source: Point2;
    readonly target: Point2;
    readonly g: ColoredSquareGridMap<C>;

    readonly nodes: ColoredSquareGridMap<REANode>;
    readonly open: PriorityQueue<SearchNode>;
    readonly cameFrom: Map<number, Point2>;
    readonly color: C;

    constructor(source: Point2, target: Point2, g: ColoredSquareGridMap<C>)
    {
        this.source = source;
        this.target = target;
        this.g = g;
        this.color = g.color(target)!;

        this.nodes = new SquareGridMap(g.width, g.height)
            .colored<REANode>({ mode: REANodeType.GPOINT, gvalue: Infinity });

        this.open = new PriorityQueue<SearchNode>((a, b) =>
            a.minfval < b.minfval);

        this.cameFrom = new Map<number, Point2>();
    }

    findPath()
    {
        let path = this.insertStart();

        if (path) return path;

        while (this.open.size > 0)
        {
            const node = this.open.next();
            path = this.expand(node.value);

            if (path) return path;
        }

        return undefined;
    }

    insertStart(): Deque<Point2> | undefined
    {
        const rect = Rect.expand(this.source, this.g);
        showRect(rect, 'gray');
    
        if (rect.contains(this.target))
        {
            return Deque.from([this.source, this.target]);
        }

        const boundaries = rect.boundaries();
        for (let i = 0; i < boundaries.length; i++) {
            const p = boundaries[i];
    
            this.cameFrom.set(this.g.id(p)!, this.source);
            this.nodes.setColor(p, {
                mode: REANodeType.GPOINT,
                gvalue: octile(this.source, p)
            });
        }
    
        for (let i = 0; i < Cardinals.length; i++) {
            let cardinal = i as Cardinal;
    
            const interval = rect.extendNeighborInterval(cardinal);
            if (!interval.isValid(this.g)) continue;
    
            const path = this.successor(interval);
            if (path) return path;
        }
    
        return undefined;
    }

    successor(interval: Interval): Deque<Point2> | undefined
    {
        const freeSubIntervals = interval.freeSubIntervals(this.g, this.color);
        
        for (let i = 0; i < freeSubIntervals.length; i++)
        {
            const path = this.freeSuccessor(freeSubIntervals[i]);
            if (path) return path;
        }

        return undefined;
    }

    freeSuccessor(fsi: Interval): Deque<Point2> | undefined
    {
        const parent = fsi.parent();
        let updated = false;

        for (let i = 0; i < fsi.length; i++)
        {
            const p = fsi.at(i);
            const gvalue = this.nodes.color(p)?.gvalue || Infinity;

            const pp = parent.at(i); // TODO: all reachable
            const pgvalue = this.nodes.color(pp)!.gvalue;

            if (pgvalue + 1 < gvalue)
            {
                this.cameFrom.set(this.g.id(p)!, pp);
                const hvalue = octile(p, this.target);
                this.nodes.setColor(p, {
                    mode: REANodeType.HPOINT,
                    gvalue: pgvalue,
                    hvalue,
                    fvalue: pgvalue + hvalue
                });
                updated = true;
            }
        }

        if (fsi.contains(this.target)) return this.makePath();

        if (updated)
        {
            showInterval(fsi, 'red');
            const minfval = this.minFvalue(fsi);
            
            this.open.add({ interval: fsi, minfval });
        }
    }

    expand(node: SearchNode): Deque<Point2> | undefined
    {
        const interval = node.interval;
        if (interval.contains(this.target)) return this.makePath();

        const rect = interval.expandRect(this.g, this.color);
        showRect(rect, 'grey');

        if (rect.contains(this.target))
        {
            this.cameFrom.set(this.g.id(this.target)!, interval.at(this.findMinFvalue(interval)));
            return this.makePath();
        }

        // TODO: optimize
        const walls =
            rect.perpendicular(interval.cardinal)
            .concat(rect.parallel(interval.cardinal));

        for (let i = 0; i < 3; i++)
        {
            const pi = walls[i];

            for (let j = 0; j < pi.length; j++)
            {
                const p = pi.at(j);

                for (let k = 0; k < interval.length; k++)
                {
                    const pp = interval.at(k);
                    const g = this.nodes.color(pp)!.gvalue + octile(p, pp);

                    const { mode, gvalue, hvalue } = this.nodes.color(p)!;

                    if (g < gvalue)
                    {
                        this.cameFrom.set(this.g.id(p)!, pp);
                        this.nodes.setColor(p, {
                            mode,
                            gvalue: g,
                            hvalue,
                            fvalue: hvalue ? g + hvalue : undefined
                        });
                    }
                }
            }

            const path = this.successor(rect.extendNeighborInterval(pi.cardinal));
            if (path) return path;
        }

        return undefined;
    }

    minFvalue(interval: Interval): number
    {
        let min: number = Infinity;
    
        for (let i = 0; i < interval.length; i++) {
            const fval = this.nodes.color(interval.at(i))!.fvalue!;
            if (fval < min) min = fval;
        }
    
        return min;
    }

    // TODO: optimize
    findMinFvalue(interval: Interval): number
    {
        let min: number = Infinity, r = 0;
    
        for (let i = 0; i < interval.length; i++) {
            const fval = this.nodes.color(interval.at(i))!.fvalue!;
            if (fval < min)
            {
                min = fval;
                r = i;
            }
        }
    
        return r;
    }

    makePath(): Deque<Point2>
    {
        this.cameFrom.delete(this.g.id(this.source)!);

        const path = new Deque<Point2>();
        path.push(this.target);

        let currentId: number;
        let current = this.target;
        while (this.cameFrom.has(currentId = this.g.id(current)!))
        {
            current = this.cameFrom.get(currentId)!;
            path.unshift(current);
        }

        return path;
    }
}

function octile(source: Point2, p: Point2): number
{
    const dx = Math.abs(source[0] - p[0]),
          dy = Math.abs(source[1] - p[1]);

    return Math.SQRT2 * Math.min(dx, dy) + Math.abs(dx - dy);
}

// TODO: remove this
export function showRect(rect: Rect, color: string)
{
    const b = rect.boundaries();
    for (let i = 0; i < b.length; i++) {
        showTile(b[i], color);
    }
}

export function showInterval(interval: Interval, color: string)
{
    for (let i = 0; i < interval.length; i++) {
        showTile(interval.at(i), color);
    }
}

export function showTile([x, y]: Point2, color: string)
{
    let bmp = new Bitmap(48, 48);
    bmp.fillAll(color);

    let s = new Sprite(bmp);
    s.x = x * 48;
    s.y = y * 48;
    s.opacity = 50;
    SceneManager._scene.addChild(s);
}
