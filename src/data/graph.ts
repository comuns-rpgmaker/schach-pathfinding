/**
 * @file graph.ts
 * 
 * @author Brandt
 * @date 2020/08/23
 * @license Zlib
 * 
 * Definitions of generic interfaces for Graphs.
 */

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
     * @returns an unique numeric identifier for the given node.
     */
    id(v: T): number | undefined;

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
