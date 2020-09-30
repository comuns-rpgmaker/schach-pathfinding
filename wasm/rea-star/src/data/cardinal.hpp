/**
 * @file cardinal.hpp
 * 
 * @author Brandt
 * @date 2020/09/27
 * @license Zlib
 * 
 * Cardinal direction definitions.
 */

#pragma once

namespace rea_star {
    enum class Cardinal {
        NORTH = 0x00,
        SOUTH = 0x01,
        EAST  = 0x11,
        WEST  = 0x10
    };

    static constexpr Cardinal CARDINALS[] = {
        Cardinal::NORTH,
        Cardinal::SOUTH,
        Cardinal::EAST,
        Cardinal::WEST
    };

    enum class Axis {
        X = 0,
        Y = 1
    };

    inline constexpr Cardinal opposite(Cardinal c) {
        return static_cast<Cardinal>(static_cast<int>(c) ^ 0x1);
    }

    inline constexpr Cardinal left_orthogonal(Cardinal c) {
        return static_cast<Cardinal>(static_cast<int>(c) ^ 0x10);
    }

    inline constexpr Cardinal right_orthogonal(Cardinal c) {
        return static_cast<Cardinal>(static_cast<int>(c) ^ 0x11);
    }

    [[gnu::always_inline, gnu::hot]]
    inline constexpr int step(Cardinal c) {
        return -1 + ((static_cast<int>(c) & 0x1) << 1);
    }

    [[gnu::always_inline, gnu::hot]]
    inline constexpr Axis axis(Cardinal c) {
        return static_cast<Axis>((static_cast<int>(c) & 0x10) == 0);
    }
};
