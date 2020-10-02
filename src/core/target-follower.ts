/**
 * @file target-follower.ts
 * 
 * @author Brandt
 * @date 2020/10/02
 * @license Zlib
 * 
 * Interface for a target-following object.
 */

/**
 * Interface for an object that can follow a target.
 */
export interface TargetFollower<T>
{
    follow(target: T): void;
}
