/**
 * Simple in-memory rate limiter
 * 
 * For MVP - per-sender rate limiting
 * Future: distributed rate limiting with Redis
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Map<key, entry>
const limits = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limits.entries()) {
    if (entry.resetAt < now) {
      limits.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export const DEFAULT_LIMITS: Record<number, RateLimitConfig> = {
  0: { windowMs: 60 * 60 * 1000, maxRequests: 10 },     // Unverified: 10/hour
  1: { windowMs: 60 * 60 * 1000, maxRequests: 100 },    // Parent-vouched: 100/hour
  2: { windowMs: 60 * 60 * 1000, maxRequests: 500 },    // Active: 500/hour
  3: { windowMs: 60 * 60 * 1000, maxRequests: 1000 },   // Established: 1000/hour
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number; // seconds until reset, if limited
}

/**
 * Check rate limit for a sender
 */
export function checkRateLimit(
  senderUuid: string,
  tier: number = 0
): RateLimitResult {
  const key = senderUuid;
  const now = Date.now();
  const config = DEFAULT_LIMITS[tier] || DEFAULT_LIMITS[0];
  
  const entry = limits.get(key);
  
  // New window
  if (!entry || entry.resetAt < now) {
    limits.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }
  
  // Over limit
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }
  
  // Increment
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get current usage for a sender
 */
export function getUsage(senderUuid: string): { count: number; resetAt: number } | null {
  const entry = limits.get(senderUuid);
  if (!entry || entry.resetAt < Date.now()) {
    return null;
  }
  return { count: entry.count, resetAt: entry.resetAt };
}
