/**
 * @file graph.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * Definitions of a generic interface and common implementations of Graphs.
 */

import { zip } from "util/array";
import { ArrayMap } from "util/array-map";

/**
 * Generic graph interface.
 * 
 * @template T - type of vertex on the graph.
 */
export interface Graph<T>
{
    /**
     * @param v - a vertex on the graph.
     * 
     * @returns a list of vertices connected to the given vertex.
     */
    from(v: T): T[];
}

/**
 * Generic directed graph interface.
 * 
 * @template T - type of vertex on the graph.
 */
export interface DiGraph<T> extends Graph<T>
{
    /**
     * @param v - a vertex on the graph.
     * 
     * @returns a list of all vertices with outgoing edges to the given vertex.
     */
    to(v: T): T[];
}

/**
 * Generic weighted graph interface.
 * 
 * @template T - type of vertex on the graph.
 */
export interface Weighted<T>
{
    weight(source: T, target: T): number | undefined;
}

/**
 * Generic colored graph interface.
 * 
 * @template T - type of vertex on the graph.
 * @template C - color type.
 */
export interface Colored<T, C>
{
    color(v: T): C | undefined;
    setColor(v: T, color: C): void;
}

type Point2 = [number, number];

/**
 * Direction offsets
 */
const Directions: Record<string, Point2[]> = {};

Directions.DIR4 = Directions.ORTHOGONAL = zip([1, 0, -1, 0], [0, 1, 0, -1]);
Directions.DIAGONAL = zip([1, 1, -1, -1], [1, -1, 1, -1]);
Directions.DIR8 = Directions.ORTHOGONAL.concat(Directions.DIAGONAL);

/**
 * Square grid map graph class.
 */
export class SquareGridMap implements Graph<Point2>
{

    readonly width: number;
    readonly height: number;

    private readonly _directions: Point2[];

    /**
     * @param width - width of the grid.
     * @param height - height of the grid.
     * @param directions - list of directions for the edges between cells.
     */
    constructor(
        width: number,
        height: number,
        directions: Point2[] = Directions.DIR4
    )
    {
        this.width = width;
        this.height = height;
        this._directions = directions;
    }

    /**
     * @returns grid size.
     */
    get size(): number
    {
        return this.width * this.height;
    }

    /**
     * @param p - a 2D point.
     * 
     * @returns `true` if the point is inside the grid.
     */
    contains([x, y]: Point2): boolean
    {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    from([x, y]: Point2): Point2[]
    {
        return this._directions.map(([ox, oy]) => [x + ox, y + oy] as Point2)
            .filter(p => this.contains(p));
    }

    /**
     * Builds a weighted graph from this one.
     * 
     * @param weight - Weight function.
     */
    weighted(weight: (s: Point2, t: Point2) => number): this & Weighted<Point2>
    {
        const clone = Object.setPrototypeOf(Object.assign({}, this), this.constructor.prototype);
        return Object.assign(clone, { weight });
    }

    /**
     * Builds a colored graph from this one.
     * 
     * @param defaultColor - Default color.
     */
    colored<C>(defaultColor: C): this & Colored<Point2, C>
    {
        const clone = Object.setPrototypeOf(Object.assign({}, this), this.constructor.prototype);
        const coloring = new SquareGridMapColoring(clone, defaultColor);

        return Object.assign(clone, {
            color: coloring.color.bind(coloring),
            setColor: coloring.setColor.bind(coloring)
        });
    }

    /**
     * Manhattan distance between vertices.
     * 
     * @param param0 - Source vertex.
     * @param param1 - Target vertex.
     */
    static d1([x1, y1]: Point2, [x2, y2]: Point2): number
    {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }

    /**
     * Euclidean distance between vertices.
     * 
     * @param param0 - Source vertex.
     * @param param1 - Target vertex.
     */
    static d2([x1, y1]: Point2, [x2, y2]: Point2): number
    {
        return Math.hypot(x2 - x1, y2 - y1);
    }
}

/**
 * Generic colored square grid map graph class.
 */
class SquareGridMapColoring<C> implements Colored<Point2, C>
{
    readonly defaultColor: C;

    private readonly _graph: SquareGridMap;
    private _map: Map<number, Map<number, C>>;
    
    /**
     * @param defaultColor - default color for the graph.
     */
    constructor(g: SquareGridMap, defaultColor: C)
    {
        this._graph = g;
        this.defaultColor = defaultColor;
        this._map = this._buildMap();
    }

    color([x, y]: Point2): C | undefined
    {
        if (this._graph.contains([x, y])) {
            return this._map.get(x)?.get(y) || this.defaultColor;
        } else {
            return undefined;
        }
    }

    setColor([x, y]: Point2, color: C): void
    {
        let m = this._map.get(x);

        if (m === undefined)
        {
            m = new Map();
            this._map.set(x, m);
        }

        m.set(y, color);
    }

    private _buildMap() {
        // TODO: Pick an implementation based on map size and density to
        //       balance space wasted vs performance.
        return new ArrayMap(() => new ArrayMap(() => this.defaultColor));
    }
}
