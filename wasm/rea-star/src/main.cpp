#include <emscripten/bind.h>

#include "algorithm/rea_star.hpp"

#include "data/grid.hpp"
#include "data/interval.hpp"

using namespace emscripten;
using namespace rea_star;

val rectangle_expansion_astar_js(
    Point source,
    Point target,
    Grid<bool> g,
    int maxlen = INT32_MAX
) {
    auto path = rectangle_expansion_astar(source, target, g, maxlen);

    if (path.has_value()) return val(path.value());
    return val::undefined();
}

EMSCRIPTEN_BINDINGS(rea_star) {    
    value_array<Point>("Point2")
        .element(&Point::x)
        .element(&Point::y);

    register_vector<Point>("PointArray");

    class_<Grid<bool>>("BooleanGrid")
        .constructor<val>()
        .function("at", &Grid<bool>::operator[])
        .property("width", &Grid<bool>::width)
        .property("height", &Grid<bool>::height);

    function("rectangleExpansionAStar", rectangle_expansion_astar_js);
}
