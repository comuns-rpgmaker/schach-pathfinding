/**
 * @file graph.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * Definitions of a generic interface and common implementations of Graphs.
 */

import { zip } from "../util/array";

/**
 * Generic graph interface.
 * 
 * @template T - type of vertex on the graph.
 */
export interface Graph<T>
{
    /**
     * @param v - vertex on the graph.
     * 
     * @returns a list of vertices connected to the given vertex.
     */
    neighbors(v: T): T[];
}

/**
 * Generic directed graph interface.
 * 
 * @template T - type of vertex on the graph.
 */
export interface DiGraph<T>
{
    /**
     * @param v - a vertex on the graph.
     * 
     * @returns a list of all vertices with incoming edges from the given
     *          vertex.
     */
    from(v: T): T[];

    /**
     * @param v - a vertex on the graph.
     * 
     * @returns a list of all vertices with outgoing edges to the given vertex.
     */
    to(v: T): T[];
}

/**
 * Generic colored graph interface.
 * 
 * @template T - type of vertex on the graph.
 * @template C - color type.
 */
export interface Colored<T, C>
{
    color(v: T): C;
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

    neighbors([x, y]: Point2): Point2[]
    {
        return this._directions.map(([ox, oy]) => [x + ox, y + oy] as Point2)
                              .filter(p => this.contains(p));
    }
}

/**
 * Generic colored square grid map graph class.
 */
export class ColoredSquareGridMap<C>
    extends SquareGridMap
    implements Colored<Point2, C>
{

    readonly defaultColor;

    private _map = new Map<number, Map<number, C>>();
    
    /**
     * @param width - width of the grid.
     * @param height - height of the grid.
     * @param directions - list of directions for the edges between cells.
     * @param defaultColor - default color for the graph.
     */
    constructor(
        width: number,
        height: number,
        defaultColor: C,
        directions: Point2[] = Directions.DIR4
    )
    {
        super(width, height, directions);
        this.defaultColor = defaultColor;
    }

    color([x, y]: [number, number]): C
    {
        return this._map.get(x)?.get(y) || this.defaultColor;
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
