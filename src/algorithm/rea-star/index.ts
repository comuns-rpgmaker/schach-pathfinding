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
    ColoredSquareGridMap,
    Point2,
    Cardinal, 
    Cardinals,
    Interval, Rect
} from "data/square-grid";

import { PriorityQueue } from "util/priority-queue";
import { Deque } from "util/deque";

import { REAStarNodeMap } from './nodes';
import { REAStarPathBuilder } from "./path-builder";

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

type SearchNode = { interval: Interval, minfval: number, pmin: Point2 };

class REAStar<C>
{
    readonly source: Point2;
    readonly target: Point2;
    readonly g: ColoredSquareGridMap<C>;

    readonly nodes: REAStarNodeMap;
    readonly builder: REAStarPathBuilder;

    readonly open: PriorityQueue<SearchNode>;
    readonly color: C;

    constructor(source: Point2, target: Point2, g: ColoredSquareGridMap<C>)
    {
        this.source = source;
        this.target = target;
        this.g = g;
        this.color = g.color(target)!;

        this.nodes = new REAStarNodeMap();

        this.open = new PriorityQueue<SearchNode>((a, b) =>
            a.minfval < b.minfval);

        this.builder = new REAStarPathBuilder(source, target, g);
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
    
            this.builder.setParent(p, this.source);
            this.nodes.set(p, octile(this.source, p));
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
            let gvalue = this.nodes.get(p).gvalue;

            for (let j = i - 1; j <= i + 1; j++)
            {
                if (j < 0 || j >= parent.length) continue;

                const pp = parent.at(j);
                const pgvalue = this.nodes.get(pp).gvalue;
                const ppgvalue = pgvalue + octile(p, pp);

                if (ppgvalue < gvalue)
                {
                    gvalue = ppgvalue;
                    this.builder.setParent(p, pp);
                    const hvalue = octile(p, this.target);
                    this.nodes.set(p, gvalue, hvalue);
                    updated = true;
                }
            }
        }

        if (fsi.contains(this.target)) return this.builder.build();

        if (updated)
        {
            showInterval(fsi, 'red');
            const { minfval, pmin } = this.findMinFvalue(fsi);
            this.open.add({ interval: fsi, minfval, pmin });
        }
    }

    expand(node: SearchNode): Deque<Point2> | undefined
    {
        const interval = node.interval;
        if (interval.contains(this.target)) return this.builder.build();

        const rect = interval.expandRect(this.g, this.color);
        showRect(rect, 'grey');

        if (rect.contains(this.target))
        {
            this.builder.setParent(this.target, node.pmin);
            return this.builder.build();
        }

        // TODO: optimize
        const walls = rect.perpendicular(interval.cardinal).concat(rect.parallel(interval.cardinal));

        for (let i = 0; i < 3; i++)
        {
            const wall = walls[i];
            for (let j = 0; j < wall.length; j++)
            {
                const p = wall.at(j);

                for (let k = 0; k < interval.length; k++)
                {
                    const pp = interval.at(k);
                    const g = this.nodes.get(pp).gvalue + octile(p, pp);
                    const gvalue = this.nodes.get(p).gvalue;

                    if (g < gvalue)
                    {
                        this.builder.setParent(p, pp);
                        this.nodes.set(p, g);
                    }
                }
            }

            const path = this.successor(rect.extendNeighborInterval(wall.cardinal));
            if (path) return path;
        }

        return undefined;
    }

    findMinFvalue(interval: Interval): { minfval: number, pmin: Point2 }
    {
        let minfval: number = Infinity, pmin: Point2 = [0, 0];
    
        for (let i = 0; i < interval.length; i++) {
            const p = interval.at(i);
            const fval = this.nodes.get(p).fvalue!;
            if (fval < minfval)
            {
                minfval = fval;
                pmin = p;
            }
        }
    
        return { minfval, pmin };
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

declare const $gameMap: any;

export function showTile([x, y]: Point2, color: string)
{
    let bmp = new Bitmap(48, 48);
    bmp.fillAll(color);

    let s = new Sprite(bmp);
    s.opacity = 100;

    let update = () => {
        s.x = (x - $gameMap.displayX()) * 48;
        s.y = (y - $gameMap.displayY()) * 48;
        requestAnimationFrame(update);
    };

    requestAnimationFrame(update);

    SceneManager._scene.addChild(s);
}
