// In-memory rate limiting utility for Next.js API Routes (Sliding window)
const ipCache = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof global !== "undefined") {
  const globalAny = global as any;
  if (!globalAny.rateLimitCleanupInterval) {
    globalAny.rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, data] of ipCache.entries()) {
        if (now > data.resetTime) {
          ipCache.delete(ip);
        }
      }
    }, 5 * 60 * 1000);
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Basic rate limiting check for an IP address.
 * @param ip IP address of the client
 * @param limit Maximum number of requests allowed within windowMs
 * @param windowMs Time window in milliseconds
 */
export function rateLimit(ip: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const key = ip || "anonymous";
  const cached = ipCache.get(key);

  if (!cached || now > cached.resetTime) {
    const resetTime = now + windowMs;
    ipCache.set(key, { count: 1, resetTime });
    return { success: true, limit, remaining: limit - 1, resetTime };
  }

  if (cached.count >= limit) {
    return { success: false, limit, remaining: 0, resetTime: cached.resetTime };
  }

  cached.count += 1;
  return { success: true, limit, remaining: limit - cached.count, resetTime: cached.resetTime };
}

/**
 * Retrieves the client's IP address from Request headers.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  return "127.0.0.1";
}
