/**
 * @file rea_star.hpp
 * 
 * @author Brandt
 * @date 2020/09/29
 * @license Zlib
 * 
 * REA* algorithm definitions.
 */

#pragma once

#include <optional>
#include <vector>

#include "../data/grid.hpp"

namespace rea_star {
    using path_t = std::vector<Point>;

    std::optional<path_t> rectangle_expansion_astar(
        Point source,
        Point target,
        Grid<bool> g
    );
};
