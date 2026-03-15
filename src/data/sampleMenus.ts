import { MenuItem } from '@/types/meal';

export const sampleRice: MenuItem[] = [
  // 자주 나오는 기본 밥 (weight: 15-22) → 80%
  // 확률 조정(요청):
  // - 흰쌀밥/현미밥/잡곡밥: 가장 높게
  // - 보리밥: 그 다음
  // - 그 외 밥/덮밥/볶음밥: 낮게
  { id: 'r1', name: '흰쌀밥', category: 'rice', calories: 300, protein: 5, carbs: 65, fat: 1, sodium: 5, allergens: [], cost: 300, mainIngredients: ['쌀'], weight: 30 }, // 가장 자주
  { id: 'r2', name: '현미밥', category: 'rice', calories: 280, protein: 6, carbs: 58, fat: 2, sodium: 5, allergens: [], cost: 350, mainIngredients: ['현미'], weight: 30 }, // 가장 자주
  { id: 'r3', name: '잡곡밥', category: 'rice', calories: 290, protein: 7, carbs: 60, fat: 2, sodium: 5, allergens: [], cost: 400, mainIngredients: ['잡곡'], weight: 30 }, // 가장 자주
  { id: 'r14', name: '보리밥', category: 'rice', calories: 285, protein: 6, carbs: 59, fat: 1, sodium: 5, allergens: [], cost: 350, mainIngredients: ['보리'], weight: 18 }, // 그 다음
  
  // 가끔 나오는 특별 밥 (weight: 2-3) → 11%
  { id: 'r6', name: '비빔밥', category: 'rice', calories: 450, protein: 12, carbs: 65, fat: 12, sodium: 680, allergens: ['대두'], cost: 700, mainIngredients: ['쌀', '야채'], weight: 2 }, // 낮게
  { id: 'r7', name: '카레라이스', category: 'rice', calories: 520, protein: 14, carbs: 75, fat: 16, sodium: 850, allergens: ['밀'], cost: 650, mainIngredients: ['쌀', '카레'], weight: 2 }, // 낮게
  { id: 'r8', name: '소불고기덮밥', category: 'rice', calories: 480, protein: 20, carbs: 62, fat: 14, sodium: 720, allergens: ['쇠고기', '대두'], cost: 850, mainIngredients: ['쌀', '소고기'], weight: 2 }, // 낮게
  { id: 'r9', name: '야채볶음밥', category: 'rice', calories: 360, protein: 7, carbs: 58, fat: 10, sodium: 420, allergens: ['대두'], cost: 450, mainIngredients: ['쌀', '야채'], weight: 2 }, // 낮게
  { id: 'r10', name: '참치마요덮밥', category: 'rice', calories: 420, protein: 16, carbs: 58, fat: 12, sodium: 580, allergens: ['달걀'], cost: 600, mainIngredients: ['쌀', '참치'], weight: 2 }, // 낮게
  
  // 드물게 나오는 특별 밥 (weight: 2) → 8%
  { id: 'r4', name: '콩나물밥', category: 'rice', calories: 310, protein: 9, carbs: 55, fat: 3, sodium: 50, allergens: ['대두'], cost: 450, mainIngredients: ['쌀', '콩나물'], weight: 2 }, // 낮게
  { id: 'r5', name: '김치볶음밥', category: 'rice', calories: 380, protein: 8, carbs: 62, fat: 8, sodium: 450, allergens: ['새우'], cost: 500, mainIngredients: ['쌀', '김치'], weight: 2 }, // 낮게
  { id: 'r11', name: '오므라이스', category: 'rice', calories: 480, protein: 12, carbs: 62, fat: 18, sodium: 680, allergens: ['달걀', '밀'], cost: 700, mainIngredients: ['쌀', '계란'], weight: 2 }, // 낮게
  { id: 'r13', name: '주먹밥', category: 'rice', calories: 250, protein: 4, carbs: 52, fat: 2, sodium: 320, allergens: ['참깨'], cost: 350, mainIngredients: ['쌀'], weight: 2 }, // 낮게
  // 김밥(r15)과 새우볶음밥(r12)은 특별식으로 이동 (분식/중식)
];

export const sampleSoups: MenuItem[] = [
  { id: 's1', name: '된장찌개', category: 'soup', calories: 120, protein: 8, carbs: 10, fat: 5, sodium: 850, allergens: ['대두'], cost: 400, mainIngredients: ['된장', '두부'] },
  { id: 's2', name: '김치찌개', category: 'soup', calories: 150, protein: 10, carbs: 8, fat: 8, sodium: 950, allergens: ['새우', '돼지고기'], cost: 500, mainIngredients: ['김치', '돼지고기'] },
  { id: 's3', name: '미역국', category: 'soup', calories: 80, protein: 6, carbs: 5, fat: 4, sodium: 650, allergens: [], cost: 350, mainIngredients: ['미역'] },
  { id: 's4', name: '소고기무국', category: 'soup', calories: 130, protein: 12, carbs: 8, fat: 6, sodium: 720, allergens: ['쇠고기'], cost: 600, mainIngredients: ['소고기', '무'] },
  { id: 's5', name: '순두부찌개', category: 'soup', calories: 160, protein: 12, carbs: 6, fat: 10, sodium: 880, allergens: ['대두', '달걀'], cost: 550, mainIngredients: ['순두부'] },
  { id: 's6', name: '콩나물국', category: 'soup', calories: 70, protein: 5, carbs: 6, fat: 2, sodium: 600, allergens: ['대두'], cost: 300, mainIngredients: ['콩나물'] },
  { id: 's7', name: '북어국', category: 'soup', calories: 90, protein: 14, carbs: 4, fat: 2, sodium: 550, allergens: [], cost: 450, mainIngredients: ['북어'] },
  { id: 's8', name: '육개장', category: 'soup', calories: 180, protein: 15, carbs: 10, fat: 9, sodium: 900, allergens: ['쇠고기'], cost: 650, mainIngredients: ['소고기', '고사리'] },
  { id: 's9', name: '시래기국', category: 'soup', calories: 85, protein: 5, carbs: 8, fat: 3, sodium: 580, allergens: [], cost: 380, mainIngredients: ['시래기'] },
  { id: 's10', name: '우거지국', category: 'soup', calories: 95, protein: 6, carbs: 7, fat: 4, sodium: 620, allergens: [], cost: 400, mainIngredients: ['우거지'] },
  { id: 's11', name: '감자국', category: 'soup', calories: 100, protein: 4, carbs: 15, fat: 3, sodium: 550, allergens: [], cost: 350, mainIngredients: ['감자'] },
  { id: 's12', name: '떡국', category: 'soup', calories: 180, protein: 8, carbs: 28, fat: 5, sodium: 680, allergens: ['밀'], cost: 500, mainIngredients: ['떡'] },
  { id: 's13', name: '어묵탕', category: 'soup', calories: 110, protein: 7, carbs: 12, fat: 4, sodium: 720, allergens: ['밀'], cost: 420, mainIngredients: ['어묵'] },
  { id: 's14', name: '바지락국', category: 'soup', calories: 75, protein: 8, carbs: 4, fat: 2, sodium: 580, allergens: ['조개류'], cost: 450, mainIngredients: ['바지락'] },
  { id: 's15', name: '닭곰탕', category: 'soup', calories: 140, protein: 14, carbs: 5, fat: 7, sodium: 650, allergens: ['닭고기'], cost: 550, mainIngredients: ['닭고기'] },
  { id: 's16', name: '설렁탕', category: 'soup', calories: 160, protein: 16, carbs: 3, fat: 9, sodium: 700, allergens: ['쇠고기'], cost: 700, mainIngredients: ['소고기'] },
  { id: 's17', name: '청국장찌개', category: 'soup', calories: 130, protein: 10, carbs: 8, fat: 6, sodium: 820, allergens: ['대두'], cost: 450, mainIngredients: ['청국장'] },
  { id: 's18', name: '부대찌개', category: 'soup', calories: 200, protein: 12, carbs: 15, fat: 11, sodium: 980, allergens: ['돼지고기', '밀'], cost: 600, mainIngredients: ['햄', '라면'] },
  { id: 's19', name: '뼈해장국', category: 'soup', calories: 170, protein: 14, carbs: 8, fat: 10, sodium: 850, allergens: ['돼지고기'], cost: 650, mainIngredients: ['돼지뼈'] },
  { id: 's20', name: '오징어국', category: 'soup', calories: 95, protein: 10, carbs: 6, fat: 3, sodium: 620, allergens: ['오징어'], cost: 480, mainIngredients: ['오징어'] },
  { id: 's21', name: '호박국', category: 'soup', calories: 65, protein: 3, carbs: 10, fat: 2, sodium: 480, allergens: [], cost: 320, mainIngredients: ['호박'] },
  { id: 's22', name: '냉이된장국', category: 'soup', calories: 75, protein: 5, carbs: 7, fat: 3, sodium: 650, allergens: ['대두'], cost: 380, mainIngredients: ['냉이', '된장'] },
  { id: 's23', name: '아욱국', category: 'soup', calories: 70, protein: 4, carbs: 6, fat: 3, sodium: 550, allergens: [], cost: 350, mainIngredients: ['아욱'] },
  { id: 's24', name: '근대국', category: 'soup', calories: 65, protein: 3, carbs: 5, fat: 3, sodium: 520, allergens: [], cost: 330, mainIngredients: ['근대'] },
  { id: 's25', name: '버섯전골', category: 'soup', calories: 120, protein: 8, carbs: 10, fat: 6, sodium: 680, allergens: [], cost: 500, mainIngredients: ['버섯'] },
  { id: 's26', name: '추어탕', category: 'soup', calories: 150, protein: 12, carbs: 8, fat: 8, sodium: 750, allergens: [], cost: 700, mainIngredients: ['미꾸라지'] },
  { id: 's27', name: '갈비탕', category: 'soup', calories: 200, protein: 18, carbs: 5, fat: 12, sodium: 780, allergens: ['쇠고기'], cost: 850, mainIngredients: ['소갈비'] },
  { id: 's28', name: '조개탕', category: 'soup', calories: 85, protein: 9, carbs: 5, fat: 3, sodium: 600, allergens: ['조개류'], cost: 520, mainIngredients: ['조개'] },
  { id: 's29', name: '동태찌개', category: 'soup', calories: 110, protein: 12, carbs: 6, fat: 4, sodium: 720, allergens: [], cost: 550, mainIngredients: ['동태'] },
  { id: 's30', name: '알탕', category: 'soup', calories: 130, protein: 14, carbs: 5, fat: 6, sodium: 680, allergens: ['달걀'], cost: 600, mainIngredients: ['명란', '알'] },
  { id: 's31', name: '닭개장', category: 'soup', calories: 160, protein: 16, carbs: 8, fat: 7, sodium: 820, allergens: ['닭고기'], cost: 580, mainIngredients: ['닭고기'] },
  { id: 's32', name: '들깨국', category: 'soup', calories: 100, protein: 5, carbs: 8, fat: 6, sodium: 520, allergens: [], cost: 400, mainIngredients: ['들깨'] },
  { id: 's33', name: '굴국', category: 'soup', calories: 90, protein: 8, carbs: 6, fat: 4, sodium: 580, allergens: ['굴'], cost: 550, mainIngredients: ['굴'] },
  { id: 's34', name: '황태해장국', category: 'soup', calories: 95, protein: 12, carbs: 5, fat: 3, sodium: 620, allergens: [], cost: 500, mainIngredients: ['황태'] },
  { id: 's35', name: '닭도리탕', category: 'soup', calories: 180, protein: 18, carbs: 12, fat: 8, sodium: 750, allergens: ['닭고기'], cost: 620, mainIngredients: ['닭고기', '감자'] },
  { id: 's36', name: '매생이국', category: 'soup', calories: 60, protein: 4, carbs: 5, fat: 2, sodium: 480, allergens: [], cost: 400, mainIngredients: ['매생이'] },
  { id: 's37', name: '들깨미역국', category: 'soup', calories: 95, protein: 5, carbs: 6, fat: 5, sodium: 580, allergens: [], cost: 400, mainIngredients: ['미역', '들깨'] },
  { id: 's38', name: '소고기미역국', category: 'soup', calories: 110, protein: 10, carbs: 6, fat: 6, sodium: 650, allergens: ['쇠고기'], cost: 550, mainIngredients: ['소고기', '미역'] },
  { id: 's39', name: '해물탕', category: 'soup', calories: 140, protein: 16, carbs: 8, fat: 5, sodium: 720, allergens: ['조개류', '새우', '오징어'], cost: 700, mainIngredients: ['해물'] },
  { id: 's40', name: '대구탕', category: 'soup', calories: 100, protein: 14, carbs: 5, fat: 3, sodium: 620, allergens: [], cost: 650, mainIngredients: ['대구'] },
  { id: 's41', name: '꽃게탕', category: 'soup', calories: 120, protein: 12, carbs: 6, fat: 5, sodium: 680, allergens: ['게'], cost: 750, mainIngredients: ['꽃게'] },
  { id: 's42', name: '두부된장국', category: 'soup', calories: 90, protein: 7, carbs: 6, fat: 4, sodium: 700, allergens: ['대두'], cost: 350, mainIngredients: ['두부', '된장'] },
  { id: 's43', name: '홍합탕', category: 'soup', calories: 85, protein: 10, carbs: 5, fat: 3, sodium: 580, allergens: ['홍합'], cost: 500, mainIngredients: ['홍합'] },
  { id: 's44', name: '재첩국', category: 'soup', calories: 70, protein: 8, carbs: 4, fat: 2, sodium: 520, allergens: ['조개류'], cost: 550, mainIngredients: ['재첩'] },
  { id: 's45', name: '순대국', category: 'soup', calories: 180, protein: 14, carbs: 12, fat: 10, sodium: 800, allergens: ['돼지고기'], cost: 650, mainIngredients: ['순대'] },
  { id: 's46', name: '돼지국밥', category: 'soup', calories: 200, protein: 16, carbs: 10, fat: 12, sodium: 850, allergens: ['돼지고기'], cost: 700, mainIngredients: ['돼지고기'] },
  { id: 's47', name: '칼국수', category: 'soup', calories: 350, protein: 12, carbs: 55, fat: 8, sodium: 720, allergens: ['밀'], cost: 550, mainIngredients: ['면'] },
  { id: 's48', name: '수제비', category: 'soup', calories: 320, protein: 10, carbs: 50, fat: 7, sodium: 680, allergens: ['밀'], cost: 500, mainIngredients: ['밀가루'] },
  { id: 's49', name: '만두국', category: 'soup', calories: 280, protein: 12, carbs: 35, fat: 10, sodium: 720, allergens: ['밀', '돼지고기'], cost: 600, mainIngredients: ['만두'] },
  { id: 's50', name: '해장국', category: 'soup', calories: 160, protein: 14, carbs: 8, fat: 8, sodium: 820, allergens: ['쇠고기'], cost: 650, mainIngredients: ['소고기', '콩나물'] },
  // 고가(원재료율 높은) 옵션: 예산이 큰 사용자도 "목표 금액"에 근사치로 맞출 수 있도록 추가
  { id: 's51', name: '전복미역국(프리미엄)', category: 'soup', calories: 140, protein: 12, carbs: 8, fat: 7, sodium: 650, allergens: ['전복'], cost: 2200, mainIngredients: ['전복', '미역'] },
  { id: 's52', name: '한우곰탕(프리미엄)', category: 'soup', calories: 210, protein: 18, carbs: 6, fat: 12, sodium: 780, allergens: ['쇠고기'], cost: 2500, mainIngredients: ['소고기'] },
  { id: 's53', name: '대게탕(프리미엄)', category: 'soup', calories: 160, protein: 16, carbs: 7, fat: 6, sodium: 820, allergens: ['게'], cost: 4200, mainIngredients: ['게'] },
  { id: 's54', name: '전복해신탕(프리미엄)', category: 'soup', calories: 260, protein: 24, carbs: 10, fat: 14, sodium: 850, allergens: ['전복', '닭고기'], cost: 6500, mainIngredients: ['전복', '닭고기'] },
];

export const sampleKimchi: MenuItem[] = [
  // 확률(가중치) 조정:
  // - 배추김치/깍두기: 가장 자주
  // - 그 외: 가끔
  { id: 'k1', name: '배추김치', category: 'kimchi', calories: 20, protein: 2, carbs: 4, fat: 0, sodium: 580, allergens: ['새우'], cost: 150, mainIngredients: ['배추', '김치'], weight: 30 },
  { id: 'k2', name: '깍두기', category: 'kimchi', calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 520, allergens: ['새우'], cost: 150, mainIngredients: ['무'], weight: 30 },
  { id: 'k3', name: '총각김치', category: 'kimchi', calories: 22, protein: 2, carbs: 4, fat: 0, sodium: 560, allergens: ['새우'], cost: 180, mainIngredients: ['총각무'], weight: 4 },
  { id: 'k4', name: '오이소박이', category: 'kimchi', calories: 18, protein: 1, carbs: 3, fat: 0, sodium: 480, allergens: ['새우'], cost: 200, mainIngredients: ['오이'], weight: 4 },
  { id: 'k5', name: '동치미', category: 'kimchi', calories: 15, protein: 1, carbs: 3, fat: 0, sodium: 420, allergens: [], cost: 180, mainIngredients: ['무'], weight: 3 },
  { id: 'k6', name: '파김치', category: 'kimchi', calories: 22, protein: 1, carbs: 4, fat: 0, sodium: 500, allergens: ['새우'], cost: 170, mainIngredients: ['파'], weight: 4 },
  { id: 'k7', name: '열무김치', category: 'kimchi', calories: 18, protein: 1, carbs: 3, fat: 0, sodium: 450, allergens: ['새우'], cost: 160, mainIngredients: ['열무'], weight: 4 },
];

export const sampleVegetables: MenuItem[] = [
  { id: 'v1', name: '시금치나물', category: 'vegetable', calories: 35, protein: 3, carbs: 4, fat: 1, sodium: 280, allergens: [], cost: 250, mainIngredients: ['시금치'] },
  { id: 'v2', name: '콩나물무침', category: 'vegetable', calories: 40, protein: 4, carbs: 5, fat: 1, sodium: 320, allergens: ['대두'], cost: 200, mainIngredients: ['콩나물'] },
  { id: 'v3', name: '오이무침', category: 'vegetable', calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 350, allergens: [], cost: 180, mainIngredients: ['오이'] },
  { id: 'v4', name: '미나리무침', category: 'vegetable', calories: 30, protein: 2, carbs: 4, fat: 1, sodium: 290, allergens: [], cost: 280, mainIngredients: ['미나리'] },
  { id: 'v5', name: '호박나물', category: 'vegetable', calories: 35, protein: 2, carbs: 6, fat: 1, sodium: 260, allergens: [], cost: 220, mainIngredients: ['호박'] },
  { id: 'v6', name: '무생채', category: 'vegetable', calories: 28, protein: 1, carbs: 6, fat: 0, sodium: 380, allergens: [], cost: 150, mainIngredients: ['무'] },
  { id: 'v7', name: '숙주나물', category: 'vegetable', calories: 25, protein: 3, carbs: 3, fat: 0, sodium: 250, allergens: [], cost: 180, mainIngredients: ['숙주'] },
  { id: 'v8', name: '고사리나물', category: 'vegetable', calories: 40, protein: 3, carbs: 5, fat: 2, sodium: 300, allergens: [], cost: 300, mainIngredients: ['고사리'] },
  { id: 'v9', name: '도라지무침', category: 'vegetable', calories: 32, protein: 2, carbs: 5, fat: 1, sodium: 270, allergens: [], cost: 320, mainIngredients: ['도라지'] },
  { id: 'v10', name: '취나물', category: 'vegetable', calories: 28, protein: 2, carbs: 4, fat: 1, sodium: 240, allergens: [], cost: 350, mainIngredients: ['취나물'] },
  { id: 'v11', name: '부추무침', category: 'vegetable', calories: 30, protein: 2, carbs: 4, fat: 1, sodium: 290, allergens: [], cost: 200, mainIngredients: ['부추'] },
  { id: 'v12', name: '깻잎무침', category: 'vegetable', calories: 25, protein: 2, carbs: 3, fat: 1, sodium: 260, allergens: [], cost: 280, mainIngredients: ['깻잎'] },
  { id: 'v13', name: '브로콜리무침', category: 'vegetable', calories: 35, protein: 3, carbs: 5, fat: 1, sodium: 220, allergens: [], cost: 300, mainIngredients: ['브로콜리'] },
  { id: 'v14', name: '당근나물', category: 'vegetable', calories: 30, protein: 1, carbs: 6, fat: 1, sodium: 250, allergens: [], cost: 180, mainIngredients: ['당근'] },
  { id: 'v15', name: '가지나물', category: 'vegetable', calories: 28, protein: 1, carbs: 5, fat: 1, sodium: 230, allergens: [], cost: 220, mainIngredients: ['가지'] },
  { id: 'v16', name: '파프리카볶음', category: 'vegetable', calories: 32, protein: 1, carbs: 6, fat: 1, sodium: 200, allergens: [], cost: 280, mainIngredients: ['파프리카'] },
  { id: 'v17', name: '양배추볶음', category: 'vegetable', calories: 30, protein: 2, carbs: 5, fat: 1, sodium: 220, allergens: [], cost: 180, mainIngredients: ['양배추'] },
  { id: 'v18', name: '청경채볶음', category: 'vegetable', calories: 25, protein: 2, carbs: 4, fat: 1, sodium: 200, allergens: [], cost: 250, mainIngredients: ['청경채'] },
  { id: 'v19', name: '비타민나물', category: 'vegetable', calories: 22, protein: 2, carbs: 3, fat: 1, sodium: 180, allergens: [], cost: 220, mainIngredients: ['비타민'] },
  { id: 'v20', name: '고춧잎무침', category: 'vegetable', calories: 28, protein: 2, carbs: 4, fat: 1, sodium: 260, allergens: [], cost: 280, mainIngredients: ['고춧잎'] },
  { id: 'v21', name: '콩잎무침', category: 'vegetable', calories: 32, protein: 3, carbs: 4, fat: 1, sodium: 290, allergens: ['대두'], cost: 300, mainIngredients: ['콩잎'] },
  { id: 'v22', name: '냉이무침', category: 'vegetable', calories: 26, protein: 2, carbs: 4, fat: 1, sodium: 240, allergens: [], cost: 320, mainIngredients: ['냉이'] },
  { id: 'v23', name: '달래무침', category: 'vegetable', calories: 28, protein: 2, carbs: 4, fat: 1, sodium: 270, allergens: [], cost: 350, mainIngredients: ['달래'] },
  { id: 'v24', name: '세발나물', category: 'vegetable', calories: 24, protein: 2, carbs: 3, fat: 1, sodium: 230, allergens: [], cost: 300, mainIngredients: ['세발나물'] },
  { id: 'v25', name: '머위나물', category: 'vegetable', calories: 30, protein: 2, carbs: 5, fat: 1, sodium: 260, allergens: [], cost: 320, mainIngredients: ['머위'] },
  { id: 'v26', name: '참나물무침', category: 'vegetable', calories: 26, protein: 2, carbs: 4, fat: 1, sodium: 240, allergens: [], cost: 280, mainIngredients: ['참나물'] },
  { id: 'v27', name: '두릅무침', category: 'vegetable', calories: 28, protein: 3, carbs: 4, fat: 1, sodium: 250, allergens: [], cost: 400, mainIngredients: ['두릅'] },
  { id: 'v28', name: '건표고버섯볶음', category: 'vegetable', calories: 35, protein: 3, carbs: 6, fat: 1, sodium: 280, allergens: [], cost: 350, mainIngredients: ['표고버섯'] },
  { id: 'v29', name: '느타리버섯볶음', category: 'vegetable', calories: 30, protein: 3, carbs: 5, fat: 1, sodium: 240, allergens: [], cost: 280, mainIngredients: ['느타리버섯'] },
  { id: 'v30', name: '새송이버섯구이', category: 'vegetable', calories: 32, protein: 3, carbs: 5, fat: 1, sodium: 220, allergens: [], cost: 300, mainIngredients: ['새송이버섯'] },
  { id: 'v31', name: '팽이버섯볶음', category: 'vegetable', calories: 25, protein: 2, carbs: 4, fat: 1, sodium: 200, allergens: [], cost: 220, mainIngredients: ['팽이버섯'] },
  { id: 'v32', name: '애호박볶음', category: 'vegetable', calories: 35, protein: 2, carbs: 6, fat: 1, sodium: 260, allergens: [], cost: 200, mainIngredients: ['애호박'] },
  { id: 'v33', name: '단호박찜', category: 'vegetable', calories: 45, protein: 2, carbs: 10, fat: 1, sodium: 150, allergens: [], cost: 280, mainIngredients: ['단호박'] },
  { id: 'v34', name: '무나물', category: 'vegetable', calories: 25, protein: 1, carbs: 5, fat: 1, sodium: 280, allergens: [], cost: 150, mainIngredients: ['무'] },
  { id: 'v35', name: '연근무침', category: 'vegetable', calories: 38, protein: 2, carbs: 8, fat: 1, sodium: 260, allergens: [], cost: 320, mainIngredients: ['연근'] },
  { id: 'v36', name: '쑥갓무침', category: 'vegetable', calories: 24, protein: 2, carbs: 3, fat: 1, sodium: 220, allergens: [], cost: 280, mainIngredients: ['쑥갓'] },
  { id: 'v37', name: '봄동무침', category: 'vegetable', calories: 22, protein: 2, carbs: 3, fat: 1, sodium: 240, allergens: [], cost: 260, mainIngredients: ['봄동'] },
  { id: 'v38', name: '배추나물', category: 'vegetable', calories: 25, protein: 2, carbs: 4, fat: 1, sodium: 230, allergens: [], cost: 180, mainIngredients: ['배추'] },
  { id: 'v39', name: '목이버섯볶음', category: 'vegetable', calories: 28, protein: 2, carbs: 5, fat: 1, sodium: 210, allergens: [], cost: 300, mainIngredients: ['목이버섯'] },
  { id: 'v40', name: '콩나물잡채', category: 'vegetable', calories: 45, protein: 4, carbs: 6, fat: 2, sodium: 320, allergens: ['대두'], cost: 250, mainIngredients: ['콩나물'] },
  { id: 'v41', name: '셀러리볶음', category: 'vegetable', calories: 22, protein: 1, carbs: 4, fat: 1, sodium: 200, allergens: [], cost: 280, mainIngredients: ['셀러리'] },
  { id: 'v42', name: '아스파라거스구이', category: 'vegetable', calories: 30, protein: 3, carbs: 4, fat: 1, sodium: 180, allergens: [], cost: 400, mainIngredients: ['아스파라거스'] },
  { id: 'v43', name: '양파볶음', category: 'vegetable', calories: 32, protein: 1, carbs: 7, fat: 1, sodium: 190, allergens: [], cost: 150, mainIngredients: ['양파'] },
  { id: 'v44', name: '피망볶음', category: 'vegetable', calories: 28, protein: 1, carbs: 5, fat: 1, sodium: 200, allergens: [], cost: 250, mainIngredients: ['피망'] },
  { id: 'v45', name: '케일무침', category: 'vegetable', calories: 30, protein: 3, carbs: 4, fat: 1, sodium: 220, allergens: [], cost: 320, mainIngredients: ['케일'] },
  { id: 'v46', name: '청포묵무침', category: 'vegetable', calories: 45, protein: 3, carbs: 8, fat: 1, sodium: 280, allergens: [], cost: 280, mainIngredients: ['청포묵'] },
  { id: 'v47', name: '도토리묵무침', category: 'vegetable', calories: 50, protein: 2, carbs: 10, fat: 1, sodium: 300, allergens: [], cost: 300, mainIngredients: ['도토리묵'] },
  { id: 'v48', name: '메밀묵무침', category: 'vegetable', calories: 48, protein: 3, carbs: 9, fat: 1, sodium: 290, allergens: ['메밀'], cost: 320, mainIngredients: ['메밀묵'] },
  { id: 'v49', name: '죽순볶음', category: 'vegetable', calories: 25, protein: 2, carbs: 4, fat: 1, sodium: 220, allergens: [], cost: 350, mainIngredients: ['죽순'] },
  { id: 'v50', name: '풋고추무침', category: 'vegetable', calories: 20, protein: 1, carbs: 4, fat: 0, sodium: 260, allergens: [], cost: 200, mainIngredients: ['풋고추'] },
  // 월간(4주) 중복 금지에서도 식단 생성이 멈추지 않도록 채소/나물 풀 확장
  { id: 'v51', name: '비트무침', category: 'vegetable', calories: 30, protein: 1, carbs: 6, fat: 1, sodium: 240, allergens: [], cost: 320, mainIngredients: ['비트'] },
  { id: 'v52', name: '토마토샐러드', category: 'vegetable', calories: 35, protein: 2, carbs: 7, fat: 1, sodium: 120, allergens: [], cost: 350, mainIngredients: ['토마토'] },
  { id: 'v53', name: '양상추샐러드', category: 'vegetable', calories: 25, protein: 2, carbs: 4, fat: 1, sodium: 120, allergens: [], cost: 300, mainIngredients: ['양상추'] },
  { id: 'v54', name: '컬리플라워볶음', category: 'vegetable', calories: 30, protein: 2, carbs: 5, fat: 1, sodium: 160, allergens: [], cost: 380, mainIngredients: ['컬리플라워'] },
  { id: 'v55', name: '부추겉절이', category: 'vegetable', calories: 28, protein: 2, carbs: 4, fat: 1, sodium: 260, allergens: [], cost: 220, mainIngredients: ['부추'] },
  { id: 'v56', name: '파래무침', category: 'vegetable', calories: 22, protein: 2, carbs: 3, fat: 1, sodium: 240, allergens: [], cost: 260, mainIngredients: ['파래'] },
  { id: 'v57', name: '톳무침', category: 'vegetable', calories: 26, protein: 2, carbs: 4, fat: 1, sodium: 260, allergens: [], cost: 320, mainIngredients: ['톳'] },
  { id: 'v58', name: '미역줄기볶음', category: 'vegetable', calories: 40, protein: 2, carbs: 6, fat: 2, sodium: 320, allergens: [], cost: 250, mainIngredients: ['미역줄기'] },
  { id: 'v59', name: '방울토마토무침', category: 'vegetable', calories: 30, protein: 1, carbs: 6, fat: 1, sodium: 180, allergens: [], cost: 320, mainIngredients: ['방울토마토'] },
  { id: 'v60', name: '브로콜리샐러드', category: 'vegetable', calories: 45, protein: 3, carbs: 6, fat: 2, sodium: 160, allergens: [], cost: 380, mainIngredients: ['브로콜리'] },
  { id: 'v61', name: '양배추샐러드', category: 'vegetable', calories: 35, protein: 2, carbs: 6, fat: 1, sodium: 160, allergens: [], cost: 300, mainIngredients: ['양배추'] },
  { id: 'v62', name: '비름나물', category: 'vegetable', calories: 24, protein: 2, carbs: 3, fat: 1, sodium: 220, allergens: [], cost: 280, mainIngredients: ['비름'] },
  { id: 'v63', name: '우거지나물', category: 'vegetable', calories: 28, protein: 2, carbs: 4, fat: 1, sodium: 260, allergens: [], cost: 280, mainIngredients: ['우거지'] },
  { id: 'v64', name: '열무나물', category: 'vegetable', calories: 26, protein: 2, carbs: 4, fat: 1, sodium: 240, allergens: [], cost: 260, mainIngredients: ['열무'] },
  { id: 'v65', name: '근대나물', category: 'vegetable', calories: 25, protein: 2, carbs: 3, fat: 1, sodium: 230, allergens: [], cost: 260, mainIngredients: ['근대'] },
];

export const sampleMeats: MenuItem[] = [
  { id: 'm1', name: '제육볶음', category: 'meat', calories: 280, protein: 22, carbs: 8, fat: 18, sodium: 680, allergens: ['돼지고기', '대두'], cost: 800, mainIngredients: ['돼지고기'] },
  { id: 'm2', name: '닭갈비', category: 'meat', calories: 250, protein: 24, carbs: 12, fat: 12, sodium: 720, allergens: ['닭고기', '대두'], cost: 750, mainIngredients: ['닭고기'] },
  { id: 'm3', name: '불고기', category: 'meat', calories: 290, protein: 25, carbs: 10, fat: 16, sodium: 650, allergens: ['쇠고기', '대두'], cost: 900, mainIngredients: ['소고기'] },
  { id: 'm4', name: '고등어구이', category: 'meat', calories: 200, protein: 20, carbs: 2, fat: 12, sodium: 480, allergens: ['고등어'], cost: 700, mainIngredients: ['고등어'] },
  { id: 'm5', name: '돈가스', category: 'meat', calories: 350, protein: 18, carbs: 25, fat: 20, sodium: 580, allergens: ['돼지고기', '밀', '달걀'], cost: 850, mainIngredients: ['돼지고기'] },
  { id: 'm6', name: '삼치구이', category: 'meat', calories: 180, protein: 22, carbs: 0, fat: 10, sodium: 400, allergens: [], cost: 750, mainIngredients: ['삼치'] },
  { id: 'm7', name: '닭볶음탕', category: 'meat', calories: 270, protein: 26, carbs: 15, fat: 12, sodium: 750, allergens: ['닭고기'], cost: 700, mainIngredients: ['닭고기', '감자'] },
  { id: 'm8', name: '갈치조림', category: 'meat', calories: 190, protein: 18, carbs: 8, fat: 9, sodium: 620, allergens: [], cost: 800, mainIngredients: ['갈치'] },
  { id: 'm9', name: '오징어볶음', category: 'meat', calories: 160, protein: 16, carbs: 10, fat: 6, sodium: 580, allergens: ['오징어'], cost: 650, mainIngredients: ['오징어'] },
  { id: 'm10', name: '소불고기', category: 'meat', calories: 300, protein: 26, carbs: 12, fat: 17, sodium: 680, allergens: ['쇠고기', '대두'], cost: 950, mainIngredients: ['소고기'] },
  { id: 'm11', name: '닭가슴살구이', category: 'meat', calories: 150, protein: 28, carbs: 2, fat: 3, sodium: 380, allergens: ['닭고기'], cost: 600, mainIngredients: ['닭가슴살'] },
  { id: 'm12', name: '장조림', category: 'meat', calories: 180, protein: 20, carbs: 8, fat: 8, sodium: 650, allergens: ['쇠고기', '대두'], cost: 700, mainIngredients: ['소고기'] },
  { id: 'm13', name: '동태전', category: 'meat', calories: 170, protein: 15, carbs: 10, fat: 8, sodium: 450, allergens: ['밀', '달걀'], cost: 550, mainIngredients: ['동태'] },
  { id: 'm14', name: '닭강정', category: 'meat', calories: 320, protein: 20, carbs: 25, fat: 16, sodium: 720, allergens: ['닭고기', '밀'], cost: 750, mainIngredients: ['닭고기'] },
  { id: 'm15', name: '너비아니', category: 'meat', calories: 260, protein: 22, carbs: 8, fat: 15, sodium: 600, allergens: ['쇠고기', '대두'], cost: 850, mainIngredients: ['소고기'] },
  { id: 'm16', name: '생선까스', category: 'meat', calories: 280, protein: 16, carbs: 22, fat: 15, sodium: 520, allergens: ['밀', '달걀'], cost: 650, mainIngredients: ['흰살생선'] },
  { id: 'm17', name: '코다리조림', category: 'meat', calories: 170, protein: 18, carbs: 10, fat: 6, sodium: 620, allergens: [], cost: 700, mainIngredients: ['코다리'] },
  { id: 'm18', name: '돼지갈비찜', category: 'meat', calories: 320, protein: 24, carbs: 12, fat: 20, sodium: 700, allergens: ['돼지고기', '대두'], cost: 900, mainIngredients: ['돼지갈비'] },
  { id: 'm19', name: '소갈비찜', category: 'meat', calories: 350, protein: 28, carbs: 10, fat: 22, sodium: 680, allergens: ['쇠고기', '대두'], cost: 1100, mainIngredients: ['소갈비'] },
  { id: 'm20', name: '조기구이', category: 'meat', calories: 160, protein: 20, carbs: 1, fat: 8, sodium: 450, allergens: [], cost: 800, mainIngredients: ['조기'] },
  { id: 'm21', name: '꽁치구이', category: 'meat', calories: 180, protein: 18, carbs: 0, fat: 12, sodium: 420, allergens: [], cost: 600, mainIngredients: ['꽁치'] },
  { id: 'm22', name: '가자미구이', category: 'meat', calories: 140, protein: 22, carbs: 0, fat: 5, sodium: 380, allergens: [], cost: 750, mainIngredients: ['가자미'] },
  { id: 'm23', name: '임연수구이', category: 'meat', calories: 150, protein: 20, carbs: 0, fat: 7, sodium: 400, allergens: [], cost: 700, mainIngredients: ['임연수'] },
  { id: 'm24', name: '닭튀김', category: 'meat', calories: 340, protein: 22, carbs: 18, fat: 22, sodium: 650, allergens: ['닭고기', '밀'], cost: 750, mainIngredients: ['닭고기'] },
  { id: 'm25', name: '돼지불고기', category: 'meat', calories: 270, protein: 20, carbs: 10, fat: 17, sodium: 620, allergens: ['돼지고기', '대두'], cost: 750, mainIngredients: ['돼지고기'] },
  { id: 'm26', name: '등심돈가스', category: 'meat', calories: 380, protein: 20, carbs: 28, fat: 22, sodium: 600, allergens: ['돼지고기', '밀', '달걀'], cost: 900, mainIngredients: ['돼지등심'] },
  { id: 'm27', name: '메기매운탕', category: 'meat', calories: 150, protein: 16, carbs: 8, fat: 6, sodium: 680, allergens: [], cost: 700, mainIngredients: ['메기'] },
  // 오징어(연체류)로 함께 제외되도록 allergens를 오징어로 통일
  { id: 'm28', name: '쭈꾸미볶음', category: 'meat', calories: 170, protein: 18, carbs: 8, fat: 7, sodium: 620, allergens: ['오징어'], cost: 800, mainIngredients: ['쭈꾸미'] },
  { id: 'm29', name: '낙지볶음', category: 'meat', calories: 165, protein: 17, carbs: 9, fat: 6, sodium: 640, allergens: ['오징어'], cost: 850, mainIngredients: ['낙지'] },
  { id: 'm30', name: '새우튀김', category: 'meat', calories: 220, protein: 14, carbs: 18, fat: 12, sodium: 480, allergens: ['새우', '밀'], cost: 700, mainIngredients: ['새우'] },
  { id: 'm31', name: '북어찜', category: 'meat', calories: 130, protein: 18, carbs: 6, fat: 4, sodium: 520, allergens: [], cost: 600, mainIngredients: ['북어'] },
  { id: 'm32', name: '닭살스테이크', category: 'meat', calories: 200, protein: 26, carbs: 4, fat: 9, sodium: 450, allergens: ['닭고기'], cost: 700, mainIngredients: ['닭다리살'] },
  { id: 'm33', name: '소고기장조림', category: 'meat', calories: 190, protein: 22, carbs: 8, fat: 8, sodium: 680, allergens: ['쇠고기', '대두'], cost: 750, mainIngredients: ['소고기'] },
  { id: 'm34', name: '햄버그스테이크', category: 'meat', calories: 280, protein: 18, carbs: 12, fat: 18, sodium: 550, allergens: ['쇠고기', '밀', '달걀'], cost: 800, mainIngredients: ['소고기'] },
  { id: 'm35', name: '훈제오리', category: 'meat', calories: 240, protein: 20, carbs: 2, fat: 17, sodium: 520, allergens: [], cost: 850, mainIngredients: ['오리'] },
  { id: 'm36', name: '고추장삼겹살', category: 'meat', calories: 320, protein: 18, carbs: 8, fat: 25, sodium: 720, allergens: ['돼지고기', '대두'], cost: 800, mainIngredients: ['삼겹살'] },
  { id: 'm37', name: '양념치킨', category: 'meat', calories: 350, protein: 22, carbs: 20, fat: 22, sodium: 750, allergens: ['닭고기', '밀'], cost: 800, mainIngredients: ['닭고기'] },
  { id: 'm38', name: '매운갈비찜', category: 'meat', calories: 340, protein: 26, carbs: 14, fat: 20, sodium: 750, allergens: ['쇠고기', '대두'], cost: 1000, mainIngredients: ['소갈비'] },
  { id: 'm39', name: '연어스테이크', category: 'meat', calories: 220, protein: 24, carbs: 2, fat: 13, sodium: 380, allergens: [], cost: 950, mainIngredients: ['연어'] },
  // 날것(회/육회)은 식중독 위험 때문에 기본 생성 후보에서 제외하고, 익힌 메뉴로 대체합니다.
  { id: 'm40', name: '광어구이(프리미엄)', category: 'meat', calories: 210, protein: 28, carbs: 1, fat: 11, sodium: 420, allergens: [], cost: 1200, mainIngredients: ['광어'] },
  { id: 'm41', name: '오리로스', category: 'meat', calories: 260, protein: 22, carbs: 4, fat: 18, sodium: 480, allergens: [], cost: 900, mainIngredients: ['오리'] },
  { id: 'm42', name: '돼지수육', category: 'meat', calories: 250, protein: 24, carbs: 2, fat: 16, sodium: 450, allergens: ['돼지고기'], cost: 700, mainIngredients: ['돼지고기'] },
  { id: 'm43', name: '소고기찹스테이크(프리미엄)', category: 'meat', calories: 320, protein: 26, carbs: 10, fat: 18, sodium: 520, allergens: ['쇠고기'], cost: 1100, mainIngredients: ['소고기'] },
  { id: 'm44', name: '닭꼬치구이', category: 'meat', calories: 200, protein: 22, carbs: 6, fat: 10, sodium: 520, allergens: ['닭고기'], cost: 600, mainIngredients: ['닭고기'] },
  { id: 'm45', name: '대패삼겹살', category: 'meat', calories: 350, protein: 16, carbs: 2, fat: 32, sodium: 480, allergens: ['돼지고기'], cost: 750, mainIngredients: ['삼겹살'] },
  { id: 'm46', name: '소고기전골', category: 'meat', calories: 280, protein: 24, carbs: 12, fat: 16, sodium: 720, allergens: ['쇠고기'], cost: 950, mainIngredients: ['소고기'] },
  { id: 'm47', name: '목살스테이크', category: 'meat', calories: 290, protein: 22, carbs: 4, fat: 20, sodium: 500, allergens: ['돼지고기'], cost: 800, mainIngredients: ['목살'] },
  { id: 'm48', name: '고추장불고기', category: 'meat', calories: 270, protein: 22, carbs: 12, fat: 15, sodium: 680, allergens: ['돼지고기', '대두'], cost: 750, mainIngredients: ['돼지고기'] },
  { id: 'm49', name: '등갈비구이', category: 'meat', calories: 340, protein: 24, carbs: 6, fat: 25, sodium: 620, allergens: ['돼지고기'], cost: 850, mainIngredients: ['등갈비'] },
  { id: 'm50', name: '대구포구이', category: 'meat', calories: 140, protein: 24, carbs: 2, fat: 4, sodium: 520, allergens: [], cost: 700, mainIngredients: ['대구포'] },
  // 알레르기 조합이 넓어도 생성이 멈추지 않도록 "단백질(대체)" 카테고리 아이템 추가 (알레르기 22종 미포함)
  { id: 'm51', name: '버섯스테이크', category: 'meat', calories: 180, protein: 8, carbs: 18, fat: 7, sodium: 320, allergens: [], cost: 650, mainIngredients: ['버섯', '양파'] },
  { id: 'm52', name: '채소구이 모둠', category: 'meat', calories: 160, protein: 5, carbs: 22, fat: 6, sodium: 280, allergens: [], cost: 600, mainIngredients: ['양배추', '파프리카', '버섯'] },
  { id: 'm53', name: '병아리콩 패티구이', category: 'meat', calories: 210, protein: 10, carbs: 28, fat: 6, sodium: 260, allergens: [], cost: 700, mainIngredients: ['병아리콩'] },
  // 고가(원재료율 높은) 옵션: 고예산(예: 1인 2만원)에서도 목표 금액에 근사치로 맞출 수 있도록 추가
  { id: 'm54', name: '한우등심구이(프리미엄)', category: 'meat', calories: 420, protein: 32, carbs: 2, fat: 32, sodium: 520, allergens: ['쇠고기'], cost: 9000, mainIngredients: ['소고기', '한우'] },
  { id: 'm55', name: '장어구이(프리미엄)', category: 'meat', calories: 380, protein: 28, carbs: 6, fat: 26, sodium: 640, allergens: [], cost: 6500, mainIngredients: ['장어'] },
  { id: 'm56', name: '대게찜(프리미엄)', category: 'meat', calories: 260, protein: 30, carbs: 2, fat: 12, sodium: 720, allergens: ['게'], cost: 8000, mainIngredients: ['게'] },
  { id: 'm57', name: '참치스테이크(프리미엄)', category: 'meat', calories: 330, protein: 38, carbs: 2, fat: 18, sodium: 520, allergens: [], cost: 7000, mainIngredients: ['참치'] },
  // 월간(4주) 중복 금지에서도 식단 생성이 멈추지 않도록 메인/단백질 풀 확장
  { id: 'm58', name: '닭안심구이', category: 'meat', calories: 170, protein: 30, carbs: 2, fat: 4, sodium: 380, allergens: ['닭고기'], cost: 650, mainIngredients: ['닭안심'] },
  { id: 'm59', name: '닭다리살구이', category: 'meat', calories: 240, protein: 24, carbs: 2, fat: 15, sodium: 420, allergens: ['닭고기'], cost: 750, mainIngredients: ['닭다리살'] },
  { id: 'm60', name: '돼지목살구이', category: 'meat', calories: 320, protein: 22, carbs: 2, fat: 25, sodium: 480, allergens: ['돼지고기'], cost: 850, mainIngredients: ['돼지목살'] },
  { id: 'm61', name: '돼지안심구이', category: 'meat', calories: 220, protein: 28, carbs: 2, fat: 10, sodium: 420, allergens: ['돼지고기'], cost: 850, mainIngredients: ['돼지안심'] },
  { id: 'm62', name: '소고기불고기(간장)', category: 'meat', calories: 300, protein: 26, carbs: 12, fat: 17, sodium: 680, allergens: ['쇠고기', '대두'], cost: 950, mainIngredients: ['소고기'] },
  { id: 'm63', name: '소고기채소볶음', category: 'meat', calories: 280, protein: 24, carbs: 10, fat: 16, sodium: 620, allergens: ['쇠고기'], cost: 900, mainIngredients: ['소고기', '파프리카'] },
  { id: 'm64', name: '소고기미역볶음', category: 'meat', calories: 260, protein: 22, carbs: 8, fat: 14, sodium: 580, allergens: ['쇠고기'], cost: 850, mainIngredients: ['소고기', '미역'] },
  { id: 'm65', name: '돼지고기김치볶음', category: 'meat', calories: 290, protein: 20, carbs: 8, fat: 20, sodium: 750, allergens: ['돼지고기', '새우'], cost: 800, mainIngredients: ['돼지고기', '김치'] },
  { id: 'm66', name: '닭볶음(간장)', category: 'meat', calories: 260, protein: 26, carbs: 10, fat: 12, sodium: 650, allergens: ['닭고기', '대두'], cost: 750, mainIngredients: ['닭고기'] },
  { id: 'm67', name: '훈제오리볶음', category: 'meat', calories: 280, protein: 20, carbs: 6, fat: 18, sodium: 520, allergens: [], cost: 900, mainIngredients: ['오리'] },
  { id: 'm68', name: '두부스테이크', category: 'meat', calories: 220, protein: 14, carbs: 16, fat: 10, sodium: 360, allergens: ['대두'], cost: 700, mainIngredients: ['두부'] },
  { id: 'm69', name: '계란프리타타', category: 'meat', calories: 240, protein: 14, carbs: 8, fat: 16, sodium: 420, allergens: ['달걀', '우유'], cost: 750, mainIngredients: ['달걀'] },
  { id: 'm70', name: '연어구이(허브)', category: 'meat', calories: 230, protein: 24, carbs: 2, fat: 14, sodium: 380, allergens: [], cost: 1100, mainIngredients: ['연어'] },
  { id: 'm71', name: '대구구이', category: 'meat', calories: 170, protein: 26, carbs: 0, fat: 6, sodium: 380, allergens: [], cost: 900, mainIngredients: ['대구'] },
  { id: 'm72', name: '고등어조림', category: 'meat', calories: 220, protein: 20, carbs: 8, fat: 12, sodium: 650, allergens: ['고등어'], cost: 800, mainIngredients: ['고등어'] },
];

export const sampleSides: MenuItem[] = [
  { id: 'sd1', name: '계란말이', category: 'side', calories: 120, protein: 8, carbs: 2, fat: 9, sodium: 320, allergens: ['달걀'], cost: 300, mainIngredients: ['달걀'] },
  { id: 'sd2', name: '어묵볶음', category: 'side', calories: 90, protein: 6, carbs: 10, fat: 3, sodium: 450, allergens: ['밀'], cost: 250, mainIngredients: ['어묵'] },
  { id: 'sd3', name: '두부조림', category: 'side', calories: 100, protein: 8, carbs: 6, fat: 5, sodium: 420, allergens: ['대두'], cost: 280, mainIngredients: ['두부'] },
  { id: 'sd4', name: '멸치볶음', category: 'side', calories: 80, protein: 10, carbs: 5, fat: 3, sodium: 380, allergens: [], cost: 350, mainIngredients: ['멸치'] },
  { id: 'sd5', name: '감자조림', category: 'side', calories: 110, protein: 2, carbs: 22, fat: 2, sodium: 350, allergens: [], cost: 200, mainIngredients: ['감자'] },
  { id: 'sd6', name: '잡채', category: 'side', calories: 150, protein: 5, carbs: 20, fat: 6, sodium: 420, allergens: ['밀', '대두'], cost: 400, mainIngredients: ['당면', '시금치'] },
  { id: 'sd7', name: '메추리알장조림', category: 'side', calories: 100, protein: 9, carbs: 5, fat: 6, sodium: 400, allergens: ['달걀'], cost: 350, mainIngredients: ['메추리알'] },
  { id: 'sd8', name: '콩자반', category: 'side', calories: 90, protein: 7, carbs: 10, fat: 3, sodium: 380, allergens: ['대두'], cost: 280, mainIngredients: ['콩'] },
  { id: 'sd9', name: '진미채볶음', category: 'side', calories: 95, protein: 8, carbs: 12, fat: 2, sodium: 420, allergens: ['오징어'], cost: 380, mainIngredients: ['진미채'] },
  { id: 'sd10', name: '연근조림', category: 'side', calories: 85, protein: 2, carbs: 18, fat: 1, sodium: 360, allergens: [], cost: 320, mainIngredients: ['연근'] },
  { id: 'sd11', name: '우엉조림', category: 'side', calories: 75, protein: 2, carbs: 15, fat: 1, sodium: 340, allergens: [], cost: 280, mainIngredients: ['우엉'] },
  { id: 'sd12', name: '깻잎장아찌', category: 'side', calories: 45, protein: 2, carbs: 6, fat: 2, sodium: 480, allergens: [], cost: 250, mainIngredients: ['깻잎'] },
  { id: 'sd13', name: '황태채볶음', category: 'side', calories: 100, protein: 12, carbs: 8, fat: 3, sodium: 400, allergens: [], cost: 400, mainIngredients: ['황태'] },
  { id: 'sd14', name: '꽈리고추멸치볶음', category: 'side', calories: 90, protein: 8, carbs: 8, fat: 4, sodium: 390, allergens: [], cost: 350, mainIngredients: ['꽈리고추', '멸치'] },
  { id: 'sd15', name: '마늘쫑무침', category: 'side', calories: 55, protein: 2, carbs: 10, fat: 1, sodium: 280, allergens: [], cost: 280, mainIngredients: ['마늘쫑'] },
  { id: 'sd16', name: '버섯볶음', category: 'side', calories: 50, protein: 3, carbs: 6, fat: 2, sodium: 250, allergens: [], cost: 300, mainIngredients: ['버섯'] },
  { id: 'sd17', name: '계란찜', category: 'side', calories: 90, protein: 7, carbs: 2, fat: 6, sodium: 280, allergens: ['달걀'], cost: 280, mainIngredients: ['달걀'] },
  { id: 'sd18', name: '북어채볶음', category: 'side', calories: 85, protein: 10, carbs: 6, fat: 2, sodium: 350, allergens: [], cost: 380, mainIngredients: ['북어채'] },
  { id: 'sd19', name: '고구마맛탕', category: 'side', calories: 150, protein: 1, carbs: 30, fat: 4, sodium: 50, allergens: [], cost: 350, mainIngredients: ['고구마'] },
  { id: 'sd20', name: '소시지볶음', category: 'side', calories: 180, protein: 8, carbs: 5, fat: 15, sodium: 520, allergens: ['돼지고기'], cost: 400, mainIngredients: ['소시지'] },
  { id: 'sd21', name: '오뎅탕', category: 'side', calories: 80, protein: 6, carbs: 8, fat: 3, sodium: 480, allergens: ['밀'], cost: 280, mainIngredients: ['어묵'] },
  { id: 'sd22', name: '견과류조림', category: 'side', calories: 180, protein: 5, carbs: 15, fat: 12, sodium: 200, allergens: ['땅콩'], cost: 450, mainIngredients: ['견과류'] },
  { id: 'sd23', name: '호두멸치볶음', category: 'side', calories: 140, protein: 8, carbs: 8, fat: 10, sodium: 320, allergens: ['호두'], cost: 420, mainIngredients: ['호두', '멸치'] },
  { id: 'sd24', name: '미니햄버거', category: 'side', calories: 160, protein: 8, carbs: 15, fat: 8, sodium: 380, allergens: ['밀', '달걀'], cost: 400, mainIngredients: ['패티', '빵'] },
  { id: 'sd25', name: '치즈스틱', category: 'side', calories: 140, protein: 6, carbs: 12, fat: 8, sodium: 350, allergens: ['우유', '밀'], cost: 350, mainIngredients: ['치즈'] },
  { id: 'sd26', name: '베이컨말이', category: 'side', calories: 150, protein: 8, carbs: 4, fat: 12, sodium: 420, allergens: ['돼지고기'], cost: 380, mainIngredients: ['베이컨'] },
  { id: 'sd27', name: '야채전', category: 'side', calories: 100, protein: 4, carbs: 12, fat: 5, sodium: 300, allergens: ['밀', '달걀'], cost: 280, mainIngredients: ['야채'] },
  { id: 'sd28', name: '김치전', category: 'side', calories: 120, protein: 5, carbs: 14, fat: 5, sodium: 450, allergens: ['밀', '달걀', '새우'], cost: 300, mainIngredients: ['김치'] },
  { id: 'sd29', name: '동그랑땡', category: 'side', calories: 130, protein: 8, carbs: 8, fat: 8, sodium: 380, allergens: ['밀', '달걀', '돼지고기'], cost: 320, mainIngredients: ['돼지고기'] },
  { id: 'sd30', name: '깐풍기', category: 'side', calories: 200, protein: 14, carbs: 15, fat: 10, sodium: 520, allergens: ['닭고기', '밀'], cost: 450, mainIngredients: ['닭고기'] },
  { id: 'sd31', name: '새우젓무침', category: 'side', calories: 35, protein: 4, carbs: 3, fat: 1, sodium: 680, allergens: ['새우'], cost: 280, mainIngredients: ['새우젓'] },
  { id: 'sd32', name: '오징어젓갈', category: 'side', calories: 45, protein: 6, carbs: 4, fat: 1, sodium: 720, allergens: ['오징어'], cost: 320, mainIngredients: ['오징어젓'] },
  { id: 'sd33', name: '낙지젓갈', category: 'side', calories: 40, protein: 5, carbs: 3, fat: 1, sodium: 680, allergens: ['연체류'], cost: 350, mainIngredients: ['낙지젓'] },
  { id: 'sd34', name: '두부구이', category: 'side', calories: 90, protein: 8, carbs: 4, fat: 5, sodium: 280, allergens: ['대두'], cost: 250, mainIngredients: ['두부'] },
  { id: 'sd35', name: '순대볶음', category: 'side', calories: 180, protein: 10, carbs: 15, fat: 10, sodium: 480, allergens: ['돼지고기', '밀'], cost: 420, mainIngredients: ['순대'] },
  { id: 'sd36', name: '쥐포구이', category: 'side', calories: 70, protein: 12, carbs: 3, fat: 1, sodium: 450, allergens: [], cost: 350, mainIngredients: ['쥐포'] },
  { id: 'sd37', name: '마른오징어구이', category: 'side', calories: 80, protein: 15, carbs: 2, fat: 1, sodium: 520, allergens: ['오징어'], cost: 400, mainIngredients: ['오징어'] },
  { id: 'sd38', name: '새송이장조림', category: 'side', calories: 60, protein: 3, carbs: 10, fat: 1, sodium: 380, allergens: [], cost: 300, mainIngredients: ['새송이'] },
  { id: 'sd39', name: '표고버섯장조림', category: 'side', calories: 65, protein: 3, carbs: 12, fat: 1, sodium: 400, allergens: [], cost: 350, mainIngredients: ['표고버섯'] },
  { id: 'sd40', name: '어리굴젓', category: 'side', calories: 50, protein: 6, carbs: 3, fat: 2, sodium: 720, allergens: ['굴'], cost: 450, mainIngredients: ['굴'] },
  { id: 'sd41', name: '양파장아찌', category: 'side', calories: 30, protein: 1, carbs: 7, fat: 0, sodium: 520, allergens: [], cost: 200, mainIngredients: ['양파'] },
  { id: 'sd42', name: '고추장아찌', category: 'side', calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 480, allergens: [], cost: 220, mainIngredients: ['고추'] },
  { id: 'sd43', name: '무말랭이무침', category: 'side', calories: 45, protein: 2, carbs: 9, fat: 1, sodium: 420, allergens: [], cost: 250, mainIngredients: ['무말랭이'] },
  { id: 'sd44', name: '간장게장', category: 'side', calories: 70, protein: 8, carbs: 4, fat: 3, sodium: 850, allergens: ['게'], cost: 600, mainIngredients: ['게'] },
  { id: 'sd45', name: '양념게장', category: 'side', calories: 80, protein: 8, carbs: 6, fat: 3, sodium: 780, allergens: ['게'], cost: 650, mainIngredients: ['게'] },
  { id: 'sd46', name: '김구이', category: 'side', calories: 25, protein: 2, carbs: 2, fat: 1, sodium: 280, allergens: [], cost: 150, mainIngredients: ['김'] },
  { id: 'sd47', name: '명란젓', category: 'side', calories: 60, protein: 8, carbs: 2, fat: 2, sodium: 750, allergens: [], cost: 500, mainIngredients: ['명란'] },
  { id: 'sd48', name: '창란젓', category: 'side', calories: 55, protein: 7, carbs: 3, fat: 2, sodium: 720, allergens: [], cost: 480, mainIngredients: ['창란'] },
  { id: 'sd49', name: '감자채볶음', category: 'side', calories: 95, protein: 2, carbs: 18, fat: 2, sodium: 280, allergens: [], cost: 220, mainIngredients: ['감자'] },
  { id: 'sd50', name: '떡갈비', category: 'side', calories: 200, protein: 14, carbs: 10, fat: 12, sodium: 480, allergens: ['쇠고기', '밀'], cost: 500, mainIngredients: ['소고기'] },
  // 고가(원재료율 높은) 옵션: 목표 원가를 5,000원 이상으로 잡을 때 근사치로 맞추기 위한 "가격 부스터" 역할
  { id: 'sd51', name: '과일컵(사과/바나나)', category: 'side', calories: 160, protein: 2, carbs: 38, fat: 1, sodium: 5, allergens: [], cost: 1500, mainIngredients: ['사과', '바나나'] },
  { id: 'sd52', name: '치즈플래터(프리미엄)', category: 'side', calories: 260, protein: 14, carbs: 6, fat: 20, sodium: 420, allergens: ['우유'], cost: 2800, mainIngredients: ['치즈'] },
  { id: 'sd53', name: '견과샐러드(프리미엄)', category: 'side', calories: 240, protein: 6, carbs: 14, fat: 18, sodium: 120, allergens: ['호두', '잣'], cost: 2600, mainIngredients: ['샐러드', '호두', '잣'] },
  { id: 'sd54', name: '훈제연어샐러드(프리미엄)', category: 'side', calories: 280, protein: 22, carbs: 10, fat: 16, sodium: 420, allergens: [], cost: 3200, mainIngredients: ['연어', '샐러드'] },
  { id: 'sd55', name: '전복버터구이(프리미엄)', category: 'side', calories: 220, protein: 18, carbs: 6, fat: 14, sodium: 520, allergens: ['전복', '우유'], cost: 4500, mainIngredients: ['전복', '버터'] },
  // 월간(4주) 중복 금지에서도 식단 생성이 멈추지 않도록 추가 반찬 풀 확장
  { id: 'sd56', name: '감자샐러드', category: 'side', calories: 140, protein: 3, carbs: 18, fat: 6, sodium: 260, allergens: ['우유', '달걀'], cost: 420, mainIngredients: ['감자'] },
  { id: 'sd57', name: '콘샐러드', category: 'side', calories: 160, protein: 3, carbs: 20, fat: 7, sodium: 240, allergens: ['우유'], cost: 450, mainIngredients: ['옥수수'] },
  { id: 'sd58', name: '단호박샐러드', category: 'side', calories: 150, protein: 3, carbs: 22, fat: 6, sodium: 220, allergens: ['우유'], cost: 480, mainIngredients: ['단호박'] },
  { id: 'sd59', name: '크래미샐러드', category: 'side', calories: 140, protein: 6, carbs: 12, fat: 7, sodium: 420, allergens: ['게', '밀', '달걀'], cost: 500, mainIngredients: ['크래미'] },
  { id: 'sd60', name: '두부샐러드', category: 'side', calories: 120, protein: 8, carbs: 8, fat: 6, sodium: 240, allergens: ['대두'], cost: 450, mainIngredients: ['두부'] },
  { id: 'sd61', name: '연두부(간장)', category: 'side', calories: 90, protein: 7, carbs: 4, fat: 4, sodium: 320, allergens: ['대두'], cost: 350, mainIngredients: ['연두부'] },
  { id: 'sd62', name: '옥수수버터구이', category: 'side', calories: 180, protein: 4, carbs: 26, fat: 7, sodium: 220, allergens: ['우유'], cost: 520, mainIngredients: ['옥수수', '버터'] },
  { id: 'sd63', name: '감자전', category: 'side', calories: 160, protein: 3, carbs: 24, fat: 6, sodium: 280, allergens: ['달걀'], cost: 450, mainIngredients: ['감자'] },
  { id: 'sd64', name: '김말이튀김', category: 'side', calories: 170, protein: 4, carbs: 22, fat: 8, sodium: 380, allergens: ['밀'], cost: 450, mainIngredients: ['김말이'] },
  { id: 'sd65', name: '만두(찐)', category: 'side', calories: 210, protein: 8, carbs: 28, fat: 8, sodium: 520, allergens: ['밀', '돼지고기'], cost: 500, mainIngredients: ['만두'] },
  { id: 'sd66', name: '만두(튀김)', category: 'side', calories: 260, protein: 8, carbs: 30, fat: 12, sodium: 560, allergens: ['밀', '돼지고기'], cost: 550, mainIngredients: ['만두'] },
  { id: 'sd67', name: '새우완자', category: 'side', calories: 180, protein: 10, carbs: 10, fat: 10, sodium: 420, allergens: ['새우', '달걀'], cost: 520, mainIngredients: ['새우'] },
  { id: 'sd68', name: '고기완자', category: 'side', calories: 220, protein: 12, carbs: 10, fat: 14, sodium: 520, allergens: ['돼지고기', '달걀'], cost: 520, mainIngredients: ['돼지고기'] },
  { id: 'sd69', name: '채소완자', category: 'side', calories: 160, protein: 6, carbs: 18, fat: 7, sodium: 420, allergens: ['달걀'], cost: 480, mainIngredients: ['채소'] },
  { id: 'sd70', name: '버섯전', category: 'side', calories: 140, protein: 6, carbs: 12, fat: 7, sodium: 320, allergens: ['달걀', '밀'], cost: 450, mainIngredients: ['버섯'] },
  { id: 'sd71', name: '애호박전', category: 'side', calories: 150, protein: 4, carbs: 14, fat: 8, sodium: 320, allergens: ['달걀', '밀'], cost: 420, mainIngredients: ['애호박'] },
  { id: 'sd72', name: '버섯튀김', category: 'side', calories: 200, protein: 5, carbs: 22, fat: 10, sodium: 380, allergens: ['밀'], cost: 480, mainIngredients: ['버섯'] },
  { id: 'sd73', name: '고구마튀김', category: 'side', calories: 220, protein: 2, carbs: 34, fat: 8, sodium: 260, allergens: ['밀'], cost: 480, mainIngredients: ['고구마'] },
  { id: 'sd74', name: '단호박튀김', category: 'side', calories: 210, protein: 2, carbs: 30, fat: 9, sodium: 260, allergens: ['밀'], cost: 480, mainIngredients: ['단호박'] },
  { id: 'sd75', name: '오징어링튀김', category: 'side', calories: 240, protein: 10, carbs: 26, fat: 12, sodium: 520, allergens: ['오징어', '밀'], cost: 520, mainIngredients: ['오징어'] },
  { id: 'sd76', name: '치킨너겟', category: 'side', calories: 260, protein: 12, carbs: 18, fat: 14, sodium: 520, allergens: ['닭고기', '밀'], cost: 520, mainIngredients: ['닭고기'] },
  { id: 'sd77', name: '치킨가라아게', category: 'side', calories: 320, protein: 18, carbs: 16, fat: 20, sodium: 620, allergens: ['닭고기', '밀'], cost: 650, mainIngredients: ['닭고기'] },
  { id: 'sd78', name: '돼지고기탕수', category: 'side', calories: 320, protein: 16, carbs: 28, fat: 16, sodium: 680, allergens: ['돼지고기', '밀'], cost: 650, mainIngredients: ['돼지고기'] },
  { id: 'sd79', name: '가지튀김', category: 'side', calories: 190, protein: 3, carbs: 22, fat: 9, sodium: 320, allergens: ['밀'], cost: 480, mainIngredients: ['가지'] },
  { id: 'sd80', name: '크로켓(감자)', category: 'side', calories: 240, protein: 5, carbs: 30, fat: 10, sodium: 520, allergens: ['밀', '달걀', '우유'], cost: 620, mainIngredients: ['감자'] },
  { id: 'sd81', name: '크로켓(카레)', category: 'side', calories: 250, protein: 5, carbs: 32, fat: 10, sodium: 540, allergens: ['밀', '달걀', '우유'], cost: 650, mainIngredients: ['감자', '카레'] },
  { id: 'sd82', name: '소떡소떡', category: 'side', calories: 320, protein: 12, carbs: 30, fat: 18, sodium: 820, allergens: ['돼지고기', '밀'], cost: 650, mainIngredients: ['소시지', '떡'] },
  { id: 'sd83', name: '떡꼬치', category: 'side', calories: 280, protein: 6, carbs: 46, fat: 8, sodium: 520, allergens: [], cost: 600, mainIngredients: ['떡'] },
  { id: 'sd84', name: '시리얼(우유)', category: 'side', calories: 220, protein: 8, carbs: 36, fat: 6, sodium: 260, allergens: ['우유', '밀'], cost: 520, mainIngredients: ['시리얼', '우유'] },
  { id: 'sd85', name: '브리또(치킨)', category: 'side', calories: 380, protein: 18, carbs: 42, fat: 14, sodium: 780, allergens: ['밀', '닭고기', '우유'], cost: 900, mainIngredients: ['또띠아', '닭고기'] },
  { id: 'sd86', name: '브리또(소고기)', category: 'side', calories: 420, protein: 18, carbs: 44, fat: 16, sodium: 820, allergens: ['밀', '쇠고기', '우유'], cost: 950, mainIngredients: ['또띠아', '소고기'] },
  { id: 'sd87', name: '타코(치킨)', category: 'side', calories: 260, protein: 12, carbs: 30, fat: 10, sodium: 620, allergens: ['밀', '닭고기'], cost: 650, mainIngredients: ['또띠아', '닭고기'] },
  { id: 'sd88', name: '타코(새우)', category: 'side', calories: 260, protein: 12, carbs: 28, fat: 10, sodium: 620, allergens: ['밀', '새우'], cost: 700, mainIngredients: ['또띠아', '새우'] },
  { id: 'sd89', name: '파스타샐러드', category: 'side', calories: 240, protein: 8, carbs: 34, fat: 8, sodium: 420, allergens: ['밀', '우유'], cost: 650, mainIngredients: ['파스타'] },
  { id: 'sd90', name: '쿠스쿠스샐러드', category: 'side', calories: 220, protein: 6, carbs: 36, fat: 6, sodium: 240, allergens: ['밀'], cost: 650, mainIngredients: ['쿠스쿠스'] },
  { id: 'sd91', name: '오이피클', category: 'side', calories: 20, protein: 1, carbs: 4, fat: 0, sodium: 480, allergens: [], cost: 180, mainIngredients: ['오이'] },
  { id: 'sd92', name: '비트피클', category: 'side', calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 480, allergens: [], cost: 200, mainIngredients: ['비트'] },
  { id: 'sd93', name: '양배추피클', category: 'side', calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 480, allergens: [], cost: 180, mainIngredients: ['양배추'] },
  { id: 'sd94', name: '올리브절임', category: 'side', calories: 80, protein: 1, carbs: 3, fat: 7, sodium: 520, allergens: [], cost: 350, mainIngredients: ['올리브'] },
  { id: 'sd95', name: '해초샐러드', category: 'side', calories: 60, protein: 2, carbs: 10, fat: 1, sodium: 380, allergens: [], cost: 420, mainIngredients: ['해초'] },
];

export const sampleSnacks: MenuItem[] = [
  { id: 'sn1', name: '과일 (사과)', category: 'side', calories: 95, protein: 0, carbs: 25, fat: 0, sodium: 2, allergens: [], cost: 500, mainIngredients: ['사과'] },
  { id: 'sn2', name: '과일 (바나나)', category: 'side', calories: 105, protein: 1, carbs: 27, fat: 0, sodium: 1, allergens: [], cost: 300, mainIngredients: ['바나나'] },
  { id: 'sn3', name: '요거트', category: 'side', calories: 100, protein: 6, carbs: 15, fat: 2, sodium: 80, allergens: ['우유'], cost: 400, mainIngredients: ['요거트'] },
  { id: 'sn4', name: '삶은 달걀', category: 'side', calories: 78, protein: 6, carbs: 1, fat: 5, sodium: 62, allergens: ['달걀'], cost: 200, mainIngredients: ['달걀'] },
  { id: 'sn5', name: '우유', category: 'side', calories: 150, protein: 8, carbs: 12, fat: 8, sodium: 120, allergens: ['우유'], cost: 350, mainIngredients: ['우유'] },
  { id: 'sn6', name: '고구마', category: 'side', calories: 130, protein: 2, carbs: 30, fat: 0, sodium: 40, allergens: [], cost: 300, mainIngredients: ['고구마'] },
  { id: 'sn7', name: '과일 (귤)', category: 'side', calories: 47, protein: 1, carbs: 12, fat: 0, sodium: 2, allergens: [], cost: 200, mainIngredients: ['귤'] },
  { id: 'sn8', name: '과일 (포도)', category: 'side', calories: 69, protein: 1, carbs: 18, fat: 0, sodium: 2, allergens: [], cost: 400, mainIngredients: ['포도'] },
  { id: 'sn9', name: '과일 (딸기)', category: 'side', calories: 32, protein: 1, carbs: 8, fat: 0, sodium: 1, allergens: [], cost: 500, mainIngredients: ['딸기'] },
  { id: 'sn10', name: '과일 (수박)', category: 'side', calories: 46, protein: 1, carbs: 12, fat: 0, sodium: 2, allergens: [], cost: 300, mainIngredients: ['수박'] },
  { id: 'sn11', name: '과일 (참외)', category: 'side', calories: 31, protein: 1, carbs: 7, fat: 0, sodium: 14, allergens: [], cost: 350, mainIngredients: ['참외'] },
  // 복숭아는 알레르기 22종에 포함되므로 표시/필터가 정확히 동작하도록 allergens를 채웁니다.
  { id: 'sn12', name: '과일 (복숭아)', category: 'side', calories: 39, protein: 1, carbs: 10, fat: 0, sodium: 0, allergens: ['복숭아'], cost: 450, mainIngredients: ['복숭아'] },
  { id: 'sn13', name: '떡 (백설기)', category: 'side', calories: 120, protein: 2, carbs: 28, fat: 0, sodium: 50, allergens: [], cost: 300, mainIngredients: ['쌀'] },
  { id: 'sn14', name: '떡 (인절미)', category: 'side', calories: 130, protein: 3, carbs: 28, fat: 1, sodium: 30, allergens: ['대두'], cost: 350, mainIngredients: ['찹쌀'] },
  { id: 'sn15', name: '떡 (송편)', category: 'side', calories: 110, protein: 2, carbs: 24, fat: 1, sodium: 40, allergens: [], cost: 400, mainIngredients: ['쌀'] },
  { id: 'sn16', name: '두유', category: 'side', calories: 120, protein: 7, carbs: 10, fat: 5, sodium: 100, allergens: ['대두'], cost: 300, mainIngredients: ['두유'] },
  { id: 'sn17', name: '치즈', category: 'side', calories: 110, protein: 7, carbs: 1, fat: 9, sodium: 180, allergens: ['우유'], cost: 350, mainIngredients: ['치즈'] },
  { id: 'sn18', name: '견과류', category: 'side', calories: 160, protein: 5, carbs: 6, fat: 14, sodium: 5, allergens: ['땅콩'], cost: 400, mainIngredients: ['견과류'] },
  { id: 'sn19', name: '식빵 (잼)', category: 'side', calories: 150, protein: 4, carbs: 28, fat: 3, sodium: 200, allergens: ['밀'], cost: 250, mainIngredients: ['식빵'] },
  { id: 'sn20', name: '옥수수', category: 'side', calories: 90, protein: 3, carbs: 19, fat: 1, sodium: 15, allergens: [], cost: 300, mainIngredients: ['옥수수'] },
];

// 특별식 세트 타입
export interface SpecialMealSet {
  rice: MenuItem;
  soup: MenuItem;
  sideDishes: MenuItem[];
}

// 특별식 추가 반찬 풀
// - 특별식도 예산/원가비율에 따라 반찬 가짓수가 늘어날 수 있으므로, 세트 외에 채울 수 있는 후보를 준비합니다.
// - 날것(회/육회) 제외
export const specialExtraSides: Record<string, MenuItem[]> = {
  japanese: [
    { id: 'jp-ex-1', name: '가라아게(추가)', category: 'meat', calories: 240, protein: 18, carbs: 10, fat: 14, sodium: 420, allergens: ['닭고기', '밀'], cost: 650, mainIngredients: ['닭고기'] },
    { id: 'jp-ex-2', name: '타마고야끼(추가)', category: 'side', calories: 110, protein: 8, carbs: 4, fat: 7, sodium: 280, allergens: ['달걀'], cost: 320, mainIngredients: ['달걀'] },
    { id: 'jp-ex-3', name: '에다마메', category: 'side', calories: 120, protein: 11, carbs: 9, fat: 5, sodium: 220, allergens: ['대두'], cost: 350, mainIngredients: ['대두'] },
    { id: 'jp-ex-4', name: '감자샐러드(추가)', category: 'vegetable', calories: 140, protein: 3, carbs: 18, fat: 6, sodium: 280, allergens: ['달걀'], cost: 280, mainIngredients: ['감자'] },
    { id: 'jp-ex-5', name: '오이절임(추가)', category: 'kimchi', calories: 18, protein: 1, carbs: 4, fat: 0, sodium: 320, allergens: [], cost: 140, mainIngredients: ['오이'] },
    { id: 'jp-ex-6', name: '유부주머니', category: 'side', calories: 160, protein: 7, carbs: 12, fat: 9, sodium: 420, allergens: ['대두'], cost: 450, mainIngredients: ['유부'] },
    // 고가 옵션 (고예산 근사치용)
    { id: 'jp-ex-7', name: '장어구이(추가)', category: 'meat', calories: 320, protein: 24, carbs: 6, fat: 22, sodium: 520, allergens: [], cost: 5200, mainIngredients: ['장어'] },
    { id: 'jp-ex-8', name: '한우스키야키(추가)', category: 'meat', calories: 380, protein: 28, carbs: 10, fat: 24, sodium: 680, allergens: ['쇠고기', '대두'], cost: 6500, mainIngredients: ['소고기'] },
    { id: 'jp-ex-9', name: '치즈가츠(추가)', category: 'meat', calories: 420, protein: 20, carbs: 26, fat: 26, sodium: 680, allergens: ['돼지고기', '밀', '달걀', '우유'], cost: 1800, mainIngredients: ['돼지고기', '치즈'] },
    { id: 'jp-ex-10', name: '미니샐러드(추가)', category: 'vegetable', calories: 70, protein: 2, carbs: 6, fat: 5, sodium: 180, allergens: [], cost: 350, mainIngredients: ['샐러드'] },
  ],
  chinese: [
    { id: 'cn-ex-1', name: '탕수육(추가)', category: 'meat', calories: 300, protein: 16, carbs: 26, fat: 16, sodium: 520, allergens: ['돼지고기', '밀'], cost: 700, mainIngredients: ['돼지고기'] },
    { id: 'cn-ex-2', name: '군만두(추가)', category: 'side', calories: 190, protein: 8, carbs: 22, fat: 8, sodium: 380, allergens: ['밀', '돼지고기'], cost: 320, mainIngredients: ['만두'] },
    { id: 'cn-ex-3', name: '짜사이(추가)', category: 'kimchi', calories: 15, protein: 1, carbs: 3, fat: 0, sodium: 450, allergens: [], cost: 120, mainIngredients: ['짜사이'] },
    { id: 'cn-ex-4', name: '청경채볶음(추가)', category: 'vegetable', calories: 35, protein: 2, carbs: 5, fat: 1, sodium: 220, allergens: [], cost: 250, mainIngredients: ['청경채'] },
    { id: 'cn-ex-5', name: '깐풍기(추가)', category: 'meat', calories: 330, protein: 20, carbs: 18, fat: 20, sodium: 580, allergens: ['닭고기', '밀'], cost: 750, mainIngredients: ['닭고기'] },
    { id: 'cn-ex-6', name: '마파두부(추가)', category: 'meat', calories: 260, protein: 14, carbs: 12, fat: 16, sodium: 720, allergens: ['대두', '돼지고기'], cost: 650, mainIngredients: ['두부'] },
    // 고가 옵션
    { id: 'cn-ex-7', name: '전가복(프리미엄)', category: 'meat', calories: 420, protein: 24, carbs: 20, fat: 26, sodium: 850, allergens: ['조개류', '새우', '오징어'], cost: 7000, mainIngredients: ['해물'] },
    { id: 'cn-ex-8', name: '팔보채(프리미엄)', category: 'meat', calories: 320, protein: 20, carbs: 14, fat: 20, sodium: 680, allergens: ['새우', '오징어'], cost: 4800, mainIngredients: ['해물'] },
    { id: 'cn-ex-9', name: '유산슬(프리미엄)', category: 'meat', calories: 360, protein: 22, carbs: 16, fat: 22, sodium: 720, allergens: ['새우', '오징어'], cost: 5200, mainIngredients: ['해물'] },
    { id: 'cn-ex-10', name: '춘권(추가)', category: 'side', calories: 160, protein: 5, carbs: 18, fat: 7, sodium: 340, allergens: ['밀'], cost: 280, mainIngredients: ['춘권'] },
  ],
  western: [
    { id: 'ws-ex-1', name: '감자튀김(추가)', category: 'side', calories: 290, protein: 4, carbs: 36, fat: 14, sodium: 320, allergens: [], cost: 350, mainIngredients: ['감자'] },
    { id: 'ws-ex-2', name: '코울슬로(추가)', category: 'vegetable', calories: 120, protein: 1, carbs: 12, fat: 8, sodium: 250, allergens: ['달걀'], cost: 240, mainIngredients: ['양배추'] },
    { id: 'ws-ex-3', name: '마늘빵(추가)', category: 'side', calories: 190, protein: 4, carbs: 26, fat: 9, sodium: 300, allergens: ['밀', '우유'], cost: 230, mainIngredients: ['빵'] },
    { id: 'ws-ex-4', name: '그린샐러드(추가)', category: 'vegetable', calories: 90, protein: 2, carbs: 7, fat: 6, sodium: 180, allergens: [], cost: 300, mainIngredients: ['샐러드'] },
    { id: 'ws-ex-5', name: '치킨너겟(추가)', category: 'meat', calories: 260, protein: 15, carbs: 18, fat: 15, sodium: 520, allergens: ['닭고기', '밀'], cost: 450, mainIngredients: ['닭고기'] },
    // 고가 옵션
    { id: 'ws-ex-6', name: '스테이크(프리미엄)', category: 'meat', calories: 520, protein: 38, carbs: 4, fat: 38, sodium: 620, allergens: ['쇠고기'], cost: 8500, mainIngredients: ['소고기'] },
    { id: 'ws-ex-7', name: '치즈플래터(프리미엄)', category: 'side', calories: 260, protein: 14, carbs: 6, fat: 20, sodium: 420, allergens: ['우유'], cost: 2800, mainIngredients: ['치즈'] },
    { id: 'ws-ex-8', name: '훈제연어샐러드(프리미엄)', category: 'side', calories: 280, protein: 22, carbs: 10, fat: 16, sodium: 420, allergens: [], cost: 3200, mainIngredients: ['연어', '샐러드'] },
    { id: 'ws-ex-9', name: '바게트(추가)', category: 'side', calories: 130, protein: 4, carbs: 24, fat: 2, sodium: 250, allergens: ['밀'], cost: 200, mainIngredients: ['빵'] },
    { id: 'ws-ex-10', name: '버터감자(추가)', category: 'side', calories: 160, protein: 3, carbs: 22, fat: 7, sodium: 200, allergens: ['우유'], cost: 240, mainIngredients: ['감자'] },
  ],
  snack: [
    { id: 'sk-ex-1', name: '김말이튀김(추가)', category: 'side', calories: 210, protein: 5, carbs: 26, fat: 10, sodium: 380, allergens: ['밀'], cost: 320, mainIngredients: ['김말이'] },
    { id: 'sk-ex-2', name: '오뎅(추가)', category: 'meat', calories: 90, protein: 7, carbs: 8, fat: 3, sodium: 520, allergens: ['밀'], cost: 240, mainIngredients: ['어묵'] },
    { id: 'sk-ex-3', name: '순대(추가)', category: 'meat', calories: 190, protein: 11, carbs: 16, fat: 11, sodium: 420, allergens: ['돼지고기'], cost: 420, mainIngredients: ['순대'] },
    { id: 'sk-ex-4', name: '치즈스틱(추가)', category: 'side', calories: 150, protein: 6, carbs: 12, fat: 9, sodium: 350, allergens: ['우유', '밀'], cost: 300, mainIngredients: ['치즈'] },
    { id: 'sk-ex-5', name: '핫도그(추가)', category: 'rice', calories: 380, protein: 12, carbs: 42, fat: 18, sodium: 680, allergens: ['밀', '돼지고기'], cost: 650, mainIngredients: ['빵', '소시지'] },
    // 고가 옵션
    { id: 'sk-ex-6', name: '모둠튀김(프리미엄)', category: 'side', calories: 420, protein: 10, carbs: 45, fat: 22, sodium: 720, allergens: ['밀'], cost: 1800, mainIngredients: ['튀김'] },
    { id: 'sk-ex-7', name: '치즈볼(추가)', category: 'side', calories: 260, protein: 8, carbs: 22, fat: 16, sodium: 520, allergens: ['우유', '밀'], cost: 550, mainIngredients: ['치즈'] },
    { id: 'sk-ex-8', name: '닭강정(추가)', category: 'meat', calories: 300, protein: 16, carbs: 24, fat: 16, sodium: 620, allergens: ['닭고기', '밀'], cost: 650, mainIngredients: ['닭고기'] },
    { id: 'sk-ex-9', name: '단무지(추가)', category: 'kimchi', calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 380, allergens: [], cost: 120, mainIngredients: ['단무지'] },
    { id: 'sk-ex-10', name: '미니샐러드(추가)', category: 'vegetable', calories: 80, protein: 2, carbs: 6, fat: 6, sodium: 180, allergens: [], cost: 300, mainIngredients: ['샐러드'] },
  ],
};

// 특별식 메뉴 (밥, 국, 반찬 구조)
export const specialMealSets: Record<string, SpecialMealSet[]> = {
  japanese: [
    {
      rice: { id: 'jp-r1', name: '돈카츠', category: 'rice', calories: 450, protein: 22, carbs: 30, fat: 28, sodium: 600, allergens: ['돼지고기', '밀', '달걀'], cost: 1500 },
      soup: { id: 'jp-s1', name: '미소시루', category: 'soup', calories: 45, protein: 3, carbs: 4, fat: 2, sodium: 450, allergens: ['대두'], cost: 200 },
      sideDishes: [
        { id: 'jp-sd1', name: '단무지', category: 'kimchi', calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 380, allergens: [], cost: 100 },
        { id: 'jp-sd2', name: '양배추샐러드', category: 'vegetable', calories: 35, protein: 1, carbs: 6, fat: 1, sodium: 150, allergens: [], cost: 150 },
        { id: 'jp-sd3', name: '연어구이', category: 'meat', calories: 200, protein: 22, carbs: 0, fat: 12, sodium: 320, allergens: [], cost: 800 },
        { id: 'jp-sd4', name: '계란찜', category: 'side', calories: 90, protein: 7, carbs: 2, fat: 6, sodium: 280, allergens: ['달걀'], cost: 250 },
      ]
    },
    {
      rice: { id: 'jp-r2', name: '카레라이스', category: 'rice', calories: 520, protein: 12, carbs: 75, fat: 18, sodium: 800, allergens: ['밀'], cost: 1200 },
      soup: { id: 'jp-s2', name: '미소시루', category: 'soup', calories: 45, protein: 3, carbs: 4, fat: 2, sodium: 450, allergens: ['대두'], cost: 200 },
      sideDishes: [
        { id: 'jp-sd5', name: '후쿠진즈케', category: 'kimchi', calories: 25, protein: 1, carbs: 6, fat: 0, sodium: 350, allergens: [], cost: 120 },
        { id: 'jp-sd6', name: '감자샐러드', category: 'vegetable', calories: 120, protein: 2, carbs: 15, fat: 6, sodium: 280, allergens: ['달걀'], cost: 200 },
        { id: 'jp-sd7', name: '치킨가라아게', category: 'meat', calories: 250, protein: 18, carbs: 12, fat: 15, sodium: 420, allergens: ['닭고기', '밀'], cost: 600 },
        { id: 'jp-sd8', name: '어묵볶음', category: 'side', calories: 90, protein: 6, carbs: 10, fat: 3, sodium: 450, allergens: ['밀'], cost: 250 },
      ]
    },
    {
      rice: { id: 'jp-r3', name: '규동', category: 'rice', calories: 480, protein: 20, carbs: 65, fat: 16, sodium: 720, allergens: ['쇠고기', '대두'], cost: 1300 },
      soup: { id: 'jp-s3', name: '된장국', category: 'soup', calories: 50, protein: 4, carbs: 5, fat: 2, sodium: 480, allergens: ['대두'], cost: 180 },
      sideDishes: [
        { id: 'jp-sd9', name: '단무지', category: 'kimchi', calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 380, allergens: [], cost: 100 },
        { id: 'jp-sd10', name: '시금치무침', category: 'vegetable', calories: 30, protein: 3, carbs: 3, fat: 1, sodium: 250, allergens: [], cost: 200 },
        { id: 'jp-sd11', name: '고로케', category: 'meat', calories: 180, protein: 5, carbs: 20, fat: 10, sodium: 320, allergens: ['밀', '달걀'], cost: 400 },
        { id: 'jp-sd12', name: '두부구이', category: 'side', calories: 80, protein: 7, carbs: 3, fat: 5, sodium: 200, allergens: ['대두'], cost: 200 },
      ]
    },
    {
      rice: { id: 'jp-r4', name: '오야코동', category: 'rice', calories: 450, protein: 22, carbs: 60, fat: 14, sodium: 680, allergens: ['닭고기', '달걀'], cost: 1100 },
      soup: { id: 'jp-s4', name: '미소시루', category: 'soup', calories: 45, protein: 3, carbs: 4, fat: 2, sodium: 450, allergens: ['대두'], cost: 200 },
      sideDishes: [
        { id: 'jp-sd13', name: '피클', category: 'kimchi', calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 280, allergens: [], cost: 80 },
        { id: 'jp-sd14', name: '마카로니샐러드', category: 'vegetable', calories: 140, protein: 4, carbs: 18, fat: 6, sodium: 320, allergens: ['밀', '달걀'], cost: 250 },
        { id: 'jp-sd15', name: '새우튀김', category: 'meat', calories: 180, protein: 12, carbs: 15, fat: 9, sodium: 380, allergens: ['새우', '밀'], cost: 500 },
        { id: 'jp-sd16', name: '타마고야끼', category: 'side', calories: 100, protein: 8, carbs: 4, fat: 6, sodium: 300, allergens: ['달걀'], cost: 280 },
      ]
    },
    {
      rice: { id: 'jp-r5', name: '우동', category: 'rice', calories: 380, protein: 12, carbs: 70, fat: 5, sodium: 850, allergens: ['밀'], cost: 900 },
      soup: { id: 'jp-s5', name: '가쓰오부시국물', category: 'soup', calories: 30, protein: 4, carbs: 2, fat: 1, sodium: 520, allergens: [], cost: 150 },
      sideDishes: [
        { id: 'jp-sd17', name: '단무지', category: 'kimchi', calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 380, allergens: [], cost: 100 },
        { id: 'jp-sd18', name: '시금치나물', category: 'vegetable', calories: 35, protein: 3, carbs: 4, fat: 1, sodium: 280, allergens: [], cost: 200 },
        { id: 'jp-sd19', name: '유부초밥', category: 'meat', calories: 150, protein: 6, carbs: 22, fat: 5, sodium: 350, allergens: ['대두'], cost: 350 },
        { id: 'jp-sd20', name: '오이절임', category: 'side', calories: 20, protein: 1, carbs: 4, fat: 0, sodium: 320, allergens: [], cost: 120 },
      ]
    },
  ],
  chinese: [
    {
      rice: { id: 'cn-r1', name: '짜장밥', category: 'rice', calories: 550, protein: 12, carbs: 78, fat: 22, sodium: 950, allergens: ['대두', '밀'], cost: 1200 },
      soup: { id: 'cn-s1', name: '계란탕', category: 'soup', calories: 65, protein: 5, carbs: 3, fat: 4, sodium: 380, allergens: ['달걀'], cost: 200 },
      sideDishes: [
        { id: 'cn-sd1', name: '짜사이', category: 'kimchi', calories: 15, protein: 1, carbs: 3, fat: 0, sodium: 450, allergens: [], cost: 100 },
        { id: 'cn-sd2', name: '오이무침', category: 'vegetable', calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 350, allergens: [], cost: 150 },
        { id: 'cn-sd3', name: '탕수육', category: 'meat', calories: 280, protein: 15, carbs: 28, fat: 14, sodium: 420, allergens: ['돼지고기', '밀'], cost: 500 },
        { id: 'cn-sd4', name: '군만두', category: 'side', calories: 180, protein: 8, carbs: 20, fat: 8, sodium: 380, allergens: ['밀', '돼지고기'], cost: 300 },
      ]
    },
    {
      rice: { id: 'cn-r2', name: '볶음밥', category: 'rice', calories: 480, protein: 14, carbs: 65, fat: 18, sodium: 720, allergens: ['달걀', '대두'], cost: 1100 },
      soup: { id: 'cn-s2', name: '짬뽕국물', category: 'soup', calories: 120, protein: 8, carbs: 10, fat: 6, sodium: 650, allergens: ['새우', '오징어'], cost: 350 },
      sideDishes: [
        { id: 'cn-sd5', name: '단무지', category: 'kimchi', calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 380, allergens: [], cost: 100 },
        { id: 'cn-sd6', name: '양장피샐러드', category: 'vegetable', calories: 95, protein: 4, carbs: 12, fat: 4, sodium: 320, allergens: ['밀'], cost: 280 },
        { id: 'cn-sd7', name: '깐풍기', category: 'meat', calories: 320, protein: 20, carbs: 18, fat: 20, sodium: 580, allergens: ['닭고기', '밀'], cost: 650 },
        { id: 'cn-sd8', name: '춘권', category: 'side', calories: 150, protein: 5, carbs: 18, fat: 7, sodium: 340, allergens: ['밀'], cost: 250 },
      ]
    },
    {
      rice: { id: 'cn-r3', name: '짬뽕밥', category: 'rice', calories: 520, protein: 18, carbs: 65, fat: 20, sodium: 980, allergens: ['밀', '새우', '오징어'], cost: 1300 },
      soup: { id: 'cn-s3', name: '계란탕', category: 'soup', calories: 65, protein: 5, carbs: 3, fat: 4, sodium: 380, allergens: ['달걀'], cost: 200 },
      sideDishes: [
        { id: 'cn-sd9', name: '짜사이', category: 'kimchi', calories: 15, protein: 1, carbs: 3, fat: 0, sodium: 450, allergens: [], cost: 100 },
        { id: 'cn-sd10', name: '숙주나물', category: 'vegetable', calories: 25, protein: 3, carbs: 3, fat: 0, sodium: 250, allergens: [], cost: 150 },
        { id: 'cn-sd11', name: '유린기', category: 'meat', calories: 300, protein: 22, carbs: 15, fat: 18, sodium: 550, allergens: ['닭고기', '밀'], cost: 600 },
        { id: 'cn-sd12', name: '물만두', category: 'side', calories: 160, protein: 7, carbs: 22, fat: 5, sodium: 350, allergens: ['밀', '돼지고기'], cost: 280 },
      ]
    },
    {
      rice: { id: 'cn-r4', name: '마파두부밥', category: 'rice', calories: 480, protein: 16, carbs: 60, fat: 20, sodium: 850, allergens: ['대두', '돼지고기'], cost: 1100 },
      soup: { id: 'cn-s4', name: '우동국물', category: 'soup', calories: 50, protein: 3, carbs: 8, fat: 1, sodium: 420, allergens: ['밀'], cost: 180 },
      sideDishes: [
        { id: 'cn-sd13', name: '단무지', category: 'kimchi', calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 380, allergens: [], cost: 100 },
        { id: 'cn-sd14', name: '청경채볶음', category: 'vegetable', calories: 30, protein: 2, carbs: 4, fat: 1, sodium: 220, allergens: [], cost: 200 },
        { id: 'cn-sd15', name: '라조기', category: 'meat', calories: 350, protein: 20, carbs: 20, fat: 22, sodium: 620, allergens: ['닭고기', '밀'], cost: 650 },
        { id: 'cn-sd16', name: '새우볶음', category: 'side', calories: 140, protein: 14, carbs: 6, fat: 7, sodium: 380, allergens: ['새우'], cost: 400 },
      ]
    },
    {
      rice: { id: 'cn-r5', name: '잡채밥', category: 'rice', calories: 450, protein: 10, carbs: 70, fat: 15, sodium: 680, allergens: ['밀', '대두'], cost: 1000 },
      soup: { id: 'cn-s5', name: '계란탕', category: 'soup', calories: 65, protein: 5, carbs: 3, fat: 4, sodium: 380, allergens: ['달걀'], cost: 200 },
      sideDishes: [
        { id: 'cn-sd17', name: '짜사이', category: 'kimchi', calories: 15, protein: 1, carbs: 3, fat: 0, sodium: 450, allergens: [], cost: 100 },
        { id: 'cn-sd18', name: '마늘쫑볶음', category: 'vegetable', calories: 40, protein: 2, carbs: 6, fat: 1, sodium: 280, allergens: [], cost: 220 },
        { id: 'cn-sd19', name: '팔보채', category: 'meat', calories: 280, protein: 18, carbs: 15, fat: 18, sodium: 580, allergens: ['새우', '오징어'], cost: 700 },
        { id: 'cn-sd20', name: '군만두', category: 'side', calories: 180, protein: 8, carbs: 20, fat: 8, sodium: 380, allergens: ['밀', '돼지고기'], cost: 300 },
      ]
    },
  ],
  western: [
    {
      rice: { id: 'ws-r1', name: '스파게티', category: 'rice', calories: 480, protein: 15, carbs: 65, fat: 18, sodium: 680, allergens: ['밀', '우유'], cost: 1300 },
      soup: { id: 'ws-s1', name: '콘스프', category: 'soup', calories: 120, protein: 3, carbs: 18, fat: 4, sodium: 450, allergens: ['우유'], cost: 250 },
      sideDishes: [
        { id: 'ws-sd1', name: '피클', category: 'kimchi', calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 280, allergens: [], cost: 80 },
        { id: 'ws-sd2', name: '시저샐러드', category: 'vegetable', calories: 150, protein: 5, carbs: 8, fat: 12, sodium: 420, allergens: ['우유', '달걀'], cost: 350 },
        { id: 'ws-sd3', name: '미트볼', category: 'meat', calories: 220, protein: 15, carbs: 10, fat: 14, sodium: 480, allergens: ['쇠고기', '밀'], cost: 450 },
        { id: 'ws-sd4', name: '마늘빵', category: 'side', calories: 180, protein: 4, carbs: 25, fat: 8, sodium: 280, allergens: ['밀', '우유'], cost: 200 },
      ]
    },
    {
      rice: { id: 'ws-r2', name: '함박스테이크', category: 'rice', calories: 520, protein: 28, carbs: 25, fat: 35, sodium: 720, allergens: ['밀', '달걀', '쇠고기'], cost: 1500 },
      soup: { id: 'ws-s2', name: '양송이스프', category: 'soup', calories: 95, protein: 3, carbs: 10, fat: 5, sodium: 380, allergens: ['우유'], cost: 280 },
      sideDishes: [
        { id: 'ws-sd5', name: '피클', category: 'kimchi', calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 280, allergens: [], cost: 80 },
        { id: 'ws-sd6', name: '코울슬로', category: 'vegetable', calories: 120, protein: 1, carbs: 12, fat: 8, sodium: 250, allergens: ['달걀'], cost: 200 },
        { id: 'ws-sd7', name: '소시지', category: 'meat', calories: 180, protein: 8, carbs: 2, fat: 16, sodium: 520, allergens: ['돼지고기'], cost: 300 },
        { id: 'ws-sd8', name: '감자튀김', category: 'side', calories: 280, protein: 4, carbs: 35, fat: 14, sodium: 320, allergens: [], cost: 300 },
      ]
    },
    {
      rice: { id: 'ws-r3', name: '치킨까스', category: 'rice', calories: 480, protein: 25, carbs: 35, fat: 28, sodium: 650, allergens: ['닭고기', '밀', '달걀'], cost: 1400 },
      soup: { id: 'ws-s3', name: '브로콜리스프', category: 'soup', calories: 100, protein: 4, carbs: 12, fat: 4, sodium: 400, allergens: ['우유'], cost: 300 },
      sideDishes: [
        { id: 'ws-sd9', name: '피클', category: 'kimchi', calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 280, allergens: [], cost: 80 },
        { id: 'ws-sd10', name: '그린샐러드', category: 'vegetable', calories: 80, protein: 2, carbs: 6, fat: 6, sodium: 180, allergens: [], cost: 250 },
        { id: 'ws-sd11', name: '베이컨', category: 'meat', calories: 150, protein: 10, carbs: 1, fat: 12, sodium: 480, allergens: ['돼지고기'], cost: 350 },
        { id: 'ws-sd12', name: '해시브라운', category: 'side', calories: 200, protein: 2, carbs: 25, fat: 10, sodium: 280, allergens: [], cost: 250 },
      ]
    },
    {
      rice: { id: 'ws-r4', name: '리조또', category: 'rice', calories: 450, protein: 12, carbs: 55, fat: 20, sodium: 620, allergens: ['우유'], cost: 1350 },
      soup: { id: 'ws-s4', name: '미네스트로네', category: 'soup', calories: 110, protein: 5, carbs: 18, fat: 3, sodium: 520, allergens: [], cost: 280 },
      sideDishes: [
        { id: 'ws-sd13', name: '올리브절임', category: 'kimchi', calories: 30, protein: 0, carbs: 2, fat: 3, sodium: 350, allergens: [], cost: 150 },
        { id: 'ws-sd14', name: '루꼴라샐러드', category: 'vegetable', calories: 70, protein: 2, carbs: 4, fat: 5, sodium: 150, allergens: [], cost: 300 },
        { id: 'ws-sd15', name: '그릴드치킨', category: 'meat', calories: 200, protein: 28, carbs: 2, fat: 9, sodium: 420, allergens: ['닭고기'], cost: 500 },
        { id: 'ws-sd16', name: '바게트', category: 'side', calories: 120, protein: 4, carbs: 22, fat: 2, sodium: 250, allergens: ['밀'], cost: 180 },
      ]
    },
    {
      rice: { id: 'ws-r5', name: '오므라이스', category: 'rice', calories: 500, protein: 18, carbs: 60, fat: 22, sodium: 700, allergens: ['달걀', '우유'], cost: 1200 },
      soup: { id: 'ws-s5', name: '토마토스프', category: 'soup', calories: 90, protein: 3, carbs: 15, fat: 3, sodium: 450, allergens: [], cost: 250 },
      sideDishes: [
        { id: 'ws-sd17', name: '피클', category: 'kimchi', calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 280, allergens: [], cost: 80 },
        { id: 'ws-sd18', name: '콘샐러드', category: 'vegetable', calories: 100, protein: 3, carbs: 15, fat: 4, sodium: 200, allergens: ['달걀'], cost: 220 },
        { id: 'ws-sd19', name: '치킨너겟', category: 'meat', calories: 240, protein: 14, carbs: 18, fat: 14, sodium: 520, allergens: ['닭고기', '밀'], cost: 400 },
        { id: 'ws-sd20', name: '버터감자', category: 'side', calories: 150, protein: 3, carbs: 22, fat: 6, sodium: 200, allergens: ['우유'], cost: 200 },
      ]
    },
  ],
  snack: [
    {
      rice: { id: 'sk-r1', name: '떡볶이', category: 'rice', calories: 380, protein: 8, carbs: 65, fat: 10, sodium: 850, allergens: ['밀'], cost: 800 },
      soup: { id: 'sk-s1', name: '어묵국물', category: 'soup', calories: 45, protein: 4, carbs: 5, fat: 1, sodium: 520, allergens: ['밀'], cost: 150 },
      sideDishes: [
        { id: 'sk-sd1', name: '단무지', category: 'kimchi', calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 380, allergens: [], cost: 100 },
        { id: 'sk-sd2', name: '양배추샐러드', category: 'vegetable', calories: 35, protein: 1, carbs: 6, fat: 1, sodium: 150, allergens: [], cost: 150 },
        { id: 'sk-sd3', name: '순대', category: 'meat', calories: 180, protein: 10, carbs: 15, fat: 10, sodium: 420, allergens: ['돼지고기'], cost: 350 },
        { id: 'sk-sd4', name: '튀김', category: 'side', calories: 220, protein: 5, carbs: 25, fat: 12, sodium: 350, allergens: ['밀'], cost: 300 },
      ]
    },
    {
      rice: { id: 'sk-r2', name: '김밥', category: 'rice', calories: 350, protein: 10, carbs: 52, fat: 11, sodium: 680, allergens: ['달걀'], cost: 900 },
      soup: { id: 'sk-s2', name: '라면국물', category: 'soup', calories: 80, protein: 3, carbs: 12, fat: 2, sodium: 650, allergens: ['밀'], cost: 200 },
      sideDishes: [
        { id: 'sk-sd5', name: '깍두기', category: 'kimchi', calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 520, allergens: ['새우'], cost: 150 },
        { id: 'sk-sd6', name: '무생채', category: 'vegetable', calories: 28, protein: 1, carbs: 6, fat: 0, sodium: 380, allergens: [], cost: 150 },
        { id: 'sk-sd7', name: '오뎅', category: 'meat', calories: 80, protein: 6, carbs: 8, fat: 2, sodium: 420, allergens: ['밀'], cost: 200 },
        { id: 'sk-sd8', name: '계란말이', category: 'side', calories: 120, protein: 8, carbs: 2, fat: 9, sodium: 320, allergens: ['달걀'], cost: 300 },
      ]
    },
    {
      rice: { id: 'sk-r3', name: '라볶이', category: 'rice', calories: 420, protein: 10, carbs: 70, fat: 12, sodium: 920, allergens: ['밀'], cost: 950 },
      soup: { id: 'sk-s3', name: '어묵국물', category: 'soup', calories: 45, protein: 4, carbs: 5, fat: 1, sodium: 520, allergens: ['밀'], cost: 150 },
      sideDishes: [
        { id: 'sk-sd9', name: '단무지', category: 'kimchi', calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 380, allergens: [], cost: 100 },
        { id: 'sk-sd10', name: '콩나물무침', category: 'vegetable', calories: 40, protein: 4, carbs: 5, fat: 1, sodium: 320, allergens: ['대두'], cost: 180 },
        { id: 'sk-sd11', name: '만두', category: 'meat', calories: 160, protein: 7, carbs: 18, fat: 7, sodium: 380, allergens: ['밀', '돼지고기'], cost: 300 },
        { id: 'sk-sd12', name: '치즈스틱', category: 'side', calories: 140, protein: 6, carbs: 12, fat: 8, sodium: 350, allergens: ['우유', '밀'], cost: 280 },
      ]
    },
    {
      rice: { id: 'sk-r4', name: '쫄면', category: 'rice', calories: 350, protein: 8, carbs: 60, fat: 8, sodium: 720, allergens: ['밀'], cost: 850 },
      soup: { id: 'sk-s4', name: '라면국물', category: 'soup', calories: 80, protein: 3, carbs: 12, fat: 2, sodium: 650, allergens: ['밀'], cost: 200 },
      sideDishes: [
        { id: 'sk-sd13', name: '깍두기', category: 'kimchi', calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 520, allergens: ['새우'], cost: 150 },
        { id: 'sk-sd14', name: '오이무침', category: 'vegetable', calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 350, allergens: [], cost: 150 },
        { id: 'sk-sd15', name: '닭강정', category: 'meat', calories: 280, protein: 16, carbs: 22, fat: 14, sodium: 620, allergens: ['닭고기', '밀'], cost: 500 },
        { id: 'sk-sd16', name: '삶은달걀', category: 'side', calories: 78, protein: 6, carbs: 1, fat: 5, sodium: 62, allergens: ['달걀'], cost: 150 },
      ]
    },
    {
      rice: { id: 'sk-r5', name: '비빔밥', category: 'rice', calories: 450, protein: 15, carbs: 65, fat: 15, sodium: 650, allergens: ['달걀', '대두'], cost: 1100 },
      soup: { id: 'sk-s5', name: '된장국', category: 'soup', calories: 50, protein: 4, carbs: 5, fat: 2, sodium: 480, allergens: ['대두'], cost: 180 },
      sideDishes: [
        { id: 'sk-sd17', name: '배추김치', category: 'kimchi', calories: 20, protein: 2, carbs: 4, fat: 0, sodium: 580, allergens: ['새우'], cost: 150 },
        { id: 'sk-sd18', name: '시금치나물', category: 'vegetable', calories: 35, protein: 3, carbs: 4, fat: 1, sodium: 280, allergens: [], cost: 200 },
        { id: 'sk-sd19', name: '불고기', category: 'meat', calories: 200, protein: 18, carbs: 8, fat: 11, sodium: 520, allergens: ['쇠고기', '대두'], cost: 600 },
        { id: 'sk-sd20', name: '계란후라이', category: 'side', calories: 90, protein: 6, carbs: 1, fat: 7, sodium: 150, allergens: ['달걀'], cost: 150 },
      ]
    },
  ],
};

export const allMenuItems = [
  ...sampleRice,
  ...sampleSoups,
  ...sampleKimchi,
  ...sampleVegetables,
  ...sampleMeats,
  ...sampleSides,
  ...sampleSnacks,
];

export const soupKimchiConflicts: Record<string, string[]> = {
  '김치찌개': ['배추김치', '파김치', '열무김치'],
  '김치볶음밥': ['배추김치', '파김치', '열무김치'],
};

export const ingredientConflictGroups: string[][] = [
  ['김치', '배추'],
  ['콩나물'],
  ['두부', '순두부'],
  ['무'],
  ['오이'],
  ['시금치'],
  ['고사리'],
  ['달걀', '메추리알'],
];
