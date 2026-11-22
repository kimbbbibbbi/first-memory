// 나이 선택 (CLAUDE.md "정해진 사항")
// 숫자는 나이(살)이고, 저장은 age_from ~ age_to 범위로 해요.

export interface AgePreset {
  id: string;
  label: string;
  from: number;
  to: number;
}

export const AGE_PRESETS: AgePreset[] = [
  { id: "baby", label: "아기 때", from: 0, to: 3 },
  { id: "daycare", label: "어린이집", from: 4, to: 6 },
  { id: "kindergarten", label: "유치원", from: 7, to: 7 },
  { id: "lower-elem", label: "초등 저학년", from: 8, to: 10 },
  { id: "upper-elem", label: "초등 고학년", from: 11, to: 13 },
];

/** "숫자로 고르기"에서 고를 수 있는 나이 */
export const MIN_AGE = 0;
export const MAX_AGE = 19;

export function findPreset(from: number, to: number): AgePreset | undefined {
  return AGE_PRESETS.find((p) => p.from === from && p.to === to);
}

/** 나이 범위를 글자로. 예: "7살", "4~6살" */
export function formatAgeRange(from: number, to: number): string {
  return from === to ? `${from}살` : `${from}~${to}살`;
}
