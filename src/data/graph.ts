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
 * Square grid map graph abstract class.
 */
export abstract class SquareGridMap implements Graph<Point2>
{
    readonly width: number;
    readonly height: number;

    /**
     * @param width - width of the grid.
     * @param height - height of the grid.
     */
    constructor(width: number, height: number)
    {
        this.width = width;
        this.height = height;
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

    abstract neighbors([x, y]: Point2): Point2[];

    protected _withOffsets([x, y]: Point2, offsets: Point2[]): Point2[]
    {
        return offsets.map(([ox, oy]) => [x + ox, y + oy] as Point2)
                      .filter(p => this.contains(p));
    }
}

/**
 * Square grid map graph with edges between each cell and its orthogonal
 * neighbors.
 */
export class SquareGridMap4Dir extends SquareGridMap
{
    private static readonly ORTHOGONAL = zip([1, 0, -1, 0], [0, 1, 0, -1]);

    neighbors(p: Point2): Point2[]
    {
        return this._withOffsets(p, SquareGridMap4Dir.ORTHOGONAL);
    }
}

/**
 * Square grid map graph with edges between each cell and both its orthogonal
 * and diagonal neighbors.
 */
export class SquareGridMap8Dir extends SquareGridMap4Dir
{    
    private static readonly DIAGONAL = zip([1, 1, -1, -1], [1, -1, 1, -1]);

    neighbors(p: Point2): Point2[]
    {
        const orthogonal = super.neighbors(p);
        const diagonal = this._withOffsets(p, SquareGridMap8Dir.DIAGONAL);
        return orthogonal.concat(diagonal);
    }
}
