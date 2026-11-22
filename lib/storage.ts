// 1단계에서는 기억을 이 브라우저(localStorage)에만 저장해요.
// 브라우저 데이터를 지우면 기억도 사라져요. 2단계에서 데이터베이스로 옮겨요.
//
// 꼭 지킬 규칙: 새 기억은 항상 "나만 보기"(private)로 저장해요.
// 그래서 아래 함수들은 공개 범위를 바꾸는 입력을 아예 받지 않아요.

import type { Clue, ClueType, Memory, MemoryDetail } from "./types";

const MEMORIES_KEY = "first-memory:memories:v1";
const DETAILS_KEY = "first-memory:details:v1";
const CLUES_KEY = "first-memory:clues:v1";
/** 예전 구조에서 쓰던 "건너뛴 질문" (새 구조에서는 쓰지 않아요) */
const OLD_SKIPPED_KEY = "first-memory:skipped:v1";

const KEYS = [MEMORIES_KEY, DETAILS_KEY, CLUES_KEY];

// ---- 저장소 읽기·쓰기 ----
// Next.js는 화면을 옮겨 다녀도 이전 화면을 숨겨서 그대로 남겨 둬요.
// 그래서 저장 내용이 바뀌면 "바뀌었어요"라고 알려서, 숨어 있던 화면도 새 내용을 보게 해요.

const EMPTY: never[] = [];
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown[] }>();

/** 같은 내용이면 같은 배열을 돌려줘요 (화면이 쓸데없이 다시 그려지지 않게) */
function readList<T>(key: string, normalize?: (item: T) => T): T[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return EMPTY;
  }
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T[];

  let value: T[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    value = Array.isArray(parsed) ? (normalize ? parsed.map(normalize) : parsed) : EMPTY;
  } catch {
    value = EMPTY;
  }
  cache.set(key, { raw, value });
  return value;
}

function writeList(key: string, value: unknown[]): void {
  window.localStorage.setItem(key, JSON.stringify(value));
  listeners.forEach((notify) => notify());
}

/** 저장 내용이 바뀔 때 알림 받기 (다른 탭에서 바뀐 것도 포함) */
export function subscribe(notify: () => void): () => void {
  listeners.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || KEYS.includes(e.key)) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

export function emptyList<T>(): T[] {
  return EMPTY;
}

function now() {
  return new Date().toISOString();
}

// ---- 예전 기억 옮기기 ----
// 예전(고정 6단계) 구조로 저장된 기억을 새 구조로 바꿔서 읽어요.
// 본문과 나이는 그대로 두고, 예전 질문은 비슷한 출발·주제 질문으로 연결해요.
// 쓴 사람이 실제로 받았던 질문 문장은 question_text로 남겨요.

const OLD_QUESTIONS: Record<string, { id: string; text: string }> = {
  "q0-1": { id: "s-1", text: "당신의 가장 첫 기억은 무엇인가요?" },
  "q1-1": { id: "t-home-1", text: "어릴 때 살던 집은 어떻게 생겼었나요?" },
  "q1-2": { id: "t-home-3", text: "가족과 함께한 가장 오래된 장면은 무엇인가요?" },
  "q2-1": { id: "t-play-1", text: "처음 사귄 친구는 누구였나요?" },
  "q2-2": { id: "t-play-2", text: "가장 자주 했던 놀이는 무엇이었나요?" },
  "q3-1": { id: "t-taste-1", text: "어린 시절을 떠올리면 생각나는 음식이 있나요?" },
  "q3-2": { id: "t-taste-3", text: "어린 시절을 떠올리게 하는 냄새가 있나요?" },
  "q4-1": { id: "t-school-1", text: "처음 학교에 가던 날은 어땠나요?" },
  "q4-2": { id: "t-school-2", text: "기억나는 선생님이 있나요?" },
  "q5-1": { id: "t-feel-1", text: "처음 무서웠던 일은 무엇인가요?" },
  "q5-2": { id: "t-feel-2", text: "처음 자랑스러웠던 일은 무엇인가요?" },
};

/** 예전 모양이거나 빠진 칸이 있으면 새 모양으로 채워요 (저장소에는 다음에 쓸 때 반영돼요) */
export function normalizeMemory(saved: Memory): Memory {
  // 예전 기억에는 parent_id 같은 칸이 없어서, 일부 칸만 있는 모양으로 보고 확인해요
  const m = saved as Partial<Memory> & Pick<Memory, "id" | "body" | "created_at">;
  if (m.parent_id !== undefined && m.question_text !== undefined) return saved;
  const old = m.question_id ? OLD_QUESTIONS[m.question_id] : undefined;
  return {
    ...saved,
    question_id: old ? old.id : m.question_id ?? null,
    question_text: old ? old.text : null,
    parent_id: null,
    from_clue_id: null,
    source: null,
    visibility: "private",
  };
}

// ---- 기억 ----

export function loadMemories(): Memory[] {
  return readList<Memory>(MEMORIES_KEY, normalizeMemory);
}

function saveMemories(list: Memory[]): void {
  writeList(MEMORIES_KEY, list);
  try {
    window.localStorage.removeItem(OLD_SKIPPED_KEY);
  } catch {
    // 지우지 못해도 괜찮아요
  }
}

export function getMemory(id: string | null | undefined): Memory | undefined {
  if (!id) return undefined;
  return loadMemories().find((m) => m.id === id);
}

/** 기억을 쓰거나 고칠 때 받는 내용 (공개 범위는 포함하지 않아요) */
export interface MemoryInput {
  question_id: string | null;
  question_text: string | null;
  parent_id: string | null;
  from_clue_id: string | null;
  title: string;
  body: string;
  age_from: number;
  age_to: number;
}

export function addMemory(input: MemoryInput): Memory {
  const time = now();
  const memory: Memory = {
    ...input,
    id: crypto.randomUUID(),
    source: null,
    visibility: "private", // 기본 비공개
    created_at: time,
    updated_at: time,
  };
  saveMemories([...loadMemories(), memory]);
  return memory;
}

/** 기억 고치기. 공개 범위(visibility)는 바꿀 수 없어요. */
export function updateMemory(
  id: string,
  patch: Partial<MemoryInput> & { source?: Memory["source"] },
): void {
  saveMemories(
    loadMemories().map((m) => (m.id === id ? { ...m, ...patch, updated_at: now() } : m)),
  );
}

/** 기억을 지우면 그 기억의 구체화 답과 실마리도 함께 지워요 */
export function deleteMemory(id: string): void {
  saveMemories(loadMemories().filter((m) => m.id !== id));
  writeList(DETAILS_KEY, loadDetails().filter((d) => d.memory_id !== id));
  writeList(CLUES_KEY, loadClues().filter((c) => c.memory_id !== id));
}

/** 나이 순서(어린 나이부터), 같으면 먼저 쓴 순서 */
export function sortByAge(list: Memory[]): Memory[] {
  return [...list].sort(
    (a, b) =>
      a.age_from - b.age_from ||
      a.age_to - b.age_to ||
      a.created_at.localeCompare(b.created_at),
  );
}

// ---- 구체화 답 ----

export function loadDetails(): MemoryDetail[] {
  return readList<MemoryDetail>(DETAILS_KEY);
}

/** 같은 기억·같은 질문의 답은 하나만 남겨요 (다시 답하면 바꿔요). answer가 null이면 "잘 모르겠어요" */
export function saveDetail(memoryId: string, questionId: string, answer: string | null): void {
  const list = loadDetails();
  const existing = list.find((d) => d.memory_id === memoryId && d.question_id === questionId);
  if (existing) {
    writeList(
      DETAILS_KEY,
      list.map((d) => (d === existing ? { ...d, answer } : d)),
    );
  } else {
    writeList(DETAILS_KEY, [
      ...list,
      { id: crypto.randomUUID(), memory_id: memoryId, question_id: questionId, answer, created_at: now() },
    ]);
  }
}

// ---- 실마리 ----

export const MAX_CLUES = 5;

export function loadClues(): Clue[] {
  return readList<Clue>(CLUES_KEY);
}

export interface ClueDraft {
  /** 이미 있던 실마리면 id가 있어요 (이어진 기억이 이 id를 기억하고 있어서 그대로 둬요) */
  id?: string;
  type: ClueType;
  text: string;
}

/** 기억 정리에서 고른 실마리로 그 기억의 실마리 목록을 바꿔요 (최대 5개) */
export function replaceClues(memoryId: string, drafts: ClueDraft[]): void {
  const others = loadClues().filter((c) => c.memory_id !== memoryId);
  const time = now();
  const mine: Clue[] = drafts.slice(0, MAX_CLUES).map((d) => ({
    id: d.id ?? crypto.randomUUID(),
    memory_id: memoryId,
    type: d.type,
    text: d.text,
    created_at: time,
  }));
  writeList(CLUES_KEY, [...others, ...mine]);
}

/** 아직 이어서 쓰지 않은 실마리 (최근 기억의 실마리부터) */
export function unopenedClues(clues: Clue[], memories: Memory[]): Clue[] {
  const opened = new Set(memories.map((m) => m.from_clue_id).filter(Boolean));
  const memoryTime = new Map(memories.map((m) => [m.id, m.created_at]));
  return clues
    .filter((c) => !opened.has(c.id) && memoryTime.has(c.memory_id))
    .sort((a, b) =>
      (memoryTime.get(b.memory_id) ?? "").localeCompare(memoryTime.get(a.memory_id) ?? ""),
    );
}
