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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Rate limiting map for page view recording
const rateLimitMap = new Map();
// Clean up rate limit map every 5 minutes
setInterval(() => {
    const now = new Date();
    for (const [ip, data] of rateLimitMap.entries()) {
        if (now.getTime() - data.firstRequest.getTime() > 300000) { // 5 minutes
            rateLimitMap.delete(ip);
        }
    }
}, 5 * 60 * 1000);
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
        req.headers['cf-connecting-ip'] ||
        null);
}
/**
 * Simple rate limiting
 */
function isRateLimited(ip, maxRequests = 30, windowMs = 60000) {
    if (!ip)
        return false;
    const now = new Date();
    const ipData = rateLimitMap.get(ip);
    if (!ipData) {
        rateLimitMap.set(ip, { count: 1, firstRequest: now });
        return false;
    }
    // Reset if window has passed
    if (now.getTime() - ipData.firstRequest.getTime() > windowMs) {
        rateLimitMap.set(ip, { count: 1, firstRequest: now });
        return false;
    }
    // Increment count
    ipData.count++;
    return ipData.count > maxRequests;
}
/**
 * Validate page path
 */
function isValidPagePath(page) {
    if (!page || typeof page !== 'string' || page.length > 500) {
        return false;
    }
    if (!page.startsWith('/')) {
        return false;
    }
    // Block certain paths
    const blockedPaths = ['/api/', '/uploads/', '/favicon.ico', '/robots.txt', '/admin', '/login'];
    return !blockedPaths.some(blocked => page === blocked || page.startsWith(blocked + '/') || page.startsWith(blocked + '?'));
}
/**
 * DEPRECATED: This endpoint is no longer used.
 * We now only track app/website opens via POST /api/analytics/app-open
 * This is kept for backward compatibility only.
 *
 * POST /api/page-views
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // No-op - return success for backward compatibility
    res.status(200).json({
        success: true,
        message: 'Page view tracking deprecated. Use /api/analytics/app-open instead.',
    });
}));
exports.default = router;
