// 별명 규칙 (CLAUDE.md "정해진 사항"): 2~12자, 앞뒤 띄어쓰기 제외.
// 겹치는지는 데이터베이스가 대소문자 구분 없이 확인해요.

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 12;

export function cleanNickname(raw: string): string {
  return raw.trim();
}

/** 문제가 있으면 안내 문구, 괜찮으면 null */
export function nicknameProblem(nickname: string): string | null {
  if (nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX) {
    return `별명은 ${NICKNAME_MIN}~${NICKNAME_MAX}자로 적어 주세요.`;
  }
  return null;
}
