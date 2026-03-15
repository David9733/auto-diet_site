'use client';

/**
 * katOnline API 테스트 페이지
 * 온라인 도매시장 거래정보 조회 + 단위 확인
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getKatOnlineAPI } from '@/services/katOnlineAPI';
import { KatTradeItem } from '@/types/katOnline';
import { Loader2, Search, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function TestKatOnlinePage() {
  const [date, setDate] = useState(getTodayDate());
  const [items, setItems] = useState<KatTradeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  async function handleSearch() {
    setIsLoading(true);
    setError(null);
    setItems([]);

    try {
      const katAPI = getKatOnlineAPI();
      const response = await katAPI.getTrades({
        cfmtnYmd: date,
        numOfRows: 100,
      });

      // resultCode 체크 ('0' 또는 '00' 모두 정상)
      const resultCode = response.response?.header?.resultCode;
      if (resultCode !== '00' && resultCode !== '0') {
        throw new Error(response.response?.header?.resultMsg || 'API 요청 실패');
      }

      const resultItems = response.response?.body?.items?.item || [];
      setItems(resultItems);
      setTotalCount(response.response?.body?.totalCount || 0);

      if (resultItems.length === 0) {
        setError('해당 날짜에 거래 데이터가 없습니다. 다른 날짜를 시도해보세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      console.error('katOnline API 테스트 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function analyzeUnit(qty: string): { hasDecimal: boolean; likelyUnit: string } {
    const hasDecimal = qty.includes('.');
    const likelyUnit = hasDecimal ? 'kg (소수점 있음)' : '박스/묶음? (정수)';
    return { hasDecimal, likelyUnit };
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold mb-2">katOnline API 테스트</h1>
          <p className="text-muted-foreground">
            온라인 도매시장 거래정보 조회 + 단위(kg/박스) 확인
          </p>
        </div>

        {/* 검색 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              거래정보 조회
            </CardTitle>
            <CardDescription>
              확정일자(YYYY-MM-DD)를 입력하세요. 주말/공휴일은 데이터가 없을 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="max-w-xs"
              />
              <Button onClick={handleSearch} disabled={isLoading || !date}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    조회 중...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    조회
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {totalCount > 0 && (
              <Alert>
                <AlertDescription>
                  총 <strong>{totalCount}건</strong>의 거래 데이터 중 <strong>{items.length}건</strong> 표시
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 결과 테이블 */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>거래정보 목록</CardTitle>
              <CardDescription>
                수량 컬럼에서 소수점 유무로 단위(kg/박스)를 추정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">품목명</th>
                      <th className="text-left p-3 font-semibold">대분류</th>
                      <th className="text-left p-3 font-semibold">중분류</th>
                      <th className="text-right p-3 font-semibold">확정수량</th>
                      <th className="text-right p-3 font-semibold">평균가</th>
                      <th className="text-right p-3 font-semibold">최소가</th>
                      <th className="text-right p-3 font-semibold">최고가</th>
                      <th className="text-center p-3 font-semibold">단위 추정</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const unitAnalysis = analyzeUnit(item.cfmtn_qty);
                      const katAPI = getKatOnlineAPI();
                      const parsedInfo = katAPI.parsePriceInfo(item);
                      const price100g = katAPI.getPricePer100g(parsedInfo);

                      return (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{item.onln_whsl_mrkt_sclsf_nm}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {item.onln_whsl_mrkt_lclsf_nm}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {item.onln_whsl_mrkt_mclsf_nm}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {parseFloat(item.cfmtn_qty).toLocaleString()}
                            {unitAnalysis.hasDecimal && (
                              <span className="ml-1 text-xs text-green-600">●</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {parseFloat(item.avgprc).toLocaleString()}원
                            <div className="text-xs text-muted-foreground">
                              ≈ {price100g}원/100g
                            </div>
                          </td>
                          <td className="p-3 text-right text-sm">
                            <div className="flex items-center justify-end gap-1 text-blue-600">
                              <TrendingDown className="w-3 h-3" />
                              {parseFloat(item.lwprc).toLocaleString()}원
                            </div>
                          </td>
                          <td className="p-3 text-right text-sm">
                            <div className="flex items-center justify-end gap-1 text-red-600">
                              <TrendingUp className="w-3 h-3" />
                              {parseFloat(item.hgprc).toLocaleString()}원
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                unitAnalysis.hasDecimal
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {unitAnalysis.likelyUnit}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 사용 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>단위 판별 기준</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">●</span>
              <div>
                <strong>소수점 있음 (예: 1234.5)</strong>
                <p className="text-muted-foreground">→ kg 가능성 매우 높음</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">●</span>
              <div>
                <strong>정수만 (예: 10, 20)</strong>
                <p className="text-muted-foreground">→ 박스/묶음/단 가능성 (품목별 상이)</p>
              </div>
            </div>
            <Alert className="mt-4">
              <AlertDescription>
                <strong>현재 가정:</strong> 평균가는 <strong>원/kg</strong>으로 간주하고, 100g당 가격은{' '}
                <code>평균가 ÷ 10</code>으로 환산합니다.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}















