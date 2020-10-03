/**
 * @file priority-queue.ts
 * 
 * @author Brandt
 * @date 2020/08/22
 * @license Zlib
 * 
 * Generic priority queue class implemented with a Pairing Heap.
 */

import { Relation, less } from "./order";

/**
 * Generic priority queue.
 * 
 * @template T - type of element to be stored on the queue.
 */
export class PriorityQueue<T> implements Iterator<T>
{
    readonly isLess: Relation<T>;
    
    private _data: T | undefined;
    private _children: PriorityQueue<T>[];
    private _size: number;

    /** 
     * @param isLess - strict total order in `T`.
     */
    constructor(isLess: Relation<T> = less)
    {
        this.isLess = isLess;
        this._data = undefined;
        this._children = [];
        this._size = 0;
    }

    /**
     * Queue size
     */
    get size(): number
    {
        return this._size;
    }

    /**
     * Adds a value to the queue.
     * 
     * @param value - value to be queued.
     */
    add(value: T): this
    {
        this._size++;

        const wrapper = new PriorityQueue<T>(this.isLess);
        wrapper._data = value;

        const { _data: data, _children: children } = this._merge(wrapper);
        this._data = data;
        this._children = children;

        return this;
    }

    /**
     * Empties the queue.
     */
    clear(): void 
    {
        this._data = undefined;
        this._children = [];
        this._size = 0;
    }

    /**
     * @returns the first element in the queue.
     */
    peek = (): T | undefined => this._data;

    /**
     * Removes and returns the first element in the queue.
     * 
     * @returns the first element in the queue.
     */
    next(): IteratorResult<T>
    {
        if (!this._data)
        {
            return { done: true, value: null };
        }

        const value = this._data;
        this._size--;

        const { _data: data, _children: children } = this._mergePairs(this._children);
        this._data = data;
        this._children = children;

        return { done: false, value };
    }

    /**
     * Creates a priority queue from an iterable.
     * 
     * @param iterable - iterable for the elements to be added.
     * @param isLess - strict total order in `T`.
     */
    static from<T>(
        iterable: Iterable<T> | T[],
        isLess: Relation<T> = (a, b) => a < b
    ): PriorityQueue<T>
    {
        const result = new PriorityQueue<T>(isLess);

        const array = iterable instanceof Array
            ? iterable
            : Array.from(iterable);

        array.forEach(value => result.add(value));

        return result;
    }

    private _merge(other: PriorityQueue<T>)
    {
        if (!this._data) return other;
        if (!other._data) return this;

        const merged = new PriorityQueue<T>(this.isLess);

        if (this.isLess(this._data, other._data))
        {
            merged._data = this._data;
            merged._children = [other].concat(this._children);
        }
        else
        {
            merged._data = other._data;
            const clone = new PriorityQueue<T>(this.isLess);
            clone._data = this._data;
            clone._children = this._children;
            merged._children = [clone].concat(other._children);
        }

        return merged;
    }

    private _mergePairs(queues: PriorityQueue<T>[]): PriorityQueue<T>
    {
        if (queues.length === 0)
        {
            return new PriorityQueue(this.isLess);
        }
        else
        {
            const pairs: PriorityQueue<T>[] = [];

            for (let i = 0; i < queues.length - 1; i += 2) {
                pairs.push(queues[i]._merge(queues[i + 1]));
            }

            // Add remaining heap if it's odd
            if ((queues.length & 1) === 1) {
                pairs.push(queues[queues.length - 1]);
            }

            return pairs.reduceRight((result, heap) => result._merge(heap));
        }
    }

    /**
     * TODO:
     * 
     * - Optimize memory usage by having only one instance of `isLess` and
     *   `elements`
     * 
     */
}
