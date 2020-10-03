import { Game_Character } from './game-character';

export declare class Game_Player extends Game_Character {}

Game_Player.prototype.canMoveBasic = Game_Player.prototype.canMove;

Game_Player.prototype.canMove = function(): boolean
{
    return this.canMoveBasic() && !this.isFollowingPath();
}
