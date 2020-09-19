/**
 * @file priority-queue.ts
 * 
 * @author Brandt
 * @date 2020/08/22
 * @license Zlib
 * 
 * Generic priority queue class implemented with a Pairing Heap.
 */

import { Maybe, just, empty, isEmpty } from "./maybe";

type Relation<T> = (a: T, b: T) => boolean;

/**
 * Generic priority queue.
 * 
 * @template T - type of element to be stored on the queue.
 */
export class PriorityQueue<T> implements Iterator<T>
{

    readonly isLess: Relation<T>;
    
    private _data: Maybe<T>;
    private _children: PriorityQueue<T>[];
    private _elements: Set<T>;

    /** 
     * @param isLess - strict total order in `T`.
     */
    constructor(isLess: Relation<T> = (a, b) => a < b)
    {
        this.isLess = isLess;
        this._data = empty();
        this._children = [];
        this._elements = new Set();
    }

    /**
     * Queue size
     */
    get size(): number
    {
        return this._elements.size;
    }

    /**
     * Adds a value to the queue.
     * 
     * @param value - value to be queued.
     */
    add(value: T): this
    {
        this._elements.add(value);

        const wrapper = new PriorityQueue<T>(this.isLess);
        wrapper._data = just(value);

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
        this._data = empty();
        this._children = [];
        this._elements.clear();
    }

    /**
     * @returns the first element in the queue.
     */
    peek = (): T | undefined => this._data.value;

    /**
     * Removes and returns the first element in the queue.
     * 
     * @returns the first element in the queue.
     */
    next(): IteratorResult<T>
    {
        if (isEmpty(this._data))
        {
            return { done: true, value: null };
        }

        const value = this._data.value;
        this._elements.delete(value);

        const { _data: data, _children: children } = this._mergePairs(this._children);
        this._data = data;
        this._children = children;

        return { done: false, value };
    }

    /**
     * @param elem - element to be looked for.
     * @returns `true` if `elem` is queued.
     */
    has = (elem: T): boolean => this._elements.has(elem)

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
        if (isEmpty(this._data)) return other;
        if (isEmpty(other._data)) return this;

        const merged = new PriorityQueue<T>(this.isLess);

        if (this.isLess(this._data.value, other._data.value))
        {
            merged._data = this._data;
            merged._children = [other, ...this._children];
        }
        else
        {
            merged._data = other._data;
            merged._children = [Object.assign({}, this), ...other._children];
        }

        return merged;
    }

    private _mergePairs(queues: PriorityQueue<T>[]): PriorityQueue<T>
    {
        if (queues.length === 0)
        {
            return new PriorityQueue(this.isLess);
        }
        else if (queues.length === 1)
        {
            return queues[0];
        }
        else
        {
            const rest = this._mergePairs(queues.slice(2));
            return queues[0]._merge(queues[1])._merge(rest);
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
