#include "rect.hpp"

using namespace rea_star;

Rect::Rect(const Interval& interval) {
    int left, top, right, bottom;

    switch (interval.axis()) {
    case Axis::X:
        left = right = interval.fixed();
        top = interval.min();
        bottom = interval.max();
        break;

    case Axis::Y:
        top = bottom = interval.fixed();
        left = interval.min();
        right = interval.max();
        break;
    }

    m_left = left;
    m_top = top;
    m_right = right;
    m_bottom = bottom;
}

Rect Rect::expand_point(const Point& p, const Grid<bool>& g) {
    int l = p.x, t = p.y,
        r = l, b = t;

    while (r < g.width() && g.at({ .x = r, .y = t })) r++;
    r--;

    while (l >= 0 && g.at({ .x = l, .y = t })) l--;
    l++;

    while (b < g.height()) {
        for (int x = l; x <= r; x++) {
            if (!g.at({ .x = x, .y = b })) goto bottom_done;
        }
        b++;
    }
    bottom_done: b--;

    while (t >= 0 && t < g.height()) {
        for (int x = l; x <= r; x++) {
            if (!g.at({ .x = x, .y = t })) goto top_done;
        }
        t--;
    }
    top_done: t++;

    return Rect(l, t, r, b);
}

Rect Rect::expand_interval(const Interval& interval, const Grid<bool>& g) {
    Interval expanded = interval;
    for (Interval i = expanded; i.is_free(g); i.step()) {
        expanded = i;
    }

    return between(interval, expanded);
}

Rect Rect::merge(const Rect& other) const {
    int left = std::min(m_left, other.m_left),
        top = std::min(m_top, other.m_top),
        right = std::max(m_right, other.m_right),
        bottom = std::max(m_bottom, other.m_bottom);

    return Rect(left, top, right, bottom);
}

bool Rect::contains(const Point& p) const {
    return m_left <= p.x && p.x <= m_right
        && m_top <= p.y && p.y <= m_bottom;
}

std::vector<Point> Rect::boundaries() const {
    std::vector<Point> points;
    points.reserve((width() + height()) * 2);

    for (int x = m_left; x <= m_right; x++) {
        points.push_back({ .x = x, .y = m_top });
        points.push_back({ .x = x, .y = m_bottom });
    }

    for (int y = m_top + 1; y < m_bottom; y++) {
        points.push_back({ .x = m_left, .y = y });
        points.push_back({ .x = m_right, .y = y });
    }

    return points;
}

std::vector<Interval> Rect::walls(Cardinal cardinal) const {
    switch (cardinal) {
    case Cardinal::NORTH:
        return { east(), west(), south() };
    case Cardinal::SOUTH:
        return { east(), west(), north() };
    case Cardinal::EAST:
        return { north(), south(), west() };
    case Cardinal::WEST:
        return { north(), south(), east() };
    }
}

Interval Rect::extend_neighbor_interval(Cardinal cardinal) const {
    switch (cardinal)
    {
    case Cardinal::NORTH:
        return Interval(cardinal, m_top - 1, m_left - 1, m_right + 1);

    case Cardinal::SOUTH:
        return Interval(cardinal, m_bottom + 1, m_left - 1, m_right + 1);

    case Cardinal::EAST:
        return Interval(cardinal, m_right + 1, m_top - 1, m_bottom + 1);

    case Cardinal::WEST:
        return Interval(cardinal, m_left - 1, m_top - 1, m_bottom + 1);
    }
}
