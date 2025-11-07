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
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get active WhatsApp link (public route)
router.get('/active', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeLink = yield prisma.whatsAppLink.findFirst({
            where: {
                isActive: true
            }
        });
        res.json({
            success: true,
            data: activeLink
        });
    }
    catch (error) {
        console.error('Error fetching active WhatsApp link:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active WhatsApp link'
        });
    }
}));
// Get all WhatsApp links (admin only)
router.get('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const links = yield prisma.whatsAppLink.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            success: true,
            data: links
        });
    }
    catch (error) {
        console.error('Error fetching WhatsApp links:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch WhatsApp links'
        });
    }
}));
// Create new WhatsApp link (admin only)
router.post('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({
                success: false,
                message: 'Name and URL are required'
            });
        }
        // Validate WhatsApp URL format
        const whatsappUrlPattern = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
        if (!whatsappUrlPattern.test(url)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid WhatsApp group invite URL format'
            });
        }
        const newLink = yield prisma.whatsAppLink.create({
            data: {
                name,
                description,
                url,
                isActive: false
            }
        });
        res.status(201).json({
            success: true,
            data: newLink,
            message: 'WhatsApp link created successfully'
        });
    }
    catch (error) {
        console.error('Error creating WhatsApp link:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WhatsApp link'
        });
    }
}));
// Update WhatsApp link (admin only)
router.put('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({
                success: false,
                message: 'Name and URL are required'
            });
        }
        // Validate WhatsApp URL format
        const whatsappUrlPattern = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
        if (!whatsappUrlPattern.test(url)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid WhatsApp group invite URL format'
            });
        }
        const updatedLink = yield prisma.whatsAppLink.update({
            where: { id },
            data: {
                name,
                description,
                url
            }
        });
        res.json({
            success: true,
            data: updatedLink,
            message: 'WhatsApp link updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating WhatsApp link:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update WhatsApp link'
        });
    }
}));
// Set active WhatsApp link (admin only)
router.patch('/:id/activate', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // First, deactivate all links
        yield prisma.whatsAppLink.updateMany({
            data: {
                isActive: false
            }
        });
        // Then activate the selected link
        const activatedLink = yield prisma.whatsAppLink.update({
            where: { id },
            data: {
                isActive: true
            }
        });
        res.json({
            success: true,
            data: activatedLink,
            message: 'WhatsApp link activated successfully'
        });
    }
    catch (error) {
        console.error('Error activating WhatsApp link:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate WhatsApp link'
        });
    }
}));
// Deactivate all WhatsApp links (admin only)
router.patch('/deactivate-all', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.whatsAppLink.updateMany({
            data: {
                isActive: false
            }
        });
        res.json({
            success: true,
            message: 'All WhatsApp links deactivated successfully'
        });
    }
    catch (error) {
        console.error('Error deactivating WhatsApp links:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate WhatsApp links'
        });
    }
}));
// Delete WhatsApp link (admin only)
router.delete('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.whatsAppLink.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'WhatsApp link deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting WhatsApp link:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete WhatsApp link'
        });
    }
}));
exports.default = router;
