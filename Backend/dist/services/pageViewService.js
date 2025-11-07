"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageViewService = void 0;
const prisma_1 = require("../lib/prisma");
class PageViewService {
    /**
     * Record a page view
     */
    static recordPageView(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.pageView.create({
                data: {
                    page: data.page,
                    userId: data.userId,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        });
    }
    /**
     * Get page view analytics
     */
    static getAnalytics(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, startDate, endDate, groupBy } = query;
            // Build where clause
            const whereClause = {};
            if (page) {
                whereClause.page = page;
            }
            if (startDate || endDate) {
                whereClause.createdAt = {};
                if (startDate) {
                    whereClause.createdAt.gte = startDate;
                }
                if (endDate) {
                    whereClause.createdAt.lte = endDate;
                }
            }
            // Get total views
            const totalViews = yield prisma_1.prisma.pageView.count({
                where: whereClause,
            });
            // Get unique views (by IP address)
            const uniqueViewsResult = yield prisma_1.prisma.pageView.groupBy({
                by: ['ipAddress'],
                where: whereClause,
                _count: {
                    id: true,
                },
            });
            const uniqueViews = uniqueViewsResult.length;
            // Get top pages
            const topPagesData = yield prisma_1.prisma.pageView.groupBy({
                by: ['page'],
                where: whereClause,
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
                take: 10,
            });
            // Get unique views for each top page
            const topPages = yield Promise.all(topPagesData.map((pageData) => __awaiter(this, void 0, void 0, function* () {
                const uniquePageViews = yield prisma_1.prisma.pageView.groupBy({
                    by: ['ipAddress'],
                    where: Object.assign(Object.assign({}, whereClause), { page: pageData.page }),
                    _count: {
                        id: true,
                    },
                });
                return {
                    page: pageData.page,
                    views: pageData._count.id,
                    uniqueViews: uniquePageViews.length,
                };
            })));
            // Get views by date
            let viewsByDate = [];
            if (groupBy === 'day' || groupBy === 'hour') {
                // Simplified approach: fetch recent views and group in JavaScript
                const recentViews = yield prisma_1.prisma.pageView.findMany({
                    where: whereClause,
                    select: {
                        createdAt: true,
                        ipAddress: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10000, // Limit for performance
                });
                // Group by date in JavaScript
                const grouped = recentViews.reduce((acc, view) => {
                    const dateKey = groupBy === 'day'
                        ? view.createdAt.toISOString().split('T')[0]
                        : view.createdAt.toISOString().substring(0, 13) + ':00:00';
                    if (!acc[dateKey]) {
                        acc[dateKey] = {
                            views: 0,
                            uniqueIPs: new Set(),
                        };
                    }
                    acc[dateKey].views += 1;
                    if (view.ipAddress) {
                        acc[dateKey].uniqueIPs.add(view.ipAddress);
                    }
                    return acc;
                }, {});
                viewsByDate = Object.entries(grouped)
                    .map(([date, data]) => ({
                    date,
                    views: data.views,
                    uniqueViews: data.uniqueIPs.size,
                }))
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 30);
            }
            return {
                totalViews,
                uniqueViews,
                topPages,
                viewsByDate,
            };
        });
    }
    /**
     * Get page views with pagination
     */
    static getPageViews(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, startDate, endDate, limit = 50, offset = 0 } = query;
            // Build where clause
            const whereClause = {};
            if (page) {
                whereClause.page = page;
            }
            if (startDate || endDate) {
                whereClause.createdAt = {};
                if (startDate) {
                    whereClause.createdAt.gte = startDate;
                }
                if (endDate) {
                    whereClause.createdAt.lte = endDate;
                }
            }
            const [pageViews, total] = yield Promise.all([
                prisma_1.prisma.pageView.findMany({
                    where: whereClause,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: offset,
                    take: limit,
                }),
                prisma_1.prisma.pageView.count({
                    where: whereClause,
                }),
            ]);
            return {
                pageViews,
                total,
                hasMore: offset + limit < total,
            };
        });
    }
    /**
     * Get popular pages
     */
    static getPopularPages() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, timeRange) {
            const whereClause = {};
            if (timeRange) {
                whereClause.createdAt = {
                    gte: timeRange.startDate,
                    lte: timeRange.endDate,
                };
            }
            const popularPages = yield prisma_1.prisma.pageView.groupBy({
                by: ['page'],
                where: whereClause,
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
                take: limit,
            });
            return popularPages.map(page => ({
                page: page.page,
                views: page._count.id,
            }));
        });
    }
    /**
     * Delete old page views (for data cleanup)
     */
    static deleteOldPageViews(olderThanDays) {
        return __awaiter(this, void 0, void 0, function* () {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            const result = yield prisma_1.prisma.pageView.deleteMany({
                where: {
                    createdAt: {
                        lt: cutoffDate,
                    },
                },
            });
            return result.count;
        });
    }
}
exports.PageViewService = PageViewService;
