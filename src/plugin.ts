import { TargetFollowingStrategy } from "./core";
import { Point2 } from "./data";
import { StandardMap } from "./strategy";

import { Game_Character } from "./patch/game-character";
import { Game_Player } from "./patch/game-player";

declare namespace PluginManager
{
    export function registerCommand(
        pluginName: string,
        commandName: string,
        f: (args: Record<string, string>) => void
    ): void;
};

declare class Game_Event extends Game_Character {}

declare const $gameMap: {
    event(id: number): Game_Event;
};

declare const $gamePlayer: Game_Player;

type StrategyConstructor =
    new (...args: any[]) => TargetFollowingStrategy<Point2, StandardMap>;

function getStrategy(pathspec: string): StrategyConstructor
{
    const parts = pathspec.split('.');
    
    let obj: any = window;
    while (parts.length > 0) obj = obj[parts.shift()!];

    return obj as StrategyConstructor;
}

PluginManager.registerCommand("__pluginId__", "event_follow_player", args => {
    const eventId = Number(args.event_id);
    const strategy = getStrategy(args.strategy);

    $gameMap.event(eventId).follow($gamePlayer, strategy);
});

PluginManager.registerCommand("__pluginId__", "event_to_point", args => {
    const eventId = Number(args.event_id);
    const pX = Number(args.point_x);
    const pY = Number(args.point_y);
    const strategy = getStrategy(args.strategy);
    
    $gameMap.event(eventId).follow([pX, pY], strategy);
});

PluginManager.registerCommand("__pluginId__", "event_clear", args => {
    const eventId = Number(args.event_id);

    $gameMap.event(eventId).clearPath();
});

PluginManager.registerCommand("__pluginId__", "player_follow_event", args => {
    const eventId = Number(args.event_id);
    const strategy = getStrategy(args.strategy);
    
    $gamePlayer.follow($gameMap.event(eventId), strategy);
});

PluginManager.registerCommand("__pluginId__", "player_to_point", args => {
    const pX = Number(args.point_x);
    const pY = Number(args.point_y);
    const strategy = getStrategy(args.strategy);
    
    $gamePlayer.follow([pX, pY], strategy);
});

PluginManager.registerCommand("__pluginId__", "player_clear", args => {
    $gamePlayer.clearPath();
});
