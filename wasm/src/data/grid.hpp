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
    union Point {
        struct {
            int x;
            int y;
        };

        int coords[2];
    };

    template <typename T>
    class Grid {
        public:
            Grid(int width, int height) {}

            Grid(int width, int height, T defaultValue):
                m_width(width),
                m_height(height),
                m_data(width * height, defaultValue) {}

            __attribute__((hot))
            T at(const Point& p) {
                assert(p.x < m_width);
                assert(p.y < m_height);

                return m_data[p.y * m_width + p.x];
            };

            void set(const Point& p, const T& value) {
                assert(p.x < m_width);
                assert(p.y < m_height);

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
