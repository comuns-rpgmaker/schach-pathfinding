#include "rea_star.hpp"

#include <algorithm>
#include <queue>
#include <cmath>

#include "../data/grid.hpp"
#include "../data/interval.hpp"
#include "../data/rect.hpp"

namespace rea_star {
    enum class NodeType {
        GPOINT,
        HPOINT
    };

    struct Node {
        NodeType type;
        double gvalue;
        double hvalue;
    };

    struct SearchNode {
        Interval interval;
        Point min_point;
        double minfval;

        bool operator>(const SearchNode& other) const {
            return minfval > other.minfval;
        }
    };

    constexpr double SQRT2 = 1.414;

    [[gnu::hot, gnu::const]]
    double octile(const Point& a, const Point& b) {
        double dx = std::abs(a.x - b.x),
               dy = std::abs(a.y - b.y);

        return SQRT2 * std::min(dx, dy) + std::abs(dx - dy);
    }

    class REAStarSolver {
        public:
            REAStarSolver(
                const Point& source,
                const Point& target,
                const Grid<bool>& g
            ): m_source(source),
                m_target(target),
                m_g(g),
                m_nodes(
                    g.width(),
                    g.height(),
                    Node {
                        .type = NodeType::GPOINT,
                        .gvalue = INFINITY
                    }
                ),
                m_parents(g.width(), g.height()) {}

            std::optional<path_t> find_path() {
                auto path = insert_start();
                if (path.has_value()) return path;

                while (!m_open.empty()) {
                    SearchNode next = m_open.top();
                    m_open.pop();

                    path = expand(next);
                    if (path.has_value()) return path;
                }

                return std::nullopt;
            }
            
        private:
            Point m_source;
            Point m_target;
            Grid<bool> m_g;
            Grid<Node> m_nodes;
            Grid<Point> m_parents;
            std::priority_queue<
                SearchNode,
                std::vector<SearchNode>,
                std::greater<SearchNode>
            > m_open;
            
            std::optional<path_t> insert_start() {
                auto rect = Rect::expand_point(m_source, m_g);
                if (rect.contains(m_target)) {
                    return path_t { m_source, m_target };
                }

                for (const Point& p : rect.boundaries()) {
                    m_parents.set(p, m_source);
                    m_nodes.set(p, Node {
                        .type = NodeType::GPOINT,
                        .gvalue = octile(p, m_source)
                    });
                }

                for (Cardinal cardinal : CARDINALS) {
                    auto interval = rect.extend_neighbor_interval(cardinal);
                    if (!interval.is_valid(m_g)) continue;

                    auto path = successor(interval);
                    if (path.has_value()) return path;
                }

                return std::nullopt;
            }

            std::optional<path_t> successor(const Interval& interval) {
                for (const auto& fsi : interval.free_subintervals(m_g)) {
                    auto parent = fsi.parent();
                    bool updated = false;

                    for (int i = 0; i < fsi.length(); i++) {
                        Point p = fsi.at(i);
                        double gvalue = m_nodes.at(p).gvalue;

                        for (int j = i - 1; j <= i + 1; j++) {
                            if (j < 0 || j >= fsi.length()) continue;

                            Point pp = parent.at(j);
                            double d = octile(p, pp);
                            double pgvalue = m_nodes.at(pp).gvalue + d;

                            if (pgvalue < gvalue) {
                                gvalue = pgvalue;
                                m_parents.set(p, pp);
                                m_nodes.set(p, Node {
                                    .type = NodeType::HPOINT,
                                    .gvalue = gvalue,
                                    .hvalue = octile(p, m_target)
                                });
                                updated = true;
                            }
                        }
                    }

                    if (fsi.contains(m_target)) return build_path();

                    if (updated) m_open.push(make_search_node(fsi));
                }

                return std::nullopt;
            }

            std::optional<path_t> expand(const SearchNode& node) {
                auto interval = node.interval;
                if (interval.contains(m_target)) return build_path();

                auto rect = Rect::expand_interval(interval, m_g);
                if (rect.contains(m_target)) {
                    m_parents.set(m_target, node.min_point);
                    return build_path();
                }

                for (const Interval& wall : rect.walls(interval.cardinal())) {
                    for (const Point& p : wall) {
                        for (const Point& pp : interval) {
                            double d = octile(p, pp);
                            double pgvalue = m_nodes.at(pp).gvalue + d;

                            Node pnode = m_nodes.at(p);

                            if (pgvalue < pnode.gvalue) {
                                m_parents.set(p, pp);

                                double hvalue;
                                if (pnode.type == NodeType::HPOINT) {
                                    m_nodes.set(p, {
                                        .type = NodeType::HPOINT,
                                        .gvalue = pgvalue,
                                        .hvalue = pnode.hvalue
                                    });
                                } else {
                                    m_nodes.set(p, {
                                        .type = NodeType::GPOINT,
                                        .gvalue = pgvalue
                                    });
                                }
                            }
                        }
                    }

                    auto eni = rect.extend_neighbor_interval(wall.cardinal());
                    auto path = successor(eni);
                    if (path.has_value()) return path;
                }

                return std::nullopt;
            }

            path_t build_path() const {
                path_t path;
                path.reserve(m_g.width() * m_g.height() / 2);
                
                Point current = m_target;
                do { 
                    path.push_back(current);
                    current = m_parents.at(current);
                } while (current != m_source);

                path.push_back(m_source);

                std::reverse(path.begin(), path.end());
                return path;
            }

            SearchNode make_search_node(const Interval& interval) const {
                Point min_point;
                double minfval = INFINITY;

                for (const auto& p : interval) {
                    auto node = m_nodes.at(p);
                    double fvalue = node.gvalue + node.hvalue;
                    if (fvalue < minfval) {
                        minfval = fvalue;
                        min_point = p;
                    }
                }

                return SearchNode {
                    .interval = interval,
                    .min_point = min_point,
                    .minfval = minfval
                };
            }
    };
};

std::optional<rea_star::path_t> rea_star::rectangle_expansion_astar(
    Point source,
    Point target,
    Grid<bool> g
) {
    return rea_star::REAStarSolver(source, target, g).find_path();
}