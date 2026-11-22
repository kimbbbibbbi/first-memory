// 한국어 조사 자동 바꾸기
// 실마리 마지막 글자에 받침이 있는지 보고 과/와, 은/는, 을/를, 이/가를 골라요.
// 예: 할머니 → "할머니와", 마당 → "마당과", 마루 → "마루를", 대문 → "대문을"

const PAIRS: Record<string, [withBatchim: string, withoutBatchim: string]> = {
  과: ["과", "와"],
  와: ["과", "와"],
  은: ["은", "는"],
  는: ["은", "는"],
  을: ["을", "를"],
  를: ["을", "를"],
  이: ["이", "가"],
  가: ["이", "가"],
};

// 숫자로 끝날 때 읽는 소리의 받침 (0 영, 1 일, 3 삼, 6 육, 7 칠, 8 팔 → 받침 있음)
const DIGIT_BATCHIM: Record<string, boolean> = {
  "0": true, "1": true, "2": false, "3": true, "4": false,
  "5": false, "6": true, "7": true, "8": true, "9": false,
};

/** 마지막 글자에 받침이 있으면 true, 없으면 false, 알 수 없으면(영어 등) null */
export function hasBatchim(word: string): boolean | null {
  const last = word.trim().replace(/[\s.,!?'")\]]+$/, "").slice(-1);
  if (!last) return null;
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  if (last in DIGIT_BATCHIM) return DIGIT_BATCHIM[last];
  return null;
}

/** 단어에 맞는 조사를 붙여요. 받침을 알 수 없으면 "과(와)"처럼 둘 다 써요. */
export function withJosa(word: string, josa: string): string {
  const pair = PAIRS[josa];
  if (!pair) return word + josa;
  const batchim = hasBatchim(word);
  if (batchim === null) return `${word}${pair[0]}(${pair[1]})`;
  return word + (batchim ? pair[0] : pair[1]);
}

/**
 * 질문 틀의 {빈칸}에 실마리를 넣고, 바로 뒤 조사를 받침에 맞게 바꿔요.
 * 예: fillTemplate("{사람}과 함께한 또 다른 장면이 있나요?", "할머니")
 *     → "할머니와 함께한 또 다른 장면이 있나요?"
 */
export function fillTemplate(template: string, clue: string): string {
  return template.replace(/\{[^}]+\}(과|와|은|는|을|를|이|가)?/g, (_, josa?: string) =>
    josa ? withJosa(clue, josa) : clue,
  );
}
