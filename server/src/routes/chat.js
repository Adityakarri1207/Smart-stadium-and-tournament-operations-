"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gemini_1 = require("../services/gemini");
const router = (0, express_1.Router)();
// Wrap async handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// POST /api/chat
router.post('/', asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Message is required' });
    }
    const responseText = await (0, gemini_1.generateStadiumResponse)(message);
    res.json({
        success: true,
        data: {
            reply: responseText,
        }
    });
}));
exports.default = router;
//# sourceMappingURL=chat.js.map