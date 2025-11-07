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
const auth_1 = require("../middleware/auth");
const analyticsService_1 = require("../services/analyticsService");
const router = express_1.default.Router();
/**
 * Track app open (no auth required)
 * POST /api/analytics/app-open
 */
router.post('/app-open', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { platform } = req.body;
        yield analyticsService_1.AnalyticsService.trackAppOpen(platform || 'unknown');
        res.json({ success: true });
    }
    catch (error) {
        console.error('Track app open error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
/**
 * Get simple analytics (admin only) - just total opens count
 * GET /api/analytics/stats
 */
router.get('/stats', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield analyticsService_1.AnalyticsService.getSimpleStats();
        res.json(stats);
    }
    catch (error) {
        console.error('Get analytics stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
