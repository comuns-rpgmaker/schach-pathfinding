#include <emscripten/bind.h>

#include "algorithm/rea_star.hpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(rea_star) {
    function("lerp", &lerp);
}
