/**
 * 메뉴명 앞에 붙는 이모지/장식문자를 제거합니다.
 *
 * 요구사항:
 * - 메뉴명 문자열 매칭(중복/충돌/알레르기/원가 등)에서 이모지가 끼면 매치가 깨질 수 있어 제거
 * - "앞에 있는" 이모지 제거에 집중 (중간에 들어간 문자는 유지)
 */
export function sanitizeMenuName(rawName: string): string {
  const name = String(rawName ?? '');
  if (!name) return '';

  // 앞쪽에 붙은 이모지/기호/장식문자 제거
  // - 유니코드 property escape를 쓰지 않고도 대부분의 이모지/기호는 "문자/숫자"가 아니므로 제거됩니다.
  // - 괄호/대괄호로 시작하는 표기는 유지합니다.
  const withoutLeadingDecor = name.replace(/^[^\p{L}\p{N}([]+/u, '');

  // 공백 정리
  return withoutLeadingDecor.replace(/\s+/g, ' ').trim();
}


