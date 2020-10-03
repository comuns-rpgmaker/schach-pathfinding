export declare class Game_Character
{
    static followingPath: number;
}

declare class Game_System
{
    isSaveEnabled(): boolean;
}

const isSaveEnabled = Game_System.prototype.isSaveEnabled;
Game_System.prototype.isSaveEnabled = function(): boolean
{
    return isSaveEnabled.call(this) && Game_Character.followingPath === 0;
}
