// 질문 데이터 (QUESTIONS.md를 옮긴 것)
// 질문을 고치거나 추가할 때는 이 파일만 고치면 돼요. 화면 코드는 바꾸지 않아도 돼요.
// { } 안은 실마리가 들어갈 자리예요. 예: "{사람}과" → "할머니와"

/** 질문의 겹: 출발 · 구체화 · 이어가기 · 주제 */
export type Layer = "start" | "detail" | "branch" | "topic";

/** 실마리 종류 */
export type ClueType = "person" | "place" | "thing" | "sense" | "feeling";

export const CLUE_TYPES: { id: ClueType; label: string }[] = [
  { id: "person", label: "사람" },
  { id: "place", label: "장소" },
  { id: "thing", label: "물건" },
  { id: "sense", label: "감각" },
  { id: "feeling", label: "감정" },
];

export function clueTypeLabel(type: ClueType): string {
  return CLUE_TYPES.find((t) => t.id === type)?.label ?? "";
}

export interface Question {
  id: string;
  layer: Layer;
  /** 구체화: 차원(소리, 사람 …) / 주제: 주제 이름 / 이어가기: 실마리 종류 이름 */
  dimension: string;
  text: string;
  /** 질문 아래 작은 안내 문구 (선택) */
  hint?: string;
  /** 이어가기 틀: 빈칸에 들어갈 실마리 종류. "time"은 실마리 없는 시간 질문 */
  clue_type?: ClueType | "time";
  /** 구체화: 이 질문의 답을 어떤 종류의 실마리 후보로 보여줄지 */
  suggests?: ClueType;
  sort_order: number;
}

// ---- 출발 질문 ----
export const START_QUESTIONS: Question[] = [
  {
    id: "s-1",
    layer: "start",
    dimension: "출발",
    text: "당신의 가장 첫 기억은 무엇인가요?",
    hint: "어렴풋해도 괜찮아요. 한 장면이면 충분해요.",
    sort_order: 1,
  },
  {
    id: "s-2",
    layer: "start",
    dimension: "출발",
    text: "가장 오래된 것 같은 장면 하나를 떠올려 볼까요?",
    hint: "정확하지 않아도 괜찮아요.",
    sort_order: 2,
  },
  {
    id: "s-3",
    layer: "start",
    dimension: "출발",
    text: "어릴 적 살던 집을 떠올려 보세요. 무엇이 먼저 보이나요?",
    hint: "장소에서 시작해도 좋아요.",
    sort_order: 3,
  },
];

// ---- 구체화 질문 ----
export const DETAIL_QUESTIONS: Question[] = [
  { id: "d-time-1", layer: "detail", dimension: "때", text: "그때 몇 살 쯤이었나요?", sort_order: 1 },
  { id: "d-time-2", layer: "detail", dimension: "때", text: "계절이나 날씨가 기억나나요?", sort_order: 2 },
  { id: "d-time-3", layer: "detail", dimension: "때", text: "하루 중 언제 쯤이었나요? 아침, 낮, 저녁 중에요.", sort_order: 3 },
  { id: "d-place-1", layer: "detail", dimension: "곳", text: "그곳은 어디였나요?", suggests: "place", sort_order: 4 },
  {
    id: "d-place-2",
    layer: "detail",
    dimension: "곳",
    text: "그 자리에서 둘러보면 무엇이 보이나요?",
    hint: "그때 내 눈높이에서 떠올려 보세요.",
    suggests: "thing",
    sort_order: 5,
  },
  { id: "d-place-3", layer: "detail", dimension: "곳", text: "그때 내 눈높이에서는 무엇이 보였나요?", suggests: "thing", sort_order: 6 },
  {
    id: "d-person-1",
    layer: "detail",
    dimension: "사람",
    text: "누가 함께 있었나요?",
    hint: "이름 대신 옆집 언니처럼 불러도 좋아요.",
    suggests: "person",
    sort_order: 7,
  },
  { id: "d-person-2", layer: "detail", dimension: "사람", text: "그 사람은 무엇을 하고 있었나요?", sort_order: 8 },
  { id: "d-person-3", layer: "detail", dimension: "사람", text: "그 사람이 했던 말이 기억나나요?", sort_order: 9 },
  { id: "d-me-1", layer: "detail", dimension: "나", text: "나는 무엇을 하고 있었나요?", sort_order: 10 },
  {
    id: "d-me-2",
    layer: "detail",
    dimension: "나",
    text: "손에 무엇을 쥐고 있었거나, 무엇을 입고 있었나요?",
    suggests: "thing",
    sort_order: 11,
  },
  {
    id: "d-sound-1",
    layer: "detail",
    dimension: "소리",
    text: "어떤 소리가 들렸나요?",
    hint: "작은 소리도 괜찮아요.",
    suggests: "sense",
    sort_order: 12,
  },
  {
    id: "d-smell-1",
    layer: "detail",
    dimension: "냄새·맛",
    text: "어떤 냄새가 났나요? 무엇을 먹고 있었나요?",
    hint: "지금도 떠오르는 냄새가 있다면요.",
    suggests: "sense",
    sort_order: 13,
  },
  {
    id: "d-touch-1",
    layer: "detail",
    dimension: "촉감·온도",
    text: "덥거나 추웠나요? 손이나 발에 닿던 느낌이 있나요?",
    hint: "바닥, 옷, 바람 같은 것도 좋아요.",
    suggests: "sense",
    sort_order: 14,
  },
  {
    id: "d-mind-1",
    layer: "detail",
    dimension: "마음",
    text: "그때 어떤 기분이었나요?",
    hint: "정확하지 않아도 괜찮아요.",
    suggests: "feeling",
    sort_order: 15,
  },
  { id: "d-mind-2", layer: "detail", dimension: "마음", text: "지금 그 장면을 떠올리면 어떤 마음이 드나요?", sort_order: 16 },
  {
    id: "d-view-1",
    layer: "detail",
    dimension: "시점",
    text: "함께 있던 사람의 눈으로 보면, 그 장면은 어떻게 보일까요?",
    hint: "그 사람이 본 나를 상상해 봐요.",
    sort_order: 17,
  },
  { id: "d-around-1", layer: "detail", dimension: "앞뒤", text: "그 장면 바로 전이나 후에 무슨 일이 있었는지 기억나나요?", sort_order: 18 },
  {
    id: "d-source",
    layer: "detail",
    dimension: "출처",
    text: "이 기억은 어떻게 남아 있나요?",
    hint: "맞고 틀림은 없어요. 기억의 결을 남겨 둬요.",
    sort_order: 19,
  },
];

/** 기억 하나에 묻는 기본 구체화 질문 4장 (감각 질문 하나 이상, 출처는 항상 마지막) */
export const DEFAULT_DETAIL_IDS = ["d-sound-1", "d-person-1", "d-mind-1", "d-source"];

/** "다른 걸 떠올려 볼래요"에서 바꿔 볼 수 있는 질문 */
export const ALT_DETAIL_IDS = ["d-smell-1", "d-touch-1", "d-place-2", "d-view-1"];

export const SOURCE_QUESTION_ID = "d-source";

/** 출처 답 */
export type Source = "direct" | "media" | "told" | "unknown";

export const SOURCES: { id: Source; label: string }[] = [
  { id: "direct", label: "직접 기억나요" },
  { id: "media", label: "사진이나 영상으로 봤어요" },
  { id: "told", label: "가족에게 들은 이야기예요" },
  { id: "unknown", label: "잘 모르겠어요" },
];

export function sourceLabel(source: Source | null | undefined): string | undefined {
  return SOURCES.find((s) => s.id === source)?.label;
}

// ---- 이어가기 질문 틀 ----
export const BRANCH_TEMPLATES: Question[] = [
  { id: "b-person-1", layer: "branch", dimension: "사람", clue_type: "person", text: "{사람}과 함께한 또 다른 장면이 있나요?", sort_order: 1 },
  { id: "b-person-2", layer: "branch", dimension: "사람", clue_type: "person", text: "{사람}에게서 처음 배운 것이 있나요?", sort_order: 2 },
  { id: "b-place-1", layer: "branch", dimension: "장소", clue_type: "place", text: "{장소}에서 있었던 다른 일이 떠오르나요?", sort_order: 3 },
  { id: "b-place-2", layer: "branch", dimension: "장소", clue_type: "place", text: "{장소}를 떠나던 날이 기억나나요?", sort_order: 4 },
  { id: "b-thing-1", layer: "branch", dimension: "물건", clue_type: "thing", text: "{물건}은 그 뒤로 어떻게 되었나요?", sort_order: 5 },
  { id: "b-thing-2", layer: "branch", dimension: "물건", clue_type: "thing", text: "그 무렵 가장 아끼던 물건은 무엇이었나요?", sort_order: 6 },
  { id: "b-sense-1", layer: "branch", dimension: "감각", clue_type: "sense", text: "지금도 {감각}을 느끼면 떠오르는 다른 장면이 있나요?", sort_order: 7 },
  { id: "b-feeling-1", layer: "branch", dimension: "감정", clue_type: "feeling", text: "그 기분을 느꼈던 또 다른 때가 있나요?", sort_order: 8 },
  { id: "b-time-1", layer: "branch", dimension: "시간", clue_type: "time", text: "그다음으로 기억나는 장면은 무엇인가요?", sort_order: 9 },
  { id: "b-time-2", layer: "branch", dimension: "시간", clue_type: "time", text: "비슷한 나이에 있었던 다른 일이 떠오르나요?", sort_order: 10 },
];

/** 늘 함께 제안하는 시간 질문 */
export const NEXT_SCENE_TEMPLATE_ID = "b-time-1";

// ---- 주제 질문 ----
export const TOPICS = ["집과 가족", "놀이와 친구", "맛과 냄새", "유치원·학교", "처음의 감정"] as const;
export type Topic = (typeof TOPICS)[number];

export const TOPIC_QUESTIONS: Question[] = [
  { id: "t-home-1", layer: "topic", dimension: "집과 가족", text: "어릴 때 살던 집의 현관을 열면 무엇이 보였나요?", sort_order: 1 },
  { id: "t-home-2", layer: "topic", dimension: "집과 가족", text: "집에서 가장 좋아하던 자리는 어디였나요?", sort_order: 2 },
  { id: "t-home-3", layer: "topic", dimension: "집과 가족", text: "가족이 함께 모여 있던 장면 중 가장 오래된 것은 무엇인가요?", sort_order: 3 },
  { id: "t-home-4", layer: "topic", dimension: "집과 가족", text: "기억나는 생일이나 명절이 있나요?", sort_order: 4 },
  { id: "t-play-1", layer: "topic", dimension: "놀이와 친구", text: "처음 사귄 친구는 누구였나요?", sort_order: 1 },
  { id: "t-play-2", layer: "topic", dimension: "놀이와 친구", text: "해가 질 때까지 하던 놀이가 있었나요?", sort_order: 2 },
  { id: "t-play-3", layer: "topic", dimension: "놀이와 친구", text: "혼자 놀 때는 무엇을 했나요?", sort_order: 3 },
  { id: "t-taste-1", layer: "topic", dimension: "맛과 냄새", text: "어린 시절을 떠올리면 생각나는 음식이 있나요?", sort_order: 1 },
  { id: "t-taste-2", layer: "topic", dimension: "맛과 냄새", text: "아플 때 먹던 음식이 있었나요?", sort_order: 2 },
  { id: "t-taste-3", layer: "topic", dimension: "맛과 냄새", text: "어떤 냄새를 맡으면 그 시절이 떠오르나요?", sort_order: 3 },
  { id: "t-school-1", layer: "topic", dimension: "유치원·학교", text: "처음 유치원이나 학교에 가던 날은 어땠나요?", sort_order: 1 },
  { id: "t-school-2", layer: "topic", dimension: "유치원·학교", text: "기억나는 선생님이 있나요?", sort_order: 2 },
  { id: "t-school-3", layer: "topic", dimension: "유치원·학교", text: "가방 안에는 무엇이 들어 있었나요?", sort_order: 3 },
  { id: "t-feel-1", layer: "topic", dimension: "처음의 감정", text: "처음으로 무서웠던 일은 무엇이었나요?", sort_order: 1 },
  { id: "t-feel-2", layer: "topic", dimension: "처음의 감정", text: "처음으로 자랑스러웠던 일은 무엇이었나요?", sort_order: 2 },
  { id: "t-feel-3", layer: "topic", dimension: "처음의 감정", text: "처음 눈이나 바다를 본 날이 기억나나요?", sort_order: 3 },
];

export const ALL_QUESTIONS: Question[] = [
  ...START_QUESTIONS,
  ...DETAIL_QUESTIONS,
  ...BRANCH_TEMPLATES,
  ...TOPIC_QUESTIONS,
];

export function getQuestion(id: string | null | undefined): Question | undefined {
  if (!id) return undefined;
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function topicQuestions(topic: string): Question[] {
  return TOPIC_QUESTIONS.filter((q) => q.dimension === topic).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
}

export function branchTemplatesFor(type: ClueType): Question[] {
  return BRANCH_TEMPLATES.filter((q) => q.clue_type === type);
}
