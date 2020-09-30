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
    /**
     * Path container type.
     */
    using path_t = std::vector<Point>;

    /**
     * Finds the shortest path between two points on a boolean matrix.
     * 
     * @param source starting point.
     * @param target goal point.
     * @param g boolean matrix.
     * 
     * @return either a path container or nullopt if none exist.
     */
    std::optional<path_t> rectangle_expansion_astar(
        Point source,
        Point target,
        Grid<bool> g
    );
};
