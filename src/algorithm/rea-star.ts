/**
 * @file rea-star.ts
 * 
 * @author Brandt
 * @date 2020/09/24
 * @license Zlib
 * 
 * Rectangle expansion A* algorithm implementation.
 */

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

type REANodeMap = ColoredSquareGridMap<REANode | undefined>;

type SearchNode = { interval: Interval, minfval: number};

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
            console.log('visiting', node.value);
            path = this.expand(node.value);

            if (path) return path;
        }

        return undefined;
    }

    insertStart(): Deque<Point2> | undefined
    {
        const rect = Rect.expand(this.source, this.g);
    
        if (rect.contains(this.target))
        {
            return Deque.from([this.source, this.target]);
        }

        const boundaries = rect.boundaries();
        for (let i = 0; i < boundaries.length; i++) {
            const p = boundaries[i];
    
            this.nodes.setColor(p, {
                mode: REANodeType.GPOINT,
                gvalue: octile(this.source, p)
            });
        }
    
        const color = this.g.color(this.source);
        for (let i = 0; i < Cardinals.length; i++) {
            let cardinal = i as Cardinal;
    
            const interval = rect.extendNeighborInterval(cardinal);
            if (!interval.isValid(this.g)) continue;
    
            const path = this.successor(interval, interval);
            if (path) return path;
        }
    
        return undefined;
    }

    successor(interval: Interval, parentNode: Interval): Deque<Point2> | undefined
    {
        const eni = interval.freeSubIntervals(this.g, this.color);
        
        for (let i = 0; i < eni.length; i++)
        {
            const fsi = eni[i];
            let updated = false;
    
            for (let j = 0; j < fsi.length; j++)
            {
                const p = fsi.at(j);
                const pp = fsi.parent().at(j); // TODO: all reachable
    
                const gvalue = this.nodes.color(p)?.gvalue || Infinity;
                const pGvalue = this.nodes.color(pp)!.gvalue;
    
                if (pGvalue + 1 < gvalue)
                {
                    const hvalue = octile(p, this.target);
                    this.nodes.setColor(p, {
                        mode: REANodeType.HPOINT,
                        gvalue: pGvalue,
                        hvalue,
                        fvalue: gvalue + hvalue
                    });
                    updated = true;
                }
            }
    
            if (fsi.contains(this.target)
                &&
                this.nodes.color(this.target)!.fvalue! <= this.minFvalue(parentNode))
            {
                return Deque.from([this.target]); // FIXME
            }
    
            if (updated)
            {
                const minfval = this.minFvalue(fsi);

                console.log('added', fsi, 'to open set');
                this.open.add({ interval: fsi, minfval });
            }
        }
    
        return undefined;
    }

    expand(node: SearchNode): Deque<Point2> | undefined
    {
        const interval = node.interval;
        console.log('expanding', interval);
        if (interval.contains(this.target)) return Deque.from([this.target]); // FIXME
    
        const rect = interval.expandRect(this.g);
        console.log('expanded rect', rect);
        if (rect.contains(this.target)) return Deque.from([this.target]); // FIXME
    
        const perp = rect.perpendicular(interval.cardinal);
        for (let i = 0; i < perp.length; i++)
        {
            const p = perp[i];
            let v = this.nodes.color(p.at(0))!.gvalue;
            for (let j = 1, oct = Math.SQRT2; j < p.length; j++, oct += Math.SQRT2)
            {
                const a = p.at(j);
    
                const { mode, gvalue } = this.nodes.color(a)!;
                const pGvalue = Math.min(v + 1, oct);
    
                if (pGvalue < gvalue) {
                    //this.cameFrom.set(g.id(a)!, p.at(j - 1));
                    this.nodes.setColor(a, {
                        mode,
                        gvalue: pGvalue
                    });
                    v = pGvalue;
                }
                else
                {
                    v = gvalue;
                }
            };
    
            const path = this.successor(
                rect.extendNeighborInterval(p.cardinal),
                interval
            );
    
            if (path) return path;
        }
    
        // TODO: optimize
        const p = rect.parallel(interval.cardinal);
        for (let i = 0; i < p.length; i++)
        {
            const a = p.at(i);
            const { mode, gvalue } = this.nodes.color(a)!;
    
            for (let j = 0; j < interval.length; j++)
            {
                const pGvalue = octile(interval.at(j), a);
    
                if (pGvalue < gvalue) {
                    this.nodes.setColor(a, {
                        mode,
                        gvalue: pGvalue
                    });
                }
            }
        }
    
        return this.successor(
            rect.extendNeighborInterval(p.cardinal),
            interval
        );
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
}

function octile(source: Point2, p: Point2): number
{
    const dx = Math.abs(source[0] - p[0]),
          dy = Math.abs(source[1] - p[1]);

    return Math.SQRT2 * Math.min(dx, dy) + Math.abs(dx - dy);
}
