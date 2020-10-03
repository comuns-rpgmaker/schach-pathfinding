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

        Point at(int index) const;
        Interval subinterval(int start, int end) const;
        bool contains(const Point& p) const;

        [[gnu::hot]]
        bool is_free(Grid<bool>& g) const;

        [[gnu::hot]]
        bool is_valid(const Grid<bool>& g) const;

        template <typename T>
        Interval clip(const Grid<T>& g) const;

        std::vector<Interval> free_subintervals(Grid<bool>& g) const;

        Interval parent() const;

        [[gnu::always_inline]]
        int length() const { return m_max - m_min + 1; }

        Axis axis() const { return ::rea_star::axis(m_cardinal); }

        Cardinal cardinal() const { return m_cardinal; };

        int fixed() const { return m_fixed; }
        int min() const { return m_min; }
        int max() const { return m_max; }

        [[gnu::hot]]
        void step() { m_fixed += ::rea_star::step(m_cardinal); }

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

        int m_fixed;
        int m_min;
        int m_max;
    };
};
