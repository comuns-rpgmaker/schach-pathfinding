import { GameMapGraph } from "../data/game-map-graph";

export declare class Game_Map {
    initialize(): void;
    graph(): GameMapGraph;
}

const initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function(): void
{
    initialize.call(this);
    this._graph = new GameMapGraph();
}

Game_Map.prototype.graph = function(): GameMapGraph
{
    return this._graph;
}
