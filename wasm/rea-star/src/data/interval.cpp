#include "interval.hpp"

#include <cassert>

#include "grid.hpp"

using namespace rea_star;

Point Interval::at(int index) const {
    assert(index < length());

    int c[2];

    int a = static_cast<int>(axis());
    c[a] = m_fixed;
    c[!a] = m_min + index;

    return { .x = c[0], .y = c[1] };
}

Interval Interval::subinterval(int start, int end) const {
    assert(start >= 0);
    assert(end < length());
    assert(start <= end);

    return Interval(m_cardinal, m_fixed, m_min + start, m_min + end);
}

bool Interval::contains(const Point& p) const {
    int a = static_cast<int>(axis());

    int fixed = p.coords[a], broad = p.coords[!a];
    return fixed == m_fixed && m_min <= broad && broad <= m_max;
}

bool Interval::is_free(const Grid<bool>& g) const {
    if (!is_valid(g)) return false;

    for (int i = 0; i < length(); i++) {
        Point p = at(i);
        if (!g[p]) return false;
    }

    return true;
}

bool Interval::is_valid(const Grid<bool>& g) const {
    int f = fixed();
    Axis a = axis();
    return f >= 0 && (
        (a == Axis::X && f < g.width()) ||
        (a == Axis::Y && f < g.height()));
}

template<typename T>
Interval Interval::clip(const Grid<T>& g) const {
    return Interval(
        m_cardinal,
        m_fixed,
        std::max(m_min, 0),
        std::min(m_max, (axis() == Axis::X ? g.height() : g.width()) - 1)
    );
}

template Interval Interval::clip<bool>(const Grid<bool>& g) const;

std::vector<Interval> Interval::free_subintervals(const Grid<bool>& g) const {
    Interval clipped = clip(g);
    int len = clipped.length();
    
    std::vector<Interval> subIntervals;
    subIntervals.reserve(len / 2);

    Interval i(m_cardinal, m_fixed, m_min, m_min);

    int start = 0;
    do {
        while (start < len && !g[clipped.at(start)]) start++;

        if (start >= len) break;

        int end = start;
        while (end + 1 < len && g[clipped.at(end + 1)]) end++;

        subIntervals.push_back(clipped.subinterval(start, end));

        start = end + 1;
    } while (start < len);

    return subIntervals;
}

Interval Interval::parent() const {
    return Interval(
        m_cardinal,
        m_fixed - ::rea_star::step(m_cardinal),
        m_min,
        m_max
    );
}
