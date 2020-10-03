/**
 * @file rect.hpp
 * 
 * @author Brandt
 * @date 2020/09/27
 * @license Zlib
 * 
 * Data type for a rectangle on a grid map.
 */

#pragma once

#include <algorithm>
#include <vector>

#include "grid.hpp"
#include "cardinal.hpp"
#include "interval.hpp"

namespace rea_star {
    class Rect {
    public:
        [[gnu::cold]]
        static Rect expand_point(const Point& p, Grid<bool>& g);

        static Rect expand_interval(const Interval& interval, Grid<bool>& g);
        
        static Rect between(const Interval& a, const Interval& b) { return Rect(a).merge(Rect(b)); }

        Rect() = default;

        Rect(const Rect&) = default;
        Rect(Rect&&) = default;

        Rect& operator=(const Rect&);
        Rect& operator=(Rect&&);

        Rect(int left, int top, int right, int bottom):
            m_left(left),
            m_top(top),
            m_right(right),
            m_bottom(bottom) {};

        Rect(const Interval& interval);

        Rect merge(const Rect& other) const;

        bool contains(const Point& p) const;

        std::vector<Point> boundaries() const;
        std::vector<Interval> walls(Cardinal cardinal) const;
        Interval extend_neighbor_interval(Cardinal cardinal) const;

        int left() const { return m_left; }
        int top() const { return m_top; }
        int right() const { return m_right; }
        int bottom() const { return m_bottom; }

        int width() const { return m_right - m_left; }
        int height() const { return m_bottom - m_top; }

        Interval north() const {
            return Interval(Cardinal::NORTH, m_top, m_left, m_right);
        }

        Interval south() const {
            return Interval(Cardinal::SOUTH, m_bottom, m_left, m_right);
        }

        Interval east() const {
            return Interval(Cardinal::EAST, m_right, m_top, m_bottom);
        }

        Interval west() const {
            return Interval(Cardinal::WEST, m_left, m_top, m_bottom);
        }

    private:
        int m_left;
        int m_top;
        int m_right;
        int m_bottom;
    };
};
