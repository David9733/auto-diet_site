/**
 * KAMIS 축산물 품목/품종/등급 코드표 (정적 데이터)
 * 출처: kamis.or.kr Open-API 이용안내 > 농축수산물 품목 및 등급 코드표 첨부파일
 * 축산물 가격은 dailySalesList가 아니라 action=periodProductList(품목코드+품종코드 필수)로 조회
 */

import { KamisLivestockCode } from '@/types/kamis';

export const KAMIS_LIVESTOCK_CODES: KamisLivestockCode[] = [
  { itemName: '소', kindName: '안심', rankName: '', itemCode: '4301', kindCode: '21', productRankCode: '00' },
  { itemName: '소', kindName: '안심', rankName: '1++등급', itemCode: '4301', kindCode: '21', productRankCode: '01' },
  { itemName: '소', kindName: '안심', rankName: '1+등급', itemCode: '4301', kindCode: '21', productRankCode: '02' },
  { itemName: '소', kindName: '안심', rankName: '1등급', itemCode: '4301', kindCode: '21', productRankCode: '03' },
  { itemName: '소', kindName: '등심', rankName: '', itemCode: '4301', kindCode: '22', productRankCode: '00' },
  { itemName: '소', kindName: '등심', rankName: '1++등급', itemCode: '4301', kindCode: '22', productRankCode: '01' },
  { itemName: '소', kindName: '등심', rankName: '1+등급', itemCode: '4301', kindCode: '22', productRankCode: '02' },
  { itemName: '소', kindName: '등심', rankName: '1등급', itemCode: '4301', kindCode: '22', productRankCode: '03' },
  { itemName: '소', kindName: '설도', rankName: '', itemCode: '4301', kindCode: '36', productRankCode: '00' },
  { itemName: '소', kindName: '설도', rankName: '1++등급', itemCode: '4301', kindCode: '36', productRankCode: '01' },
  { itemName: '소', kindName: '설도', rankName: '1+등급', itemCode: '4301', kindCode: '36', productRankCode: '02' },
  { itemName: '소', kindName: '설도', rankName: '1등급', itemCode: '4301', kindCode: '36', productRankCode: '03' },
  { itemName: '소', kindName: '양지', rankName: '', itemCode: '4301', kindCode: '40', productRankCode: '00' },
  { itemName: '소', kindName: '양지', rankName: '1++등급', itemCode: '4301', kindCode: '40', productRankCode: '01' },
  { itemName: '소', kindName: '양지', rankName: '1+등급', itemCode: '4301', kindCode: '40', productRankCode: '02' },
  { itemName: '소', kindName: '양지', rankName: '1등급', itemCode: '4301', kindCode: '40', productRankCode: '03' },
  { itemName: '소', kindName: '갈비', rankName: '', itemCode: '4301', kindCode: '50', productRankCode: '00' },
  { itemName: '소', kindName: '갈비', rankName: '1++등급', itemCode: '4301', kindCode: '50', productRankCode: '01' },
  { itemName: '소', kindName: '갈비', rankName: '1+등급', itemCode: '4301', kindCode: '50', productRankCode: '02' },
  { itemName: '소', kindName: '갈비', rankName: '1등급', itemCode: '4301', kindCode: '50', productRankCode: '03' },
  { itemName: '돼지', kindName: '앞다리', rankName: '', itemCode: '4304', kindCode: '25', productRankCode: '00' },
  { itemName: '돼지', kindName: '삼겹살', rankName: '', itemCode: '4304', kindCode: '27', productRankCode: '00' },
  { itemName: '돼지', kindName: '갈비', rankName: '', itemCode: '4304', kindCode: '28', productRankCode: '00' },
  { itemName: '돼지', kindName: '목심', rankName: '', itemCode: '4304', kindCode: '68', productRankCode: '00' },
  { itemName: '수입 소고기', kindName: '양지(냉장)', rankName: '미국산', itemCode: '4401', kindCode: '29', productRankCode: '81' },
  { itemName: '수입 소고기', kindName: '양지(냉장)', rankName: '호주산', itemCode: '4401', kindCode: '29', productRankCode: '82' },
  { itemName: '수입 소고기', kindName: '갈비', rankName: '', itemCode: '4401', kindCode: '31', productRankCode: '00' },
  { itemName: '수입 소고기', kindName: '갈비(냉동)', rankName: '', itemCode: '4401', kindCode: '31', productRankCode: '00' },
  { itemName: '수입 소고기', kindName: '갈비', rankName: '미국산', itemCode: '4401', kindCode: '31', productRankCode: '81' },
  { itemName: '수입 소고기', kindName: '갈비(냉동)', rankName: '미국산', itemCode: '4401', kindCode: '31', productRankCode: '81' },
  { itemName: '수입 소고기', kindName: '갈비', rankName: '호주산', itemCode: '4401', kindCode: '31', productRankCode: '82' },
  { itemName: '수입 소고기', kindName: '갈비(냉동)', rankName: '호주산', itemCode: '4401', kindCode: '31', productRankCode: '82' },
  { itemName: '수입 소고기', kindName: '갈비살', rankName: '', itemCode: '4401', kindCode: '37', productRankCode: '00' },
  { itemName: '수입 소고기', kindName: '갈비살', rankName: '미국산', itemCode: '4401', kindCode: '37', productRankCode: '81' },
  { itemName: '수입 소고기', kindName: '갈비살(냉장)', rankName: '미국산', itemCode: '4401', kindCode: '37', productRankCode: '81' },
  { itemName: '수입 소고기', kindName: '갈비살', rankName: '호주산', itemCode: '4401', kindCode: '37', productRankCode: '82' },
  { itemName: '수입 소고기', kindName: '갈비살(냉장)', rankName: '호주산', itemCode: '4401', kindCode: '37', productRankCode: '82' },
  { itemName: '수입 소고기', kindName: '척아이롤(냉장)', rankName: '미국산', itemCode: '4401', kindCode: '62', productRankCode: '81' },
  { itemName: '수입 소고기', kindName: '척아이롤(냉장)', rankName: '호주산', itemCode: '4401', kindCode: '62', productRankCode: '82' },
  { itemName: '수입 소고기', kindName: '척아이롤(냉동)', rankName: '미국산', itemCode: '4401', kindCode: '68', productRankCode: '81' },
  { itemName: '수입 소고기', kindName: '척아이롤(냉동)', rankName: '호주산', itemCode: '4401', kindCode: '68', productRankCode: '82' },
  { itemName: '수입 돼지고기', kindName: '삼겹살', rankName: '', itemCode: '4402', kindCode: '27', productRankCode: '00' },
  { itemName: '닭', kindName: '토종닭17호', rankName: '', itemCode: '9901', kindCode: '01', productRankCode: '00' },
  { itemName: '닭', kindName: '육계9호', rankName: '', itemCode: '9901', kindCode: '02', productRankCode: '00' },
  { itemName: '닭', kindName: '육계10호', rankName: '', itemCode: '9901', kindCode: '03', productRankCode: '00' },
  { itemName: '닭', kindName: '육계11호', rankName: '', itemCode: '9901', kindCode: '04', productRankCode: '00' },
  { itemName: '닭', kindName: '육계12호', rankName: '', itemCode: '9901', kindCode: '05', productRankCode: '00' },
  { itemName: '닭', kindName: '가슴살', rankName: '', itemCode: '9901', kindCode: '06', productRankCode: '00' },
  { itemName: '닭', kindName: '북채', rankName: '', itemCode: '9901', kindCode: '08', productRankCode: '00' },
  { itemName: '닭', kindName: '절단육', rankName: '', itemCode: '9901', kindCode: '24', productRankCode: '00' },
  { itemName: '닭', kindName: '육계(kg)', rankName: '', itemCode: '9901', kindCode: '99', productRankCode: '00' },
  { itemName: '계란', kindName: '특란10구', rankName: '일반란', itemCode: '9903', kindCode: '21', productRankCode: '71' },
  { itemName: '계란', kindName: '특란10구', rankName: '등급란', itemCode: '9903', kindCode: '21', productRankCode: '72' },
  { itemName: '계란', kindName: '특란30구', rankName: '일반란', itemCode: '9903', kindCode: '23', productRankCode: '71' },
  { itemName: '계란', kindName: '특란30구', rankName: '등급란', itemCode: '9903', kindCode: '23', productRankCode: '72' },
  { itemName: '우유', kindName: '흰우유', rankName: '', itemCode: '9908', kindCode: '01', productRankCode: '00' },
];

/**
 * 식재료명(요리 재료 표기) → 대표 축산물 코드 매핑
 * 여러 부위/등급 중 식단 원가 계산에 쓸 대표 항목 하나씩 선택
 */
export const LIVESTOCK_INGREDIENT_MAPPING: Record<string, { itemCode: string; kindCode: string; productRankCode?: string }> = {
  '소고기': { itemCode: '4301', kindCode: '22' },       // 소 등심
  '한우': { itemCode: '4301', kindCode: '22' },         // 소 등심
  '돼지고기': { itemCode: '4304', kindCode: '27' },      // 돼지 삼겹살
  '돈육': { itemCode: '4304', kindCode: '27' },
  '닭고기': { itemCode: '9901', kindCode: '03' },        // 육계10호
  '닭': { itemCode: '9901', kindCode: '03' },
  '계란': { itemCode: '9903', kindCode: '23' },          // 특란30구
  '달걀': { itemCode: '9903', kindCode: '23' },
};
