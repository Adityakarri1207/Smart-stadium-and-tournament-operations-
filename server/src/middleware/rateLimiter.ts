import { Request, Response, NextFunction } from 'express';

interface ClientRateLimit {
  tokens: number;
  lastRefill: number;
}

const ipCache = new Map<string, ClientRateLimit>();
const REFILL_INTERVAL_MS = 1000; // Refill 1 token per second
const MAX_TOKENS = 60; // Up to 60 burst requests

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const now = Date.now();
  
  if (!ipCache.has(ip)) {
    ipCache.set(ip, { tokens: MAX_TOKENS, lastRefill: now });
  }

  const clientData = ipCache.get(ip)!;
  const timePassedMs = now - clientData.lastRefill;
  const refillTokens = Math.floor(timePassedMs / REFILL_INTERVAL_MS);
  
  if (refillTokens > 0) {
    clientData.tokens = Math.min(MAX_TOKENS, clientData.tokens + refillTokens);
    clientData.lastRefill = now;
  }

  if (clientData.tokens <= 0) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }

  clientData.tokens--;
  next();
};
