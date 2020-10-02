/**
 * @file game-map-graph.ts
 * 
 * @author Brandt
 * @date 2020/10/01
 * @license Zlib
 * 
 * Definitions for the graph representing the game map.
 */

import { Point2, SquareGridMap } from '../data/square-grid';
import { Colored, Weighted } from './graph';

declare class Game_Vehicle {
    posNt(x: number, y: number): boolean;
}

declare class Game_Event {
    isNormalPriority(): boolean;
}

declare const $gameMap: {
    width(): number;
    height(): number;
    roundXWithDirection(x: number, d: number): number;
    roundYWithDirection(y: number, d: number): number;
    checkPassage(x: number, y: number, flag: number): boolean;
    isValid(x: number, y: number): boolean;
    isPassable(x: number, y: number, d: number): boolean;
    boat(): Game_Vehicle;
    ship(): Game_Vehicle;
    eventsXyNt(x: number, y: number): Game_Event[];
    tilesetFlags(): number[];
};

declare const $dataMap: {
    data: number[];
};

export class GameMapGraph extends SquareGridMap
    implements Colored<Point2, boolean>, Weighted<Point2>
{
    get width(): number
    {
        return $gameMap.width();
    }

    get height(): number
    {
        return $gameMap.height();
    }

    from([x, y]: Point2): Point2[]
    {
        const neighbors: Point2[] = [];
        for (let d = 2; d <= 8; d += 2)
        {
            const x2 = $gameMap.roundXWithDirection(x, d);
            const y2 = $gameMap.roundYWithDirection(y, d);         
            if (this.canPass([x2, y2], d)) neighbors.push([x2, y2]);
        }

        return neighbors;
    }

    color([x, y]: Point2): boolean
    {
        if (this.collidesWithEvents(x, y)) return false;

        const width = this.width;
        const height = this.height;
        const flags = $gameMap.tilesetFlags();
        for (let z = 0; z < 4; z++)
        {
            const tile = $dataMap.data[(z * height + y) * width + x] || 0;
            const flag = flags[tile];

            if ((flag & 0x10) !== 0) continue;
            return (flag & 0xf) === 0;
        }

        return true;
    }

    weight(source: Point2, target: Point2): number {
        return SquareGridMap.d1(source, target);
    }

    private canPass([x, y]: Point2, d: number): boolean
    {
        if (!$gameMap.isValid(x, y)) return false;

        const d2 = 10 - d;
        if (!$gameMap.isPassable(x, y, d) || !$gameMap.isPassable(x, y, d2))
        {
            return false;
        }

        if ($gameMap.boat().posNt(x, y) || $gameMap.ship().posNt(x, y))
        {
            return false;
        }

        return !this.collidesWithEvents(x, y);
    }

    private collidesWithEvents(x: number, y: number): boolean
    {
        const events = $gameMap.eventsXyNt(x, y);
        return events.some(e => e.isNormalPriority());
    }
}
