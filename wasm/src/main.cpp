#include <emscripten/bind.h>

#include "algorithm/rea_star.hpp"

#include "data/grid.hpp"
#include "data/cardinal.hpp"

using namespace emscripten;
using namespace rea_star;

EMSCRIPTEN_BINDINGS(rea_star) {    
    value_array<Point>("Point2")
        .element(&Point::x)
        .element(&Point::y);

    class_<Grid<bool>>("BooleanGrid")
        .constructor<int, int, bool>()
        .function("at", &Grid<bool>::at)
        .function("set", &Grid<bool>::set)
        .function("width", &Grid<bool>::width)
        .function("height", &Grid<bool>::height);

    enum_<Cardinal>("Cardinal")
        .value("NORTH", Cardinal::NORTH)
        .value("SOUTH", Cardinal::SOUTH)
        .value("EAST", Cardinal::EAST)
        .value("WEST", Cardinal::WEST);

    function("opposite", opposite);
    function("left_orthogonal", left_orthogonal);
    function("right_orthogonal", right_orthogonal);
    function("step", step);
    function("axis", axis);
}
