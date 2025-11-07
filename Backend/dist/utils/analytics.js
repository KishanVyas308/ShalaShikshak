"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIP = getClientIP;
exports.getUserAgent = getUserAgent;
exports.isRateLimited = isRateLimited;
exports.cleanupRateLimitMap = cleanupRateLimitMap;
exports.isValidPagePath = isValidPagePath;
exports.normalizePagePath = normalizePagePath;
/**
 * Extract client IP address from request
 */
function getClientIP(req) {
    var _a, _b, _c, _d;
    return (req.ip ||
        ((_a = req.connection) === null || _a === void 0 ? void 0 : _a.remoteAddress) ||
        ((_b = req.socket) === null || _b === void 0 ? void 0 : _b.remoteAddress) ||
        ((_d = (_c = req.headers['x-forwarded-for']) === null || _c === void 0 ? void 0 : _c.split(',')[0]) === null || _d === void 0 ? void 0 : _d.trim()) ||
        req.headers['x-real-ip'] ||
        req.headers['cf-connecting-ip'] || // Cloudflare
        req.headers['x-client-ip'] ||
        null);
}
/**
 * Get user agent from request
 */
function getUserAgent(req) {
    return req.headers['user-agent'] || null;
}
/**
 * Rate limiting helper - check if IP has made too many requests recently
 */
function isRateLimited(ipCounts, ip, maxRequests = 100, windowMs = 60000 // 1 minute
) {
    const now = new Date();
    const ipData = ipCounts.get(ip);
    if (!ipData) {
        ipCounts.set(ip, { count: 1, firstRequest: now });
        return false;
    }
    // Reset if window has passed
    if (now.getTime() - ipData.firstRequest.getTime() > windowMs) {
        ipCounts.set(ip, { count: 1, firstRequest: now });
        return false;
    }
    // Increment count
    ipData.count++;
    return ipData.count > maxRequests;
}
/**
 * Clean up old rate limit entries
 */
function cleanupRateLimitMap(ipCounts, windowMs = 60000) {
    const now = new Date();
    for (const [ip, data] of ipCounts.entries()) {
        if (now.getTime() - data.firstRequest.getTime() > windowMs) {
            ipCounts.delete(ip);
        }
    }
}
/**
 * Check if a page path is valid/allowed for tracking
 */
function isValidPagePath(page) {
    // Basic validation
    if (!page || typeof page !== 'string' || page.length > 500) {
        return false;
    }
    // Must start with /
    if (!page.startsWith('/')) {
        return false;
    }
    // Block certain paths that we don't want to track
    const blockedPaths = [
        '/api/',
        '/uploads/',
        '/favicon.ico',
        '/robots.txt',
        '/sitemap.xml',
        '/.well-known/',
    ];
    return !blockedPaths.some(blocked => page.startsWith(blocked));
}
/**
 * Normalize page path for consistent tracking
 */
function normalizePagePath(page) {
    // Remove trailing slashes except for root
    if (page.length > 1 && page.endsWith('/')) {
        page = page.slice(0, -1);
    }
    // Remove query parameters and fragments for cleaner analytics
    const urlParts = page.split('?')[0].split('#')[0];
    return urlParts;
}
