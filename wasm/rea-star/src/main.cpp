#include <emscripten/bind.h>

#include "algorithm/rea_star.hpp"

#include "data/grid.hpp"
#include "data/interval.hpp"

using namespace emscripten;
using namespace rea_star;

val rectangle_expansion_astar_js(
    Point source,
    Point target,
    const Grid<bool>& g,
    int maxlen = INT32_MAX
) {
    auto path = rectangle_expansion_astar(source, target, g, maxlen);

    if (path.has_value()) return val(path.value());
    return val::undefined();
}

val rea_star::show_tile = val::undefined();

void register_show_tile(val show_tile) {
    rea_star::show_tile = show_tile;
}

EMSCRIPTEN_BINDINGS(rea_star) {    
    value_array<Point>("Point2")
        .element(&Point::x)
        .element(&Point::y);

    function("registerShowTile", &register_show_tile);

    register_vector<Point>("PointArray");

    class_<Grid<bool>>("BooleanGrid")
        .constructor<val>()
        .function("at", &Grid<bool>::operator[])
        .property("width", &Grid<bool>::width)
        .property("height", &Grid<bool>::height);

    function("rectangleExpansionAStar", rectangle_expansion_astar_js);
}
