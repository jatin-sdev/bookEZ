import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number;      // Max requests per window
  keyPrefix: string;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use IP or User ID (if authenticated) as the key
      const key = `${config.keyPrefix}:${req.ip}`;
      
      // Atomic increment and expiry
      const requests = await redis.incr(key);
      
      if (requests === 1) {
        await redis.expire(key, config.windowMs / 1000);
      }

      if (requests > config.max) {
        const ttl = await redis.ttl(key);
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: ttl
        });
        return; 
      }

      next();
    } catch (error: any) {
      logger.error('Rate Limiter Error:', { message: error.message });
      // Fail open: allow request if Redis is down, but log it
      next();
    }
  };
};

// specialized limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // strict limit for login/register
  keyPrefix: 'rl:auth'
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyPrefix: 'rl:api'
});
