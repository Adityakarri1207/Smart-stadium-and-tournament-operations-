import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

const stadiumIdSchema = z.string().uuid('Invalid Stadium ID format');

const incidentCreateSchema = z.object({
  type: z.enum(['MEDICAL', 'SAFETY', 'SPILL', 'MAINTENANCE']),
  description: z.string().min(3, 'Description must be at least 3 characters').max(500, 'Description cannot exceed 500 characters'),
  zoneId: z.string().uuid('Invalid Zone ID format')
});

// Wrap async handlers
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET /api/hierarchy
// Returns the full Country -> City -> Stadium hierarchy
router.get('/hierarchy', asyncHandler(async (req: Request, res: Response) => {
  const hierarchy = await prisma.country.findMany({
    include: {
      cities: {
        include: {
          stadiums: true
        }
      }
    }
  });
  res.json({ success: true, data: hierarchy });
}));

// GET /api/stadium
// Returns stadium context (zones, facilities, events) filtered by stadiumId
router.get('/stadium', asyncHandler(async (req: Request, res: Response) => {
  const validation = stadiumIdSchema.safeParse(req.query.stadiumId);
  if (!validation.success) {
    return res.status(400).json({ success: false, message: validation.error.issues[0].message });
  }
  const stadiumId = validation.data;

  const zones = await prisma.zone.findMany({ 
    where: { stadiumId },
    include: { facilities: true } 
  });
  const events = await prisma.event.findMany({ 
    where: { stadiumId },
    orderBy: { time: 'asc' } 
  });
  
  res.json({
    success: true,
    data: { zones, events }
  });
}));

// GET /api/dashboard
// Consolidated dashboard aggregation endpoint
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const validation = stadiumIdSchema.safeParse(req.query.stadiumId);
  if (!validation.success) {
    return res.status(400).json({ success: false, message: validation.error.issues[0].message });
  }
  const stadiumId = validation.data;

  const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
  
  const zones = await prisma.zone.findMany({ 
    where: { stadiumId },
    include: { facilities: true } 
  });
  const events = await prisma.event.findMany({ 
    where: { stadiumId },
    orderBy: { time: 'asc' } 
  });

  // Fetch open incidents from database for this stadium
  const incidents = await prisma.incident.findMany({
    where: {
      zone: { stadiumId },
      status: 'OPEN'
    },
    include: {
      zone: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Calculate aggregate stats
  const maxCapacity = stadium?.capacity || 60000;
  const occupancyPercent = Math.floor(Math.random() * 40) + 50; // Random 50-90% for realism
  const totalSpectators = Math.floor((maxCapacity * occupancyPercent) / 100);
  
  // Active incidents are database incidents + severe/critical zones
  const activeIncidents = incidents.length + zones.filter(z => z.riskLevel === 'SEVERE' || z.density === 'CRITICAL').length;
  
  const openFacilities = zones.reduce((acc, zone) => acc + zone.facilities.filter(f => f.isOpen).length, 0);
  const avgWaitTime = Math.floor(zones.reduce((acc, zone) => acc + zone.waitingTime, 0) / (zones.length || 1));
  
  res.json({
    success: true,
    data: { 
      stadiumName: stadium?.name,
      zones, 
      events,
      incidents, // Return the actual database incidents list
      kpis: {
        totalSpectators,
        occupancyPercent,
        activeIncidents,
        openFacilities,
        avgWaitTime
      }
    }
  });
}));

// POST /api/incident
// Report a new incident (medical, spill, safety, maintenance) in a stadium zone
router.post('/incident', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const validation = incidentCreateSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }

  const { type, description, zoneId } = validation.data;

  // XSS Defense: Strip HTML tags to sanitize the description
  const sanitizedDescription = description.replace(/<[^>]*>/g, '').trim();

  // Create incident in database
  const incident = await prisma.incident.create({
    data: {
      type,
      description: sanitizedDescription,
      zoneId,
      status: 'OPEN'
    },
    include: {
      zone: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Incident reported and dispatched successfully',
    data: incident
  });
}));

// POST /api/incident/resolve
// Resolve an active incident, marking it as RESOLVED in the database
router.post('/incident/resolve', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const incidentResolveSchema = z.object({
    id: z.string().uuid('Invalid Incident ID format')
  });

  const validation = incidentResolveSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }

  const { id } = validation.data;

  const incident = await prisma.incident.update({
    where: { id },
    data: { status: 'RESOLVED' }
  });

  res.json({
    success: true,
    message: 'Incident marked as resolved',
    data: incident
  });
}));

export default router;
