/**
 * 서버사이드 Rate Limiter
 * IP 기반 Rate Limiting (Next.js API Routes용)
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  maxTokens: number;
  refillRate: number;
  refillInterval?: number;
}

/**
 * 서버사이드 Rate Limiter (메모리 기반)
 */
class ServerRateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // 5분마다 오래된 항목 정리
    if (typeof process !== 'undefined' && !this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }
  
  /**
   * Rate Limit 체크
   */
  check(
    identifier: string,
    config: RateLimitConfig
  ): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    let entry = this.limits.get(identifier);
    
    if (!entry) {
      entry = {
        tokens: config.maxTokens - 1,
        lastRefill: now,
      };
      this.limits.set(identifier, entry);
      return { allowed: true };
    }
    
    // 토큰 재충전
    this.refillTokens(entry, config, now);
    
    // 토큰 확인
    if (entry.tokens >= 1) {
      entry.tokens -= 1;
      return { allowed: true };
    }
    
    // Rate Limit 초과
    const refillInterval = config.refillInterval || 1000;
    const tokensNeeded = 1 - entry.tokens;
    const retryAfter = Math.ceil((tokensNeeded / config.refillRate) * refillInterval);
    
    return { allowed: false, retryAfter };
  }
  
  /**
   * 토큰 재충전
   */
  private refillTokens(
    entry: RateLimitEntry,
    config: RateLimitConfig,
    now: number
  ): void {
    const refillInterval = config.refillInterval || 1000;
    const elapsed = now - entry.lastRefill;
    
    if (elapsed <= 0) return;
    
    const tokensToAdd = (elapsed / refillInterval) * config.refillRate;
    entry.tokens = Math.min(config.maxTokens, entry.tokens + tokensToAdd);
    entry.lastRefill = now;
  }
  
  /**
   * 오래된 항목 정리 (10분 이상 사용 안 한 항목)
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10분
    
    for (const [key, entry] of this.limits.entries()) {
      if (now - entry.lastRefill > maxAge) {
        this.limits.delete(key);
      }
    }
  }
  
  /**
   * 초기화
   */
  reset(): void {
    this.limits.clear();
  }
}

/**
 * 전역 서버 Rate Limiter 인스턴스
 */
let serverRateLimiter: ServerRateLimiter | null = null;

function getServerRateLimiter(): ServerRateLimiter {
  if (!serverRateLimiter) {
    serverRateLimiter = new ServerRateLimiter();
  }
  return serverRateLimiter;
}

/**
 * 서버사이드 Rate Limit 프리셋
 */
export const SERVER_RATE_LIMIT_PRESETS = {
  // 엄격한 제한 (API 프록시용)
  strict: {
    maxTokens: 20,      // 최대 20개 요청
    refillRate: 5,      // 초당 5개 재충전
  } as RateLimitConfig,
  
  // 일반 제한
  normal: {
    maxTokens: 50,      // 최대 50개 요청
    refillRate: 10,     // 초당 10개 재충전
  } as RateLimitConfig,
  
  // 느슨한 제한
  loose: {
    maxTokens: 100,     // 최대 100개 요청
    refillRate: 20,     // 초당 20개 재충전
  } as RateLimitConfig,
};

/**
 * Next.js Request에서 클라이언트 식별자 추출
 */
export function getClientIdentifier(request: Request): string {
  // 1. X-Forwarded-For 헤더 (프록시 환경)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0].trim();
  }
  
  // 2. X-Real-IP 헤더
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // 3. Connection Remote Address (fallback)
  // Next.js에서는 직접 접근 불가, 기본값 사용
  return 'unknown';
}

/**
 * Rate Limit 체크 및 응답 생성 헬퍼
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; response?: Response } {
  const limiter = getServerRateLimiter();
  const result = limiter.check(identifier, config);
  
  if (!result.allowed) {
    console.warn(`⚠️ [Server Rate Limit] ${identifier} - 제한 초과`);
    
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.retryAfter || 1000) / 1000).toString(),
          },
        }
      ),
    };
  }
  
  return { allowed: true };
}















