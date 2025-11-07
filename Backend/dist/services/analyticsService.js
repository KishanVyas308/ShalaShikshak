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
exports.AnalyticsService = void 0;
const prisma_1 = require("../lib/prisma");
class AnalyticsService {
    /**
     * Track app/website open
     */
    static trackAppOpen(platform) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.prisma.pageView.create({
                    data: {
                        page: '/app-open',
                        platform: platform === 'app' ? 'app' : 'web',
                        userAgent: `${platform} open`,
                    },
                });
            }
            catch (error) {
                console.error('Error tracking app open:', error);
            }
        });
    }
    /**
     * Get simple stats - just count of opens
     */
    static getSimpleStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalOpens, appOpens, webOpens, last24Hours, last7Days, last30Days] = yield Promise.all([
                // Total opens
                prisma_1.prisma.pageView.count({
                    where: {
                        page: '/app-open',
                    },
                }),
                // App opens
                prisma_1.prisma.pageView.count({
                    where: {
                        page: '/app-open',
                        platform: 'app',
                    },
                }),
                // Web opens
                prisma_1.prisma.pageView.count({
                    where: {
                        page: '/app-open',
                        platform: 'web',
                    },
                }),
                // Last 24 hours
                prisma_1.prisma.pageView.count({
                    where: {
                        page: '/app-open',
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                // Last 7 days
                prisma_1.prisma.pageView.count({
                    where: {
                        page: '/app-open',
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                // Last 30 days
                prisma_1.prisma.pageView.count({
                    where: {
                        page: '/app-open',
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
            ]);
            return {
                totalOpens,
                appOpens,
                webOpens,
                last24Hours,
                last7Days,
                last30Days,
            };
        });
    }
}
exports.AnalyticsService = AnalyticsService;
