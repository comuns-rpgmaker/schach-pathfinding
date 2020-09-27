import { showInterval } from "algorithm/rea-star";
/**
 * @file rect.ts
 * 
 * @author Brandt
 * @date 2020/09/26
 * @license Zlib
 * 
 * Definitions for linear intervals on a square grid map.
 */

import {
    Cardinal,
    ColoredSquareGridMap,
    Point2,
    Rect
} from "data/square-grid";
import { SquareGridMap } from "./map";

/**
 * Describes a set of contiguous points in the same row or column of a grid.
 */
export abstract class Interval {
    /**
     * Cardinal expansion direction of this interval.
     */
    readonly cardinal: Cardinal;

    /**
     * Length of the interval in grid cells.
     */
    readonly length: number;

    /**
     * Creates an interval object.
     * 
     * @param cardinal - expansion direction.
     * @param fixed - fixed coordinate of the interval (row/column).
     * @param min - minimum coordinate of the interval on the broad direction.
     * @param max - maximum coordinate of the interval on the broad direction.
     */
    static of(
        cardinal: Cardinal,
        fixed: number,
        min: number,
        max: number
    ): Interval
    {
        const type = [
            NorthInterval,
            SouthInterval,
            EastInterval,
            WestInterval
        ][cardinal];

        return new type(fixed, min, max);
    }

    /**
     * @param length Length of the interval.
     */
    constructor(length: number)
    {
        this.length = length;
    }

    /**
     * Checks whether this interval contains a point.
     * 
     * @param p - point on a plane.
     * @returns whether the point lies within the interval.
     */
    abstract contains(p: Point2): boolean;

    /**
     * Gets the point at a given index of the interval.
     * 
     * @param index - index within the interval.
     * @returns a point on the interval.
     * 
     * @note if the index out of bounds, behavior is undefined.
     */
    abstract at(index: number): Point2;

    /**
     * Gets a subinterval of this given starting and ending indexes.
     * 
     * @param start - index of the first point in the subinterval.
     * @param end - index of the last point in the subinterval.
     * 
     * @returns a subinterval of this.
     * 
     * @note if indexes are out of bounds or start < end, behavior is undefined.
     */
    abstract subinterval(start: number, end: number): Interval;

    /**
     * Returns all subintervals of this that have a given color on a graph.
     * 
     * @param g - a colored square grid map.
     * @param free - the color to filter.
     * 
     * @returns a list of subintervals that have the given color on the graph.
     */
    freeSubIntervals<C>(
        g: ColoredSquareGridMap<C>,
        free: C
    ): Interval[]
    {
        const subIntervals: Interval[] = [];
        const length = this.length;

        let start = 0;
        do
        {
            while (start <= length && g.color(this.at(start)) != free) start++;
            if (start > length) break;

            let end = start;
            while (end + 1 < length && g.color(this.at(end + 1)) == free) end++;

            subIntervals.push(this.subinterval(start, end));

            start = end + 1;
        }
        while (start <= length);

        return subIntervals;
    }

    /**
     * Expands a rectangle from this interval until blocked on the graph.
     * 
     * @param g - colored square grid map.
     * 
     * @returns an unblocked rect on the given graph.  
     */
    expandRect(
        g: ColoredSquareGridMap<unknown>,
        color: unknown
    ): Rect
    {
        let other: Interval = this;
        for (let i = other; i.isFree(g, color); i = i.step()) {
            other = i;
        }

        return Rect.between(this, other);
    }

    /**
     * Converts this interval into a thin rect.
     * 
     * @returns a rect which completely overlaps with this interval.
     */
    abstract toRect(): Rect;

    /**
     * Moves this interval on the expansion direction and returns the new
     * interval.
     * 
     * @returns a contiguous interval with same length as this.
     */
    abstract step(): Interval;

    /**
     * Reverse operation of {@link Interval#step}.
     * 
     * @returns a contiguous interval with same length as this.
     * 
     * @see Interval#step
     */
    abstract parent(): Interval;

    /**
     * Checks whether this is a valid interval on a grid.
     * 
     * @param g - square grid map.
     * 
     * @returns whether the interval lies entirely within the graph. 
     */
    abstract isValid(g: SquareGridMap): boolean;

    /**
     * Checks whether this interval is completely of a given color on a graph.
     * 
     * @param g - colored square grid map.
     * @param free - free color.
     * 
     * @returns whether this interval is completely free on the graph.
     */
    isFree<C>(
        g: ColoredSquareGridMap<C>,
        free: C
    ): boolean
    {
        for (let i = 0; i < this.length; i++)
        {
            if (g.color(this.at(i)) !== free) return false;
        }

        return true;
    }

    /**
     * @returns whether this is a row interval.
     */
    isRow(): this is RowInterval
    {
        return false;
    }

    /**
     * @returns whether this is a column interval.
     */
    isColumn(): this is ColumnInterval
    {
        return false;
    }
}

abstract class RowInterval extends Interval {
    readonly y: number;
    readonly left: number;
    readonly right: number;

    constructor(y: number, left: number, right: number)
    {
        super(right - left + 1);
        this.y = y;
        this.left = left;
        this.right = right;
    }

    isRow(): this is RowInterval
    {
        return true;
    }
    
    contains([x, y]: Point2): boolean
    {
        return y == this.y && this.left <= x && x <= this.right;
    }

    at(index: number): Point2
    {
        return [this.left + index, this.y];
    }

    subinterval(start: number, end: number): Interval
    {
        const left = this.left + start, right = this.left + end;
        return Interval.of(this.cardinal, this.y, left, right);
    }

    toRect(): Rect
    {
        return new Rect(this.left, this.y, this.right, this.y);
    }

    isValid(g: SquareGridMap): boolean
    {
        return 0 <= this.y && this.y < g.height;
    }
}

export class NorthInterval extends RowInterval
{
    readonly cardinal: Cardinal.NORTH;

    constructor(y: number, left: number, right: number)
    {
        super(y, left, right);
        this.cardinal = Cardinal.NORTH;
    }

    step(): Interval {
        return new NorthInterval(this.y - 1, this.left, this.right);
    }

    parent(): Interval {
        return new NorthInterval(this.y + 1, this.left, this.right);
    }
}

class SouthInterval extends RowInterval
{
    readonly cardinal: Cardinal.SOUTH;

    constructor(y: number, left: number, right: number)
    {
        super(y, left, right);
        this.cardinal = Cardinal.SOUTH;
    }

    step(): Interval {
        return new SouthInterval(this.y + 1, this.left, this.right);
    }

    parent(): Interval {
        return new SouthInterval(this.y - 1, this.left, this.right);
    }
}

abstract class ColumnInterval extends Interval {
    readonly x: number;
    readonly top: number;
    readonly bottom: number;

    constructor(x: number, top: number, bottom: number)
    {
        super(bottom - top + 1);
        this.x = x;
        this.top = top;
        this.bottom = bottom;
    }

    isColumn(): this is ColumnInterval
    {
        return true;
    }

    contains([x, y]: Point2): boolean
    {
        return x == this.x && this.top <= y && y <= this.bottom;
    }

    at(index: number): Point2
    {
        return [this.x, this.top + index];
    }

    subinterval(start: number, end: number): Interval
    {
        const top = this.top + start, bottom = this.top + end;
        return Interval.of(this.cardinal, this.x, top, bottom);
    }

    toRect(): Rect
    {
        return new Rect(this.x, this.top, this.x, this.bottom);
    }

    isValid(g: SquareGridMap): boolean
    {
        return 0 <= this.x && this.x < g.height;
    }
}

class EastInterval extends ColumnInterval {
    readonly cardinal: Cardinal.EAST;

    constructor(x: number, top: number, bottom: number)
    {
        super(x, top, bottom);
        this.cardinal = Cardinal.EAST;
    }

    step(): Interval {
        return new EastInterval(this.x + 1, this.top, this.bottom);
    }

    parent(): Interval {
        return new EastInterval(this.x - 1, this.top, this.bottom);
    }
}

class WestInterval extends ColumnInterval {
    readonly cardinal: Cardinal.WEST;

    constructor(x: number, top: number, bottom: number)
    {
        super(x, top, bottom);
        this.cardinal = Cardinal.WEST;
    }

    step(): Interval {
        return new WestInterval(this.x - 1, this.top, this.bottom);
    }

    parent(): Interval {
        return new WestInterval(this.x + 1, this.top, this.bottom);
    }
}
