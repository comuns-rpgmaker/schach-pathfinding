declare const $gameTemp: {
    isDestinationValid(): boolean;
}

declare class Game_Character
{
    canMoveBasic(): boolean;
    canMove(): boolean;
    isFollowingPath(): boolean;
}

declare class Game_Player extends Game_Character {}

Game_Player.prototype.canMoveBasic = Game_Player.prototype.canMove;

Game_Player.prototype.canMove = function(): boolean
{
    return this.canMoveBasic() && !this.isFollowingPath();
}
