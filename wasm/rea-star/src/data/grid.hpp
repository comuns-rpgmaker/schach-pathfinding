/**
 * @file grid.hpp
 * 
 * @author Brandt
 * @date 2020/09/27
 * @license Zlib
 * 
 * Grid map data type.
 */

#pragma once

#include <emscripten/bind.h>

#include <cassert>
#include <vector>

namespace rea_star {
    struct Point {
        int x;
        int y;
    };

    static bool operator==(const Point& a, const Point& b) {
        return a.x == b.x && a.y == b.y;
    }

    static bool operator!=(const Point& a, const Point& b) {
        return a.x != b.x || a.y != b.y;
    }

    template <typename T>
    class Grid {
        public:
            Grid() = default;
            Grid(const Grid&) = default;
            Grid(Grid&&) = default;

            Grid(int width, int height, const std::vector<T>& data):
                m_width(width),
                m_height(height),
                m_data(data) {};

            Grid(int width, int height, std::vector<T>&& data):
                m_width(width),
                m_height(height),
                m_data(data) {};

            Grid(int width, int height, T defaultValue):
                m_width(width),
                m_height(height),
                m_data(width * height, defaultValue) {}

            [[gnu::hot]]
            T operator[](const Point& p) const {
                assert(p.x >= 0);
                assert(p.y >= 0);
                assert(p.x < m_width);
                assert(p.y < m_height);

                return m_data[p.y * m_width + p.x];
            }

            [[gnu::hot]]
            T& operator[](const Point& p) {
                assert(p.x >= 0);
                assert(p.y >= 0);
                assert(p.x < m_width);
                assert(p.y < m_height);

                return m_data[p.y * m_width + p.x];
            }

            int width() const { return m_width; }
            int height() const { return m_height; }

        private:
            int m_width;
            int m_height;
            std::vector<T> m_data;
    };

    template <>
    class Grid<bool> {
        public:
            Grid(const Grid&) = default;
            Grid(Grid&&) = default;

            Grid(emscripten::val map):
                m_width(map["width"].as<int>()),
                m_height(map["height"].as<int>()),
                m_delegate(map["color"].call<emscripten::val>("bind", map)),
                m_mask(m_width * m_height, false),
                m_cache(m_width * m_height) {};

            [[gnu::hot, gnu::pure]]
            bool operator[](const Point& p) {
                assert(p.x >= 0);
                assert(p.y >= 0);
                assert(p.x < m_width);
                assert(p.y < m_height);

                int i = p.x + p.y * m_width;
                if (m_mask[i]) return m_cache[i];

                bool v = m_delegate(p).isTrue();
                m_mask[i] = true;
                m_cache[i] = v;
                return v;
            }

            int width() const { return m_width; }
            int height() const { return m_height; }

        private:
            int m_width;
            int m_height;
            emscripten::val m_delegate;
            std::vector<bool> m_mask;
            std::vector<bool> m_cache;
    };
};
