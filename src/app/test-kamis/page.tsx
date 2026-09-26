'use client';

/**
 * KAMIS API 테스트 페이지
 * 최근일자 도소매가격(dailySalesList) 조회 + 축산물(periodProductList) 확인 + 가격추이(recentlyPriceTrendList)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getKamisAPI } from '@/services/kamisAPI';
import { KamisDailySalesItem, KamisPeriodProductItem, KamisPriceTrendItem } from '@/types/kamis';
import { KAMIS_LIVESTOCK_CODES } from '@/data/kamisLivestockCodes';
import { Loader2, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TestKamisPage() {
  const [items, setItems] = useState<KamisDailySalesItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLivestockIndex, setSelectedLivestockIndex] = useState(0);
  const [livestockItems, setLivestockItems] = useState<KamisPeriodProductItem[]>([]);
  const [livestockRaw, setLivestockRaw] = useState<unknown>(null);
  const [livestockLoading, setLivestockLoading] = useState(false);
  const [livestockError, setLivestockError] = useState<string | null>(null);

  const [trendProductno, setTrendProductno] = useState('');
  const [trendItems, setTrendItems] = useState<KamisPriceTrendItem[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);

  async function handleSearchDailySales() {
    setIsLoading(true);
    setError(null);
    setItems([]);

    try {
      const kamisAPI = getKamisAPI();
      const result = await kamisAPI.getDailySales();
      setItems(result);

      if (result.length === 0) {
        setError('데이터가 없습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      console.error('KAMIS dailySalesList 테스트 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearchLivestock() {
    setLivestockLoading(true);
    setLivestockError(null);
    setLivestockItems([]);
    setLivestockRaw(null);

    try {
      const code = KAMIS_LIVESTOCK_CODES[selectedLivestockIndex];
      const kamisAPI = getKamisAPI();
      const result = await kamisAPI.getLivestockPrice(code.itemCode, code.kindCode, code.productRankCode);
      setLivestockItems(result);
      setLivestockRaw(result);
    } catch (err) {
      setLivestockError(err instanceof Error ? err.message : '알 수 없는 오류');
      console.error('KAMIS periodProductList 테스트 오류:', err);
    } finally {
      setLivestockLoading(false);
    }
  }

  async function handleSearchTrend() {
    if (!trendProductno) return;
    setTrendLoading(true);
    setTrendError(null);
    setTrendItems([]);

    try {
      const kamisAPI = getKamisAPI();
      const result = await kamisAPI.getPriceTrend(trendProductno);
      setTrendItems(result);
    } catch (err) {
      setTrendError(err instanceof Error ? err.message : '알 수 없는 오류');
      console.error('KAMIS recentlyPriceTrendList 테스트 오류:', err);
    } finally {
      setTrendLoading(false);
    }
  }

  function directionIcon(direction: string) {
    if (direction === '1') return <TrendingUp className="w-3 h-3 text-destructive" />;
    if (direction === '0') return <TrendingDown className="w-3 h-3 text-blue-600" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">KAMIS API 테스트</h1>
          <p className="text-muted-foreground">
            최근일자 도·소매가격(dailySalesList) / 축산물(periodProductList) / 가격추이(recentlyPriceTrendList)
          </p>
        </div>

        {/* dailySalesList */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              최근일자 도·소매가격정보 (농산물/수산물)
            </CardTitle>
            <CardDescription>파라미터 없이 전체 품목의 최신 가격을 한 번에 조회합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSearchDailySales} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  조회 중...
                </>
              ) : (
                '조회'
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {items.length > 0 && (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-md">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">품목명</th>
                      <th className="text-left p-2 font-semibold">구분</th>
                      <th className="text-left p-2 font-semibold">단위</th>
                      <th className="text-right p-2 font-semibold">최근가격</th>
                      <th className="text-center p-2 font-semibold">등락</th>
                      <th className="text-left p-2 font-semibold">품목코드</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{item.productName || item.item_name}</td>
                        <td className="p-2 text-muted-foreground">{item.product_cls_name}</td>
                        <td className="p-2 text-muted-foreground">{item.unit}</td>
                        <td className="p-2 text-right font-mono">
                          {(parseFloat(item.dpr1.replace(/,/g, '')) || 0).toLocaleString()}원
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {directionIcon(item.direction)}
                            {item.value}%
                          </div>
                        </td>
                        <td className="p-2 text-muted-foreground">{item.productno}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* periodProductList (축산물) */}
        <Card>
          <CardHeader>
            <CardTitle>축산물 가격 (periodProductList)</CardTitle>
            <CardDescription>
              응답 필드가 문서로 확인되지 않아 raw JSON을 함께 보여줍니다. 실제 응답 확인 후 파싱 로직을 보정하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <select
                className="border rounded-md px-3 py-2 text-sm max-w-md"
                value={selectedLivestockIndex}
                onChange={(e) => setSelectedLivestockIndex(Number(e.target.value))}
              >
                {KAMIS_LIVESTOCK_CODES.map((code, index) => (
                  <option key={index} value={index}>
                    {code.itemName} - {code.kindName} {code.rankName} ({code.itemCode}/{code.kindCode})
                  </option>
                ))}
              </select>
              <Button onClick={handleSearchLivestock} disabled={livestockLoading}>
                {livestockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '조회'}
              </Button>
            </div>

            {livestockError && (
              <Alert variant="destructive">
                <AlertDescription>{livestockError}</AlertDescription>
              </Alert>
            )}

            {livestockRaw !== null && (
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto">
                {JSON.stringify(livestockRaw, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* recentlyPriceTrendList */}
        <Card>
          <CardHeader>
            <CardTitle>가격추이 (recentlyPriceTrendList)</CardTitle>
            <CardDescription>위 dailySalesList 결과에서 품목코드를 복사해서 넣어보세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={trendProductno}
                onChange={(e) => setTrendProductno(e.target.value)}
                placeholder="품목코드 (productno)"
                className="max-w-xs"
              />
              <Button onClick={handleSearchTrend} disabled={trendLoading || !trendProductno}>
                {trendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '조회'}
              </Button>
            </div>

            {trendError && (
              <Alert variant="destructive">
                <AlertDescription>{trendError}</AlertDescription>
              </Alert>
            )}

            {trendItems.length > 0 && (
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                {JSON.stringify(trendItems, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
