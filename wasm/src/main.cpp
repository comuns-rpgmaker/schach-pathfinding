#include <emscripten/bind.h>

#include "algorithm/rea_star.hpp"

#include "data/grid.hpp"
#include "data/cardinal.hpp"
#include "data/interval.hpp"
#include "data/rect.hpp"

using namespace emscripten;
using namespace rea_star;

val rectangle_expansion_astar_js(Point source, Point target, Grid<bool> g) {
    auto path = rectangle_expansion_astar(source, target, g);

    if (path.has_value()) return val(path.value());
    return val::undefined();
}

EMSCRIPTEN_BINDINGS(rea_star) {    
    value_array<Point>("Point2")
        .element(&Point::x)
        .element(&Point::y);

    register_vector<Point>("PointArray");
    register_vector<Interval>("IntervalArray");

    class_<Grid<bool>>("BooleanGrid")
        .constructor<int, int, bool>()
        .function("at", &Grid<bool>::at)
        .function("set", &Grid<bool>::set)
        .property("width", &Grid<bool>::width)
        .property("height", &Grid<bool>::height);

    function("rectangleExpansionAStar", rectangle_expansion_astar_js);
}
