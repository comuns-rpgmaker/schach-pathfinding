#include <emscripten/bind.h>

#include "algorithm/rea_star.hpp"

#include "data/grid.hpp"
#include "data/cardinal.hpp"
#include "data/interval.hpp"
#include "data/rect.hpp"

using namespace emscripten;
using namespace rea_star;

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

    enum_<Axis>("Axis")
        .value("X", Axis::X)
        .value("Y", Axis::Y);

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

    class_<Interval>("Interval")
        .constructor<Cardinal, int, int, int>()
        .function("at", &Interval::at)
        .function("subinterval", &Interval::subinterval)
        .function("contains", &Interval::contains)
        .function("isFree", &Interval::is_free<bool>)
        .function("freeSubIntervals", &Interval::free_subintervals<bool>)
        .property("length", &Interval::length)
        .property("axis", &Interval::axis)
        .property("fixed", &Interval::fixed)
        .property("min", &Interval::min)
        .property("max", &Interval::max);

    class_<Rect>("Rect")
        .constructor<int, int, int, int>()
        .constructor<const Interval&>()
        .class_function("expandPoint", &Rect::expand_point<bool>)
        .class_function("expandInterval", &Rect::expand_interval<bool>)
        .class_function("between", &Rect::between)
        .function("contains", &Rect::contains)
        .function("merge", &Rect::merge)
        .property("left", &Rect::left)
        .property("top", &Rect::top)
        .property("right", &Rect::right)
        .property("bottom", &Rect::bottom)
        .property("width", &Rect::width)
        .property("height", &Rect::height)
        .property("north", &Rect::north)
        .property("south", &Rect::south)
        .property("east", &Rect::east)
        .property("west", &Rect::west)
        .property("boundaries", &Rect::boundaries)
        .function("extendNeighborInterval", &Rect::extend_neighbor_interval);
}
