"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const router = (0, express_1.Router)();
// Wrap async handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// GET /api/stadium
// Returns stadium context (zones, facilities, events)
router.get('/stadium', asyncHandler(async (req, res) => {
    const zones = await prisma_1.prisma.zone.findMany({ include: { facilities: true } });
    const events = await prisma_1.prisma.event.findMany({ orderBy: { time: 'asc' } });
    res.json({
        success: true,
        data: { zones, events }
    });
}));
exports.default = router;
//# sourceMappingURL=api.js.map