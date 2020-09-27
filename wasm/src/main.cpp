#include <emscripten/bind.h>

#include "algorithm/rea_star.hpp"
#include "data/grid.hpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(rea_star) {
    function("lerp", &lerp);
    
    value_array<rea_star::point>("Point2")
        .element(&rea_star::point::x)
        .element(&rea_star::point::y);

    class_<rea_star::grid<bool>>("BoolGrid")
        .constructor<int, int, bool>()
        .function("at", &rea_star::grid<bool>::at)
        .function("set", &rea_star::grid<bool>::set)
        .function("width", &rea_star::grid<bool>::width)
        .function("height", &rea_star::grid<bool>::height);
}
