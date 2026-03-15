/**
 * Rate Limiter 유틸리티
 * Token Bucket 알고리즘으로 API 호출 빈도 제한
 */

import { fetchWithTimeout } from './timeout';

export interface RateLimitConfig {
  maxTokens: number;        // 최대 토큰 수 (버킷 크기)
  refillRate: number;       // 토큰 재충전 속도 (초당)
  refillInterval?: number;  // 재충전 간격 ms (기본: 1000)
}

interface TokenBucket {
  tokens: number;           // 현재 토큰 수
  lastRefill: number;       // 마지막 재충전 시간
  config: RateLimitConfig;
}

/**
 * Rate Limiter 클래스
 */
export class RateLimiter {
  private buckets = new Map<string, TokenBucket>();
  
  /**
   * API 호출 가능 여부 확인 및 토큰 소비
   * @param key Rate Limit 키 (API 엔드포인트 등)
   * @param config Rate Limit 설정
   * @param cost 소비할 토큰 수 (기본: 1)
   * @returns 호출 가능 여부
   */
  async tryAcquire(
    key: string,
    config: RateLimitConfig,
    cost: number = 1
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const bucket = this.getOrCreateBucket(key, config);
    const now = Date.now();
    
    // 토큰 재충전
    this.refillTokens(bucket, now);
    
    // 토큰이 충분한지 확인
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return { allowed: true };
    }
    
    // 토큰 부족 - 다음 토큰까지 대기 시간 계산
    const tokensNeeded = cost - bucket.tokens;
    const refillInterval = config.refillInterval || 1000;
    const retryAfter = Math.ceil((tokensNeeded / config.refillRate) * refillInterval);
    
    console.warn(`⚠️ [Rate Limit] ${key} - 토큰 부족 (필요: ${cost}, 현재: ${bucket.tokens.toFixed(2)})`);
    console.warn(`⏳ [Rate Limit] ${retryAfter}ms 후 재시도 가능`);
    
    return { allowed: false, retryAfter };
  }
  
  /**
   * Rate Limit 대기 후 실행
   * @param key Rate Limit 키
   * @param config Rate Limit 설정
   * @param cost 소비할 토큰 수
   */
  async waitAndAcquire(
    key: string,
    config: RateLimitConfig,
    cost: number = 1
  ): Promise<void> {
    const result = await this.tryAcquire(key, config, cost);
    
    if (result.allowed) {
      return;
    }
    
    // Rate Limit 도달 - 대기
    if (result.retryAfter) {
      console.log(`⏳ [Rate Limit] ${result.retryAfter}ms 대기 중...`);
      await new Promise(resolve => setTimeout(resolve, result.retryAfter));
      
      // 재시도
      return this.waitAndAcquire(key, config, cost);
    }
  }
  
  /**
   * 버킷 가져오기 또는 생성
   */
  private getOrCreateBucket(key: string, config: RateLimitConfig): TokenBucket {
    let bucket = this.buckets.get(key);
    
    if (!bucket) {
      bucket = {
        tokens: config.maxTokens,
        lastRefill: Date.now(),
        config,
      };
      this.buckets.set(key, bucket);
    }
    
    return bucket;
  }
  
  /**
   * 토큰 재충전
   */
  private refillTokens(bucket: TokenBucket, now: number): void {
    const refillInterval = bucket.config.refillInterval || 1000;
    const elapsed = now - bucket.lastRefill;
    
    if (elapsed <= 0) return;
    
    // 경과 시간 동안 재충전할 토큰 수 계산
    const tokensToAdd = (elapsed / refillInterval) * bucket.config.refillRate;
    
    bucket.tokens = Math.min(
      bucket.config.maxTokens,
      bucket.tokens + tokensToAdd
    );
    bucket.lastRefill = now;
  }
  
  /**
   * 현재 토큰 수 조회 (디버깅용)
   */
  getTokens(key: string): number {
    const bucket = this.buckets.get(key);
    if (!bucket) return 0;
    
    // 현재 시점 기준으로 재충전 후 반환
    this.refillTokens(bucket, Date.now());
    return bucket.tokens;
  }
  
  /**
   * Rate Limiter 초기화 (디버깅용)
   */
  reset(key?: string): void {
    if (key) {
      this.buckets.delete(key);
      console.log(`✅ [Rate Limit] ${key} 초기화 완료`);
    } else {
      this.buckets.clear();
      console.log(`✅ [Rate Limit] 모든 Rate Limiter 초기화 완료`);
    }
  }
}

/**
 * 전역 Rate Limiter 인스턴스
 */
let globalRateLimiter: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter();
  }
  return globalRateLimiter;
}

/**
 * Rate Limit 프리셋
 */
export const RATE_LIMIT_PRESETS = {
  // 공공 API (FDA, katOnline) - 식단 생성 시 대량 호출 지원
  publicAPI: {
    maxTokens: 100,     // 최대 100개 토큰 (90개 메뉴 한번에 처리)
    refillRate: 20,     // 초당 20개 재충전 (빠른 연속 조회)
  } as RateLimitConfig,
  
  // 빠른 호출 (내부 API)
  fast: {
    maxTokens: 30,      // 최대 30개 토큰
    refillRate: 10,     // 초당 10개 재충전
  } as RateLimitConfig,
  
  // 느린 호출 (외부 AI API)
  slow: {
    maxTokens: 5,       // 최대 5개 토큰
    refillRate: 1,      // 초당 1개 재충전
  } as RateLimitConfig,
  
  // 매우 엄격한 제한 (값비싼 작업)
  strict: {
    maxTokens: 3,       // 최대 3개 토큰
    refillRate: 0.5,    // 2초당 1개 재충전
  } as RateLimitConfig,
};

/**
 * Rate Limit이 적용된 fetch 래퍼 (타임아웃 포함)
 */
export async function fetchWithRateLimitAndTimeout(
  url: string,
  rateLimitKey: string,
  rateLimitConfig: RateLimitConfig,
  init?: RequestInit,
  timeout: number = 30000
): Promise<Response> {
  const limiter = getRateLimiter();
  
  // Rate Limit 체크 및 대기
  await limiter.waitAndAcquire(rateLimitKey, rateLimitConfig);
  
  // 타임아웃이 적용된 fetch
  return fetchWithTimeout(url, init, timeout);
}

/**
 * Rate Limit이 적용된 비동기 함수 래퍼
 */
export async function withRateLimit<T>(
  fn: () => Promise<T>,
  rateLimitKey: string,
  rateLimitConfig: RateLimitConfig
): Promise<T> {
  const limiter = getRateLimiter();
  
  // Rate Limit 체크 및 대기
  await limiter.waitAndAcquire(rateLimitKey, rateLimitConfig);
  
  // 실제 함수 실행
  return fn();
}















