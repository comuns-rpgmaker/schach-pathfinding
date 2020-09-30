/**
 * @file interval.hpp
 * 
 * @author Brandt
 * @date 2020/09/27
 * @license Zlib
 * 
 * Data type for a directed interval on a grid map.
 */

#pragma once

#include "grid.hpp"
#include "cardinal.hpp"

namespace rea_star {
    class Interval {
    public:
        Interval(Cardinal cardinal, int fixed, int min, int max):
            m_cardinal(cardinal),
            m_fixed(fixed),
            m_min(min),
            m_max(max) {};

        Interval() = default;

        Interval(const Interval&) = default;
        Interval(Interval&&) = default;

        Interval& operator=(const Interval&) = default;
        Interval& operator=(Interval&&) = default;

        Point at(int index) const {
            assert(index < length());

            int c[2];

            int a = static_cast<int>(axis());
            c[a] = m_fixed;
            c[!a] = m_min + index;

            return { .x = c[0], .y = c[1] };
        }

        Interval subinterval(int start, int end) const {
            assert(start >= 0);
            assert(end < length());
            assert(start <= end);

            return Interval(m_cardinal, m_fixed, m_min + start, m_min + end);
        }

        bool contains(const Point& p) const {
            int a = static_cast<int>(axis());

            int fixed = p.coords[a], broad = p.coords[!a];
            return fixed == m_fixed && m_min <= broad && broad <= m_max;
        }

        [[gnu::hot]]
        bool is_free(const Grid<bool>& g) const {
            if (!is_valid(g)) return false;

            for (int i = 0; i < length(); i++) {
                Point p = at(i);
                if (!g.at(p)) return false;
            }

            return true;
        }

        [[gnu::hot]]
        bool is_valid(const Grid<bool>& g) const {
            return fixed() >= 0 && (
                (axis() == Axis::X && fixed() <= g.width()) ||
                (axis() == Axis::Y && fixed() <= g.height()));
        }

        template <typename T>
        Interval clip(const Grid<T>& g) const {
            return Interval(
                m_cardinal,
                m_fixed,
                std::max(m_min, 0),
                std::min(m_max, axis() == Axis::X ? g.height() : g.width())
            );
        }

        std::vector<Interval> free_subintervals(const Grid<bool>& g) const {
            Interval clipped = clip(g);
            int len = clipped.length();
            
            std::vector<Interval> subIntervals;
            subIntervals.reserve(len / 2);

            Interval i(m_cardinal, m_fixed, m_min, m_min);

            int start = 0;
            do {
                while (start < len && !g.at(clipped.at(start))) start++;

                if (start >= len) break;

                int end = start;
                while (end + 1 < len && g.at(clipped.at(end + 1))) end++;

                subIntervals.push_back(clipped.subinterval(start, end));

                start = end + 1;
            } while (start < len);

            return subIntervals;
        }

        int length() const { return m_max - m_min + 1; }

        Axis axis() const { return ::rea_star::axis(m_cardinal); }

        Cardinal cardinal() const { return m_cardinal; };

        int fixed() const { return m_fixed; }
        int min() const { return m_min; }
        int max() const { return m_max; }

        void step() {
            m_fixed += ::rea_star::step(m_cardinal);
        }

        Interval parent() const {
            return Interval(
                m_cardinal,
                m_fixed - ::rea_star::step(m_cardinal),
                m_min,
                m_max
            );
        }

        class IntervalIterator {
        public:
            using iterator_category = std::input_iterator_tag;
            using value_type = Point;
            using difference_type = int;
            using pointer = Point*;
            using reference = Point&;

            IntervalIterator(const Interval* interval, int index):
                m_interval(interval), m_index(index) {};

            IntervalIterator(): IntervalIterator(nullptr, 0) {};
            IntervalIterator(const IntervalIterator&) = default;
            IntervalIterator(IntervalIterator&&) = default;

            IntervalIterator& operator++() {
                m_index++;
                return *this;
            }

            value_type operator*() const {
                return m_interval->at(m_index);
            }

            bool operator!=(const IntervalIterator& other) const {
                return m_interval != other.m_interval || m_index != other.m_index;
            }

            IntervalIterator operator+(int offset) const {
                return IntervalIterator(m_interval, m_index + offset);
            }

            friend IntervalIterator operator+(int offset, const IntervalIterator& it) {
                return Interval::IntervalIterator(it.m_interval, it.m_index + offset);
            }

        private:
            const Interval* m_interval;
            int m_index;
        };

        using iterator = IntervalIterator;
        using const_iterator = const iterator;

        iterator begin() const {
            return IntervalIterator(this, 0);
        }

        iterator end() const {
            return IntervalIterator(this, length());
        }

    private:
        Cardinal m_cardinal;

        union {
            struct {
                int m_x;
                int m_top;
                int m_bottom;
            };

            struct {
                int m_y;
                int m_left;
                int m_right;
            };

            struct {
                int m_fixed;
                int m_min;
                int m_max;
            };
        };
    };
};
