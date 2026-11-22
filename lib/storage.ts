"use client";

// 기억 저장·고치기·지우기 (Supabase 서버에 저장해요)
//
// 꼭 지킬 규칙: 새 기억은 항상 "나만 보기"(private)로 저장돼요.
// 데이터베이스가 새 기억의 공개 범위를 private으로만 받아 주고,
// 공유는 setVisibility로 쓴 사람이 직접 바꿀 때만 일어나요.

import { supabase } from "./supabase/client";
import { refreshMyData } from "./useStored";
import type { Clue, ClueType, Memory, Visibility } from "./types";

/** 저장이 실패했을 때 화면에 보여줄 안내 */
export class SaveError extends Error {}

function check(error: { message: string } | null) {
  if (error) throw new SaveError("저장하지 못했어요. 인터넷 연결을 확인하고 다시 해 주세요.");
}

// ---- 기억 ----

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

export async function addMemory(input: MemoryInput): Promise<string> {
  const { data, error } = await supabase().from("memories").insert(input).select("id").single();
  check(error);
  await refreshMyData();
  return data!.id as string;
}

/** 기억 고치기 (본문·제목·나이·출처). 공개 범위는 setVisibility로만 바꿔요. */
export async function updateMemory(
  id: string,
  patch: Partial<Pick<Memory, "title" | "body" | "age_from" | "age_to" | "source">>,
): Promise<void> {
  const { error } = await supabase().from("memories").update(patch).eq("id", id);
  check(error);
  await refreshMyData();
}

/** 쓴 사람이 직접 공유를 켜거나 끌 때만 불러요 */
export async function setVisibility(id: string, visibility: Visibility): Promise<void> {
  const { error } = await supabase().from("memories").update({ visibility }).eq("id", id);
  check(error);
  await refreshMyData();
}

/** 기억을 지우면 구체화 답·실마리·공감·신고도 함께 지워져요 (데이터베이스가 처리) */
export async function deleteMemory(id: string): Promise<void> {
  const { error } = await supabase().from("memories").delete().eq("id", id);
  check(error);
  await refreshMyData();
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

/** 같은 기억·같은 질문의 답은 하나만 남겨요 (다시 답하면 바꿔요). answer가 null이면 "잘 모르겠어요" */
export async function saveDetail(
  memoryId: string,
  questionId: string,
  answer: string | null,
): Promise<void> {
  const { error } = await supabase()
    .from("memory_details")
    .upsert(
      { memory_id: memoryId, question_id: questionId, answer },
      { onConflict: "memory_id,question_id" },
    );
  check(error);
  await refreshMyData();
}

// ---- 실마리 ----

export const MAX_CLUES = 5;

export interface ClueDraft {
  /** 이미 있던 실마리면 id가 있어요 (이어진 기억이 이 id를 기억하고 있어서 그대로 둬요) */
  id?: string;
  type: ClueType;
  text: string;
}

/** 기억 정리에서 고른 실마리로 그 기억의 실마리 목록을 바꿔요 (최대 5개) */
export async function replaceClues(memoryId: string, current: Clue[], drafts: ClueDraft[]) {
  const db = supabase();
  const keep = new Set(drafts.map((d) => d.id).filter(Boolean));
  const removed = current.filter((c) => c.memory_id === memoryId && !keep.has(c.id)).map((c) => c.id);
  if (removed.length > 0) {
    const { error } = await db.from("clues").delete().in("id", removed);
    check(error);
  }
  const added = drafts
    .filter((d) => !d.id)
    .slice(0, MAX_CLUES - keep.size)
    .map((d) => ({ memory_id: memoryId, type: d.type, text: d.text }));
  if (added.length > 0) {
    const { error } = await db.from("clues").insert(added);
    check(error);
  }
  await refreshMyData();
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
