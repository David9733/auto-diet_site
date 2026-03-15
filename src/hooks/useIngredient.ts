/**
 * 식재료 관련 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ingredient } from '@/types/ingredient';
import { getFDAAPI } from '@/services/fdaAPI';
import { mapFDAResponseToIngredient, mapFDAResponsesToIngredients } from '@/utils/ingredientMapper';

/**
 * 식재료 검색 훅
 */
export function useSearchIngredients(keyword: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['ingredients', 'search', keyword],
    queryFn: async () => {
      if (!keyword || keyword.trim().length === 0) {
        return [];
      }
      
      const fdaAPI = getFDAAPI();
      const results = await fdaAPI.searchIngredients(keyword.trim(), 1, 20);
      return mapFDAResponsesToIngredients(results);
    },
    enabled: enabled && keyword.trim().length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24시간 캐시
    gcTime: 1000 * 60 * 60 * 48,     // 48시간 가비지 컬렉션
  });
}

/**
 * 식재료 상세 조회 훅
 */
export function useIngredientDetail(foodCode: string | null) {
  return useQuery({
    queryKey: ['ingredients', 'detail', foodCode],
    queryFn: async () => {
      if (!foodCode) return null;
      
      const fdaAPI = getFDAAPI();
      const result = await fdaAPI.getIngredientDetail(foodCode);
      
      if (!result) return null;
      
      return mapFDAResponseToIngredient(result);
    },
    enabled: !!foodCode,
    staleTime: 1000 * 60 * 60 * 24, // 24시간 캐시
  });
}

/**
 * 카테고리별 식재료 조회 훅
 */
export function useIngredientsByCategory(category: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['ingredients', 'category', category],
    queryFn: async () => {
      const fdaAPI = getFDAAPI();
      const results = await fdaAPI.getIngredientsByCategory(category, 1, 100);
      return mapFDAResponsesToIngredients(results);
    },
    enabled: enabled && category.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24시간 캐시
  });
}

/**
 * 여러 식재료 일괄 검색 훅
 */
export function useSearchMultipleIngredients(keywords: string[], enabled: boolean = true) {
  return useQuery({
    queryKey: ['ingredients', 'multiple', ...keywords.sort()],
    queryFn: async () => {
      const fdaAPI = getFDAAPI();
      const resultsMap = await fdaAPI.searchMultipleIngredients(keywords);
      
      const ingredientsMap = new Map<string, Ingredient[]>();
      
      resultsMap.forEach((items, keyword) => {
        ingredientsMap.set(keyword, mapFDAResponsesToIngredients(items));
      });
      
      return ingredientsMap;
    },
    enabled: enabled && keywords.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24시간 캐시
  });
}

/**
 * 식재료 가격 업데이트 훅 (Supabase에 저장)
 */
export function useUpdateIngredientPrice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      ingredientId, 
      price 
    }: { 
      ingredientId: string; 
      price: number;
    }) => {
      // TODO: Supabase에 가격 정보 저장
      // const { data, error } = await supabase
      //   .from('ingredient_prices')
      //   .upsert({ ingredient_id: ingredientId, price_per_100g: price });
      
      return { ingredientId, price };
    },
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}

/**
 * 자주 사용하는 식재료 목록 훅 (Supabase에서 조회)
 */
export function useFrequentIngredients(userId?: string) {
  return useQuery({
    queryKey: ['ingredients', 'frequent', userId],
    queryFn: async () => {
      // TODO: Supabase에서 자주 사용하는 식재료 조회
      // const { data } = await supabase
      //   .from('ingredient_usage')
      //   .select('*, ingredient_details(*)')
      //   .eq('user_id', userId)
      //   .order('usage_count', { ascending: false })
      //   .limit(20);
      
      return [] as Ingredient[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });
}

/**
 * 식재료 즐겨찾기 추가/제거 훅
 */
export function useToggleFavoriteIngredient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      ingredientId,
      isFavorite
    }: { 
      userId: string; 
      ingredientId: string;
      isFavorite: boolean;
    }) => {
      // TODO: Supabase에 즐겨찾기 상태 저장
      // if (isFavorite) {
      //   await supabase.from('favorite_ingredients').delete()
      //     .eq('user_id', userId).eq('ingredient_id', ingredientId);
      // } else {
      //   await supabase.from('favorite_ingredients').insert({
      //     user_id: userId, ingredient_id: ingredientId
      //   });
      // }
      
      return { userId, ingredientId, isFavorite: !isFavorite };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', 'favorites'] });
    },
  });
}















