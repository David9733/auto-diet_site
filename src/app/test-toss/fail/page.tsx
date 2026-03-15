'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * 단건결제 실패 리다이렉트 페이지
 *
 * 토스 결제창에서 실패하면 failUrl로 이동하며
 * `code`, `message` 등의 쿼리 파라미터가 전달될 수 있습니다.
 */
function TestTossFailContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const code = sp.get('code');
  const message = sp.get('message');

  return (
    <div className="mx-auto w-full max-w-3xl p-6 space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>결제 실패</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <div className="text-muted-foreground">code</div>
            <div className="font-mono break-all">{code ?? '-'}</div>
          </div>
          <div className="text-sm">
            <div className="text-muted-foreground">message</div>
            <div className="break-all">{message ?? '-'}</div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push('/test-toss')}>테스트 페이지로</Button>
            <Button variant="outline" onClick={() => router.push('/')}>홈으로</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TestTossFailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl p-6">
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        </div>
      }
    >
      <TestTossFailContent />
    </Suspense>
  );
}


