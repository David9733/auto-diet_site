/**
 * FDA API 테스트 컴포넌트
 * 식재료 검색 기능 테스트용
 */

'use client';

import { useState } from 'react';
import { useSearchIngredients, useIngredientDetail } from '@/hooks/useIngredient';
import { Ingredient } from '@/types/ingredient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function IngredientSearchTest() {
  const [keyword, setKeyword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  
  const { 
    data: ingredients, 
    isLoading, 
    error,
    isError 
  } = useSearchIngredients(searchTerm, searchTerm.length > 0);
  
  const handleSearch = () => {
    if (keyword.trim()) {
      setSearchTerm(keyword.trim());
      setSelectedIngredient(null);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🧪 FDA API 테스트</h1>
        <p className="text-muted-foreground">
          식품의약품안전처 식품영양성분DB API 연동 테스트
        </p>
      </div>
      
      {/* API 설정 안내 */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          .env.local 파일에 <code className="bg-muted px-1 rounded">NEXT_PUBLIC_FDA_API_KEY</code>가 
          설정되어 있어야 합니다. 자세한 내용은 <code className="bg-muted px-1 rounded">FDA_API_SETUP.md</code>를 참고하세요.
        </AlertDescription>
      </Alert>
      
      {/* 검색 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>식재료 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="예: 두부, 김치, 돼지고기..."
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isLoading || !keyword.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  검색 중...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  검색
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            <p>💡 추천 검색어: 두부, 된장, 돼지고기, 배추, 쌀</p>
            <p>📊 검색 결과는 24시간 동안 캐시됩니다.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* 에러 메시지 */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'API 요청에 실패했습니다.'}
            <br />
            <span className="text-xs">
              API 키가 올바른지 확인하고 개발 서버를 재시작해보세요.
            </span>
          </AlertDescription>
        </Alert>
      )}
      
      {/* 검색 결과 */}
      {ingredients && ingredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>검색 결과 ({ingredients.length}건)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setSelectedIngredient(ingredient)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{ingredient.name}</h3>
                        <Badge variant="outline">{ingredient.category}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">칼로리:</span> {ingredient.nutritionPer100g.calories}kcal
                        </div>
                        <div>
                          <span className="font-medium">단백질:</span> {ingredient.nutritionPer100g.protein}g
                        </div>
                        <div>
                          <span className="font-medium">탄수화물:</span> {ingredient.nutritionPer100g.carbs}g
                        </div>
                        <div>
                          <span className="font-medium">나트륨:</span> {ingredient.nutritionPer100g.sodium}mg
                        </div>
                      </div>
                      
                      {ingredient.allergens.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ingredient.allergens.map((allergen) => (
                            <Badge key={allergen} variant="destructive" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Badge variant="secondary" className="ml-2">
                      {ingredient.source}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 검색 결과 없음 */}
      {searchTerm && ingredients && ingredients.length === 0 && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            "{searchTerm}"에 대한 검색 결과가 없습니다.
            <br />
            다른 키워드로 검색해보세요.
          </AlertDescription>
        </Alert>
      )}
      
      {/* 상세 정보 */}
      {selectedIngredient && (
        <Card>
          <CardHeader>
            <CardTitle>상세 영양 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedIngredient.name}</h3>
                <div className="flex gap-2">
                  <Badge>{selectedIngredient.category}</Badge>
                  {selectedIngredient.animalPlant && (
                    <Badge variant="outline">{selectedIngredient.animalPlant}</Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <NutritionItem 
                  label="에너지" 
                  value={selectedIngredient.nutritionPer100g.calories} 
                  unit="kcal" 
                />
                <NutritionItem 
                  label="단백질" 
                  value={selectedIngredient.nutritionPer100g.protein} 
                  unit="g" 
                />
                <NutritionItem 
                  label="지방" 
                  value={selectedIngredient.nutritionPer100g.fat} 
                  unit="g" 
                />
                <NutritionItem 
                  label="탄수화물" 
                  value={selectedIngredient.nutritionPer100g.carbs} 
                  unit="g" 
                />
                <NutritionItem 
                  label="당류" 
                  value={selectedIngredient.nutritionPer100g.sugars} 
                  unit="g" 
                />
                <NutritionItem 
                  label="나트륨" 
                  value={selectedIngredient.nutritionPer100g.sodium} 
                  unit="mg" 
                />
                <NutritionItem 
                  label="콜레스테롤" 
                  value={selectedIngredient.nutritionPer100g.cholesterol} 
                  unit="mg" 
                />
                <NutritionItem 
                  label="포화지방" 
                  value={selectedIngredient.nutritionPer100g.saturatedFat} 
                  unit="g" 
                />
                <NutritionItem 
                  label="트랜스지방" 
                  value={selectedIngredient.nutritionPer100g.transFat} 
                  unit="g" 
                />
                
                {selectedIngredient.nutritionPer100g.calcium && (
                  <NutritionItem 
                    label="칼슘" 
                    value={selectedIngredient.nutritionPer100g.calcium} 
                    unit="mg" 
                  />
                )}
                {selectedIngredient.nutritionPer100g.iron && (
                  <NutritionItem 
                    label="철분" 
                    value={selectedIngredient.nutritionPer100g.iron} 
                    unit="mg" 
                  />
                )}
                {selectedIngredient.nutritionPer100g.vitaminC && (
                  <NutritionItem 
                    label="비타민C" 
                    value={selectedIngredient.nutritionPer100g.vitaminC} 
                    unit="mg" 
                  />
                )}
              </div>
              
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>식품코드: {selectedIngredient.fdaCode}</p>
                <p>데이터 출처: {selectedIngredient.source}</p>
                <p>업데이트: {new Date(selectedIngredient.lastUpdated).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NutritionItem({ 
  label, 
  value, 
  unit 
}: { 
  label: string; 
  value: number; 
  unit: string;
}) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-semibold">
        {value.toFixed(1)} <span className="text-sm font-normal">{unit}</span>
      </div>
    </div>
  );
}















