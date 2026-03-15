/**
 * TossPayments 서버 호출 유틸
 *
 * - 시크릿 키는 서버 환경변수(TOSS_SECRET_KEY)로만 사용합니다.
 * - 토스 API는 Basic 인증을 사용합니다: `Basic base64("{SECRET_KEY}:")`
 */

type TossErrorResponse = {
  code?: string;
  message?: string;
};

function getSecretKey(): string {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) {
    throw new Error('환경변수 TOSS_SECRET_KEY 이(가) 설정되지 않았습니다.');
  }
  return secret;
}

function getBasicAuthHeader(): string {
  const secretKey = getSecretKey();
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

async function parseJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text };
  }
}

export async function tossPost<TResponse>(
  path: string,
  body: Record<string, any>,
  options?: { testCode?: string }
): Promise<TResponse> {
  const url = `https://api.tosspayments.com${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: getBasicAuthHeader(),
      'Content-Type': 'application/json',
      ...(options?.testCode ? { 'TossPayments-Test-Code': options.testCode } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const err = data as TossErrorResponse;
    const code = err?.code ? `(${err.code}) ` : '';
    const message = err?.message || `토스 API 요청 실패: ${res.status}`;
    const e = new Error(`${code}${message}`);
    (e as any).status = res.status;
    (e as any).code = err?.code;
    (e as any).raw = data;
    throw e;
  }

  return data as TResponse;
}


