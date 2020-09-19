/**
 * @file array-map.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * Array map, only supports number indexes but is faster than a proper Map in
 * practice, at the cost of taking up more space if the map is sparse.
 */

 /**
  * Array map class, implements Map interface while using an underlying array.
  * 
  * @template V - Type of element being stored.
  */
export class ArrayMap<V> implements Map<number, V>
{

    private _data: V[];
    private readonly _provider?: () => V;

    /**
     * @param provider - Function used to generate the default value for an
     *                   empty cell.
     * 
     * @note You should pass a provider function whenever possible, since doing
     *       so will avoid making the underlying array holey. 
     */
    constructor(provider?: () => V) {
        this._data = [];
        this._provider = provider;
    }

    clear(): void {
        this._data = [];
    }

    delete(key: number): boolean {
        if (this.has(key)) {
            if (this._provider) this._data[key] = this._provider();
            else delete this._data[key];

            return true;
        } else {
            return false;
        }
    }

    forEach(callbackfn: (value: V, key: number, map: Map<number, V>) => void, thisArg?: any): void {
        this._data.forEach((value, index) => callbackfn(value, index, this), thisArg);
    }

    get(key: number): V | undefined {
        if (this.has(key)) return this._data[key];
        else if (this._provider) return this._provider();
        else return undefined;
    }

    has(key: number): boolean {
        return 0 <= key && key < this._data.length;
    }

    set(key: number, value: V): this {
        if (!this.has(key)) this._data = this._expand(key);
        this._data[key] = value;
        return this;
    }

    get size(): number {
        return this._data.length;
    }

    *[Symbol.iterator](): IterableIterator<[number, V]> {
        this._data.forEach((value, index) => yield [index, value]);
    }

    *entries(): IterableIterator<[number, V]> {
        this._data.forEach((value, index) => yield [index, value]);
    }

    *keys(): IterableIterator<number> {
        for (let i = 0; i < this.size; i++) yield i;
    }

    values(): IterableIterator<V> {
        return this._data[Symbol.iterator]();
    }

    [Symbol.toStringTag]: string = 'Array map';

    private _expand(size: number): V[] {
        const spec = { length: size - this._data.length };
        const rest = this._provider
            ? Array.from(spec, () => this._provider!())
            : Array.from<V>(spec);
        return this._data.concat(rest);
    }
}
