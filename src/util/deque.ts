/**
 * @file deque.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * Generic double-ended queue class implemented with a circular buffer.
 */

import { Maybe, just, empty, isEmpty } from './maybe';

/**
 * Generic double-ended queue.
 * 
 * @template T - type of element to be stored on the queue.
 */
export class Deque<T>
{

    private _data: T[] = [];
    private _start = 0;
    private _length = 0;

    /**
     * @returns the length of the deque.
     */
    get length(): number
    {
        return this._length;
    }

    /**
     * Pushes an element to the top of the deque.
     * 
     * @param value - element to be pushed.
     */
    push(value: T): this
    {
        this._length++;

        if (this._length >= this._data.length) {
            this._pack();
            this._data.push(value);
        } else {
            const index = this._index(this._length - 1);
            this._data[index] = value;
        }

        return this;
    }

    /**
     * Pushes an element to the bottom of the deque.
     * 
     * @param value - element to be pushed.
     */
    unshift(value: T): this
    {
        this._length++;
        
        if (this._length >= this._data.length) {
            this._pack();
            this._start = this._data.push(value) - 1;
        } else {
            const index = this._index(-1);
            this._data[index] = value;
            this._start = index;
        }
        
        return this;
    }

    /**
     * @returns the element at the top of the deque.
     */
    top(): Maybe<T>
    {
        if (this._length === 0)
        {
            return empty();
        }
        else
        {
            const index = this._index(this._length - 1);
            return just(this._data[index]);
        }
        
    }

    /**
     * @returns the element at the bottom of the deque.
     */
    bottom(): Maybe<T>
    {
        if (this._length === 0)
        {
            return empty();
        }
        else
        {
            return just(this._data[this._start]);
        }
    }

    /**
     * Removes and returns the element at the top of the deque.
     * 
     * @returns the element at the top of the deque.
     */
    pop(): Maybe<T>
    {
        const top = this.top();
        if (!isEmpty(top)) this._length--;
        return top;
    }
    
    /**
     * Removes and returns the element at the bottom of the deque.
     * 
     * @returns the element at the bottom of the deque.
     */
    shift(): Maybe<T>
    {
        const bottom = this.bottom();

        if (!isEmpty(bottom))
        {
            this._length--;
            this._start = this._index(1);
        }

        return bottom;
    }

    /**
     * Creates a deque from an iterable.
     * 
     * @param iterable - iterable for the elements to be added.
     */
    static from<T>(iterable: Iterable<T> | T[]): Deque<T>
    {
        const array = iterable instanceof Array
            ? [...iterable]
            : Array.from(iterable);

        const result = new Deque<T>();
        result._data = array;
        result._length = array.length;

        return result;
    }

    private _index(i: number): number
    {
        return (this._data.length + this._start + i) % this._data.length;
    }

    private _pack(): void
    {
        this._data = [
            ...this._data.slice(this._start, this._start + this._length),
            ...this._data.slice(0, this._index(this._length - 1))
        ];

        this._start = 0;
    }
}
