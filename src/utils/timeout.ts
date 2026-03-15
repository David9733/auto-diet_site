/**
 * 타임아웃 유틸리티
 * AbortController를 사용한 fetch 타임아웃 관리
 */

/**
 * 타임아웃이 적용된 fetch 래퍼
 * @param url 요청 URL
 * @param init fetch 옵션
 * @param timeout 타임아웃 시간 (ms)
 */
export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn(`⏱️ [Timeout] ${url} - ${timeout}ms 초과`);
  }, timeout);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ [Timeout] ${url} - ${elapsed}ms 소요`);
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // AbortError를 TimeoutError로 변환
    if (error.name === 'AbortError') {
      const timeoutError: any = new Error(`Request timeout after ${timeout}ms`);
      timeoutError.name = 'TimeoutError';
      timeoutError.timeout = timeout;
      timeoutError.url = url;
      throw timeoutError;
    }
    
    throw error;
  }
}

/**
 * Promise에 타임아웃 적용
 * @param promise 대상 Promise
 * @param timeout 타임아웃 시간 (ms)
 * @param errorMessage 에러 메시지
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  errorMessage?: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const error: any = new Error(errorMessage || `Operation timeout after ${timeout}ms`);
      error.name = 'TimeoutError';
      error.timeout = timeout;
      reject(error);
    }, timeout);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * 타임아웃 프리셋
 */
export const TIMEOUT_PRESETS = {
  // 빠른 응답 (공공 API)
  fast: 10000,      // 10초
  
  // 일반 응답
  normal: 30000,    // 30초
  
  // 느린 응답 (대량 데이터)
  slow: 60000,      // 60초
  
  // 매우 느린 응답 (파일 업로드 등)
  verySlow: 120000, // 2분
};

/**
 * 타임아웃 에러 확인
 */
export function isTimeoutError(error: any): boolean {
  return error?.name === 'TimeoutError' || error?.name === 'AbortError';
}















