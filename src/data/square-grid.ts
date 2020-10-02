/**
 * @file square-grid.ts
 * 
 * @author Brandt
 * @date 2020/09/25
 * @license Zlib
 * 
 * Definitions for square grid map graphs.
 */

import { Graph } from "../data/graph";

export type Point2 = [number, number];

/**
 * Square grid map graph interface.
 */
export abstract class SquareGridMap implements Graph<Point2>
{
    /** Width of the grid. */
    abstract get width(): number;

    /** Height of the grid. */
    abstract get height(): number;

    abstract from(p: Point2): Point2[];

    id([x, y]: Point2): number | undefined
    {
        if (!this.contains([x, y])) return undefined;
        else return x + y * this.width;
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

    /**
     * Octile distance between vertices.
     * 
     * @param param0 - Source vertex.
     * @param param1 - Target vertex.
     */
    static octile([x1, y1]: Point2, [x2, y2]: Point2) {
        const dx = Math.abs(x1 - x2),
              dy = Math.abs(y1 - y2);

        return Math.SQRT2 * Math.min(dx, dy) + Math.abs(dx - dy);
    }
}
