/**
 * API 재시도 유틸리티
 * 네트워크 불안정성 및 일시적 API 오류 대응
 */

import { fetchWithTimeout as baseFetchWithTimeout, isTimeoutError } from './timeout';

export interface RetryOptions {
  maxRetries?: number;        // 최대 재시도 횟수 (기본: 3)
  initialDelay?: number;      // 초기 지연 시간 ms (기본: 1000)
  maxDelay?: number;          // 최대 지연 시간 ms (기본: 10000)
  backoffMultiplier?: number; // 지연 증가 배율 (기본: 2)
  retryableStatuses?: number[]; // 재시도 가능한 HTTP 상태 코드
  timeout?: number;           // 타임아웃 시간 ms (기본: 30000)
}

type HttpErrorWithMeta = Error & {
  status?: number;
  url?: string;
  code?: string;
  details?: unknown;
  nonRetryable?: boolean;
  retryAfterSeconds?: number;
};

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  // 외부 공공 API는 순간적으로 불안정/지연이 잦아, 기본 재시도를 조금 넓게 잡습니다.
  maxRetries: 5,
  initialDelay: 1200,
  maxDelay: 15000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
  timeout: 45000, // 45초 타임아웃
};

/**
 * 지수 백오프(Exponential Backoff)로 지연 시간 계산
 */
function calculateDelay(
  attempt: number,
  options: Required<RetryOptions>,
  status?: number,
  retryAfterSeconds?: number
): number {
  // Retry-After 헤더(초)가 있으면 우선 적용
  if (typeof retryAfterSeconds === 'number' && Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, options.maxDelay);
  }

  // 기본 지수 백오프
  let delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);

  // 429(레이트리밋)은 너무 빠르게 재시도하면 계속 실패하므로 더 여유를 둡니다.
  if (status === 429) {
    delay *= 1.8;
  }

  // 약간의 지터를 넣어(±20%) 동시에 재시도하는 상황을 완화합니다.
  const jitter = 0.8 + Math.random() * 0.4;
  delay *= jitter;

  return Math.min(Math.round(delay), options.maxDelay);
}

/**
 * 재시도 가능한 에러인지 판단
 */
function isRetryableError(error: any, options: Required<RetryOptions>): boolean {
  // 명시적으로 재시도 금지 처리된 에러
  if (error?.nonRetryable) {
    return false;
  }

  // 타임아웃 에러 (재시도 가능)
  if (isTimeoutError(error)) {
    return true;
  }
  
  // 네트워크 에러
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // HTTP 상태 코드 확인
  if (error.status && options.retryableStatuses.includes(error.status)) {
    return true;
  }
  
  return false;
}

function makeHttpError(
  message: string,
  meta: Omit<HttpErrorWithMeta, keyof Error> = {}
): HttpErrorWithMeta {
  const err = new Error(message) as HttpErrorWithMeta;
  Object.assign(err, meta);
  return err;
}


/**
 * 재시도 로직이 포함된 fetch 래퍼
 * @param url 요청 URL
 * @param init fetch 옵션
 * @param options 재시도 옵션
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      console.log(`[Retry] 시도 ${attempt}/${opts.maxRetries + 1}: ${url}`);
      
      // 타임아웃이 적용된 fetch
      const response = await baseFetchWithTimeout(url, init, opts.timeout);
      
      // 재시도 가능한 상태 코드 확인
      if (!response.ok && opts.retryableStatuses.includes(response.status)) {
        // 응답 바디를 읽어 "설정 오류(키 누락)" 같은 비재시도 케이스를 구분
        // - body를 읽어도 원본 response는 그대로 반환할 수 있도록 clone 사용
        let details: any = undefined;
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;
        try {
          const cloned = response.clone();
          const contentType = cloned.headers.get('content-type') ?? '';
          if (contentType.includes('application/json')) {
            details = await cloned.json().catch(() => undefined);
          } else {
            const text = await cloned.text().catch(() => '');
            details = text ? { raw: text.substring(0, 500) } : undefined;
          }
        } catch {
          // ignore body read errors
        }

        const code = details?.code;
        const nonRetryable =
          code === 'KAT_ONLINE_KEY_MISSING' ||
          code === 'KAT_ONLINE_UNAUTHORIZED' ||
          (typeof details?.error === 'string' && details.error.includes('KAT_ONLINE_SERVICE_KEY'));

        throw makeHttpError(`HTTP ${response.status}`, {
          status: response.status,
          url,
          code,
          details,
          nonRetryable,
          // 백오프 계산에 활용할 수 있도록 힌트로 남김
          retryAfterSeconds,
        });
      }
      
      // 성공
      if (attempt > 1) {
        console.log(`✅ [Retry] ${attempt - 1}번 재시도 후 성공`);
      }
      
      return response;
      
    } catch (error) {
      lastError = error;

      // 재시도 가능한 에러인지 확인 (비재시도면 즉시 종료)
      if (!isRetryableError(error, opts)) {
        console.warn(`⚠️ [Retry] 재시도 불가능한 에러:`, error);
        throw error;
      }

      // 마지막 시도면 에러 throw
      if (attempt > opts.maxRetries) {
        const meta = {
          status: (error as any)?.status,
          code: (error as any)?.code,
          url,
        };
        console.error(
          `❌ [Retry] 최대 재시도 횟수 초과 (${opts.maxRetries}회):`,
          meta,
          error
        );
        throw error;
      }
      
      // 재시도 전 대기
      const delay = calculateDelay(
        attempt,
        opts,
        (error as any)?.status,
        (error as any)?.retryAfterSeconds
      );
      console.warn(`⚠️ [Retry] 실패, ${delay}ms 후 재시도... (${attempt}/${opts.maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * 재시도 로직이 포함된 비동기 함수 래퍼
 * @param fn 실행할 비동기 함수
 * @param options 재시도 옵션
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      const result = await fn();
      
      if (attempt > 1) {
        console.log(`✅ [Retry] ${attempt - 1}번 재시도 후 성공`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      
      // 재시도 불가능한 에러는 즉시 종료
      if (!isRetryableError(error, opts)) {
        console.warn(`⚠️ [Retry] 재시도 불가능한 에러:`, error);
        throw error;
      }

      // 마지막 시도면 에러 throw
      if (attempt > opts.maxRetries) {
        console.error(`❌ [Retry] 최대 재시도 횟수 초과 (${opts.maxRetries}회)`);
        throw error;
      }
      
      // 재시도 전 대기
      const delay = calculateDelay(
        attempt,
        opts,
        (error as any)?.status,
        (error as any)?.retryAfterSeconds
      );
      console.warn(`⚠️ [Retry] 실패, ${delay}ms 후 재시도... (${attempt}/${opts.maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * 재시도 설정 프리셋
 */
export const RETRY_PRESETS = {
  // 빠른 재시도 (공공 API용)
  fast: {
    // 공공 API 특성상 순간 오류가 잦아 재시도 폭을 조금 넓게 잡습니다.
    maxRetries: 4,
    initialDelay: 700,
    maxDelay: 5000,
    timeout: 15000, // 15초 타임아웃
  } as RetryOptions,
  
  // 일반 재시도 (기본)
  normal: {
    maxRetries: 5,
    initialDelay: 1200,
    maxDelay: 12000,
    timeout: 45000, // 45초 타임아웃
  } as RetryOptions,
  
  // 느린 재시도 (외부 API용)
  slow: {
    maxRetries: 6,
    initialDelay: 2000,
    maxDelay: 20000,
    timeout: 90000, // 90초 타임아웃
  } as RetryOptions,
  
  // 공격적 재시도 (중요한 작업)
  aggressive: {
    maxRetries: 8,
    initialDelay: 1000,
    maxDelay: 25000,
    timeout: 60000, // 60초 타임아웃
  } as RetryOptions,
};








