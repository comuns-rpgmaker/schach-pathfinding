/**
 * @file rect.ts
 * 
 * @author Brandt
 * @date 2020/09/25
 * @license Zlib
 * 
 * Definitions for rectangles on a square grid map.
 */

import {
    Interval,
    Point2,
    Cardinal,
    ColoredSquareGridMap
} from "data/square-grid";

export class Rect
{
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;

    static expand(p: Point2, g: ColoredSquareGridMap<unknown>): Rect
    {
        const color = g.color(p);

        let [left, top] = p;
        let right = left, bottom = top;

        while (right < g.width && g.color([right, top]) == color) right++;
        right--;

        while (g.color([left, top]) == color) left--;
        left++;

        bottom: while (bottom < g.height) {
            for (let i = left; i <= right; i++)
                if (g.color([i, bottom]) != color) break bottom;
            bottom++;
        }
        bottom--;

        top: while (top < g.height) {
            for (let i = left; i <= right; i++)
                if (g.color([i, top]) != color) break top;
            top--;
        }
        top++;

        return new Rect(left, top, right, bottom);
    }

    static merge(a: Rect, b: Rect): Rect
    {
        const left = Math.min(a.left, b.left),
              top = Math.min(a.top, b.top),
              right = Math.max(a.right, b.right),
              bottom = Math.max(a.bottom, b.bottom);

        return new Rect(left, top, right, bottom);
    }

    static between(a: Interval, b: Interval): Rect
    {
        return this.merge(a.toRect(), b.toRect());
    }

    constructor(left: number, top: number, right: number, bottom: number)
    {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    contains([x, y]: Point2): boolean
    {
        return this.left <= x && x <= this.right
                && this.top <= y && y <= this.bottom;
    }

    boundaries(): Point2[]
    {
        const { left, top, right, bottom } = this;
        const points: Point2[] = [];

        for (let x = left; x <= right; x++)
        {
            points.push([x, top]);
            points.push([x, bottom]);
        }

        for (let y = top + 1; y < bottom; y++)
        {
            points.push([left, y]);
            points.push([right, y]);
        }

        return points;
    }

    extendNeighborInterval(cardinal: Cardinal): Interval
    {
        switch (cardinal)
        {
            case Cardinal.NORTH:
                return Interval.of(
                    cardinal,
                    this.top - 1,
                    this.left - 1,
                    this.right + 1
                );

            case Cardinal.SOUTH:
                return Interval.of(
                    cardinal,
                    this.bottom + 1,
                    this.left - 1,
                    this.right + 1
                );

            case Cardinal.EAST:
                return Interval.of(
                    cardinal,
                    this.right + 1,
                    this.top - 1,
                    this.bottom + 1
                );

            case Cardinal.WEST:
                return Interval.of(
                    cardinal,
                    this.left - 1,
                    this.top - 1,
                    this.bottom + 1
                );
        }
    }

    get north(): Interval
    {
        return Interval.of(Cardinal.NORTH, this.top, this.left, this.right);
    }

    get south(): Interval
    {
        return Interval.of(Cardinal.SOUTH, this.bottom, this.left, this.right);
    }

    get east(): Interval
    {
        return Interval.of(Cardinal.EAST, this.right, this.top, this.bottom);
    }

    get west(): Interval
    {
        return Interval.of(Cardinal.WEST, this.left, this.top, this.bottom);
    }

    perpendicular(cardinal: Cardinal): [Interval, Interval]
    {
        switch (cardinal)
        {
            case Cardinal.NORTH:
            case Cardinal.SOUTH:
                return [this.west, this.east];
            
            case Cardinal.EAST:
            case Cardinal.WEST:
                return [this.north, this.south];
        }
    }

    parallel(cardinal: Cardinal): Interval
    {
        switch (cardinal)
        {
            case Cardinal.NORTH:
                return this.north;

            case Cardinal.SOUTH:
                return this.south;

            case Cardinal.EAST:
                return this.east;

            case Cardinal.WEST:
                return this.west;
        }
    }
}
