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

#include <vector>

namespace rea_star {
    struct point {
        int x;
        int y;
    };

    template <typename T>
    class grid {
        public:
            grid(int width, int height) {}

            grid(int width, int height, T defaultValue):
                m_width(width),
                m_height(height),
                m_data(width * height, defaultValue) {}

            __attribute__((hot))
            T operator[](const point& p) const {
                return m_data[p.y * m_width + p.x];
            }

            T at(const point& p) __attribute__((alias("operator[]")));

            void set(const point& p, const T& value) {
                m_data[p.y * m_width + p.x] = value;
            }

            int width() const { return m_width; }
            int height() const { return m_height; }

        private:
            int m_width;
            int m_height;
            std::vector<T> m_data;
    };
};
