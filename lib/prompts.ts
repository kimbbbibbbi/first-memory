// 질문 고르기 규칙 (규칙 기반: 질문 틀 + 실마리)
// - 기억 쓰기 화면에 보여줄 질문 정하기
// - 이어서 떠올리기 질문 만들기
// - 질문 탭의 "이어서 쓰기" 카드 고르기
// - 타임라인에 보여줄 "나이 · 질문 이름" 만들기

import {
  BRANCH_TEMPLATES,
  NEXT_SCENE_TEMPLATE_ID,
  START_QUESTIONS,
  TOPICS,
  branchTemplatesFor,
  clueTypeLabel,
  getQuestion,
  topicQuestions,
  type ClueType,
} from "@/data/questions";
import { fillTemplate } from "./josa";
import { unopenedClues } from "./storage";
import type { Clue, Memory } from "./types";

/** 기억 쓰기 화면의 질문 한 개 */
export interface Prompt {
  /** start = 출발, topic = 주제, branch = 이어가기, free = 질문 없이 */
  kind: "start" | "topic" | "branch" | "free";
  question_id: string | null;
  /** 화면에 보일 질문 문장 (이어가기는 실마리를 넣은 문장) */
  text: string;
  hint?: string;
  /** 질문 위 작은 글씨. 예: "출발 질문", "이어가기 · 할머니", "주제 질문 · 집과 가족" */
  label: string;
  parent_id: string | null;
  from_clue_id: string | null;
}

/** 태그 색: 사람·장소 같은 실마리는 mist, 시간 질문은 sand */
export type Tone = "mist" | "sand";

/** 이어가기 질문 카드 한 장 */
export interface BranchOption {
  tag: string;
  tone: Tone;
  text: string;
  href: string;
}

export function startPrompt(index = 0): Prompt {
  const q = START_QUESTIONS[index % START_QUESTIONS.length];
  return {
    kind: "start",
    question_id: q.id,
    text: q.text,
    hint: q.hint,
    label: "출발 질문",
    parent_id: null,
    from_clue_id: null,
  };
}

export function freePrompt(parent_id: string | null = null, from_clue_id: string | null = null): Prompt {
  return {
    kind: "free",
    question_id: null,
    text: "떠오르는 기억을 자유롭게 적어 보세요",
    label: "질문 없이 쓰기",
    parent_id,
    from_clue_id,
  };
}

/** 실마리 하나에 쓸 이어가기 틀 (실마리마다 돌아가며 골라요) */
function templateFor(clue: Clue, offset = 0) {
  const list = branchTemplatesFor(clue.type);
  let sum = 0;
  for (const ch of clue.id) sum += ch.charCodeAt(0);
  return list[(sum + offset) % list.length];
}

function clueTag(clue: Clue) {
  return `${clueTypeLabel(clue.type)} · ${clue.text}`;
}

/** 이어가기 틀 + 실마리로 질문 만들기 */
export function cluePrompt(templateId: string, clue: Clue): Prompt | undefined {
  const t = getQuestion(templateId);
  if (!t || t.layer !== "branch" || t.clue_type !== clue.type) return undefined;
  return {
    kind: "branch",
    question_id: t.id,
    text: fillTemplate(t.text, clue.text),
    label: `이어가기 · ${clue.text}`,
    parent_id: clue.memory_id,
    from_clue_id: clue.id,
  };
}

/** 시간 질문 ("그다음으로 기억나는 장면은 무엇인가요?" 등) */
export function timePrompt(templateId: string, parentId: string): Prompt | undefined {
  const t = getQuestion(templateId);
  if (!t || t.clue_type !== "time") return undefined;
  return {
    kind: "branch",
    question_id: t.id,
    text: t.text,
    label: templateId === NEXT_SCENE_TEMPLATE_ID ? "이어가기 · 다음 장면" : "이어가기 · 비슷한 나이",
    parent_id: parentId,
    from_clue_id: null,
  };
}

export function topicPrompt(questionId: string): Prompt | undefined {
  const q = getQuestion(questionId);
  if (!q) return undefined;
  if (q.layer === "start") {
    return startPrompt(START_QUESTIONS.findIndex((s) => s.id === q.id));
  }
  if (q.layer !== "topic") return undefined;
  return {
    kind: "topic",
    question_id: q.id,
    text: q.text,
    hint: q.hint,
    label: `주제 질문 · ${q.dimension}`,
    parent_id: null,
    from_clue_id: null,
  };
}

/** 이미 쓴 기억에서, 쓸 때 보였던 질문 모양 다시 만들기 (고치기 화면용) */
export function promptOfMemory(m: Memory): Prompt {
  const q = getQuestion(m.question_id);
  if (!q) return freePrompt(m.parent_id, m.from_clue_id);
  const kind = q.layer === "start" ? "start" : q.layer === "topic" ? "topic" : "branch";
  const label =
    kind === "start" ? "출발 질문" : kind === "topic" ? `주제 질문 · ${q.dimension}` : "이어가기";
  return {
    kind,
    question_id: q.id,
    text: m.question_text ?? q.text,
    hint: q.hint,
    label,
    parent_id: m.parent_id,
    from_clue_id: m.from_clue_id,
  };
}

// ---- 이어서 떠올리기 ----

const TYPE_ORDER: ClueType[] = ["person", "place", "thing", "sense", "feeling"];

/** 기억 하나를 쓴 뒤: 그 기억의 실마리 질문 2개 + 시간 질문 1개 */
export function branchOptionsForMemory(
  memory: Memory,
  clues: Clue[],
  memories: Memory[],
): BranchOption[] {
  const mine = unopenedClues(
    clues.filter((c) => c.memory_id === memory.id),
    memories,
  ).sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));

  // 종류가 겹치지 않게 먼저 고르고, 모자라면 같은 종류에서 더 골라요
  const picked: Clue[] = [];
  for (const c of mine) if (picked.length < 2 && !picked.some((p) => p.type === c.type)) picked.push(c);
  for (const c of mine) if (picked.length < 2 && !picked.includes(c)) picked.push(c);

  const options: BranchOption[] = picked.map((c) => clueOption(c));
  options.push(timeOption(NEXT_SCENE_TEMPLATE_ID, memory.id));
  if (options.length < 3) options.push(timeOption("b-time-2", memory.id));
  return options.slice(0, 3);
}

/** 질문 탭에서 실마리 하나를 골랐을 때: 그 실마리로 만든 질문들 + 시간 질문 */
export function branchOptionsForClue(clue: Clue): BranchOption[] {
  const options = branchTemplatesFor(clue.type).map((t) => clueOption(clue, t.id));
  options.push(timeOption(NEXT_SCENE_TEMPLATE_ID, clue.memory_id));
  return options.slice(0, 3);
}

function clueOption(clue: Clue, templateId = templateFor(clue).id): BranchOption {
  const t = BRANCH_TEMPLATES.find((b) => b.id === templateId)!;
  return {
    tag: clueTag(clue),
    tone: "mist",
    text: fillTemplate(t.text, clue.text),
    href: `/write?t=${t.id}&clue=${clue.id}`,
  };
}

function timeOption(templateId: string, memoryId: string): BranchOption {
  const t = BRANCH_TEMPLATES.find((b) => b.id === templateId)!;
  return {
    tag: templateId === NEXT_SCENE_TEMPLATE_ID ? "시간 · 다음 장면" : "시간 · 비슷한 나이",
    tone: "sand",
    text: t.text,
    href: `/write?t=${t.id}&from=${memoryId}`,
  };
}

// ---- 질문 탭 ----

/** 주제마다 쓴 기억 수 */
export function topicCounts(memories: Memory[]): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(TOPICS.map((t) => [t, 0]));
  for (const m of memories) {
    const q = getQuestion(m.question_id);
    if (q?.layer === "topic") counts[q.dimension] = (counts[q.dimension] ?? 0) + 1;
  }
  return counts;
}

/** 주제에서 다음에 물을 질문 (아직 답하지 않은 것부터) */
export function nextTopicQuestion(topic: string, memories: Memory[]) {
  const answered = new Set(memories.map((m) => m.question_id));
  const list = topicQuestions(topic);
  return list.find((q) => !answered.has(q.id)) ?? list[0];
}

/** 질문 탭 맨 위 "이어서 쓰기" 카드 */
export function suggestion(
  memories: Memory[],
  clues: Clue[],
): { label: string; text: string; href: string } {
  if (memories.length === 0) {
    const s = startPrompt();
    return { label: "출발 질문", text: s.text, href: "/write?q=s-1" };
  }
  const open = unopenedClues(clues, memories);
  if (open.length > 0) {
    const clue = open[0];
    const t = templateFor(clue);
    return {
      label: `이어서 쓰기 · ${clueTypeLabel(clue.type)} 실마리 '${clue.text}'`,
      text: fillTemplate(t.text, clue.text),
      href: `/write?t=${t.id}&clue=${clue.id}`,
    };
  }
  const counts = topicCounts(memories);
  const empty = TOPICS.find((t) => counts[t] === 0);
  if (empty) {
    const q = nextTopicQuestion(empty, memories);
    return { label: `주제 질문 · ${empty}`, text: q.text, href: `/write?q=${q.id}` };
  }
  const latest = [...memories].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const t = getQuestion(NEXT_SCENE_TEMPLATE_ID)!;
  return {
    label: "이어서 쓰기 · 다음 장면",
    text: t.text,
    href: `/write?t=${t.id}&from=${latest.id}`,
  };
}

// ---- 타임라인 표시 ----

/** 기억이 어디서 왔는지: "출발 질문", "놀이와 친구", "'할머니'에서 이어짐", "질문 없이 쓴 기억" */
export function memoryOrigin(m: Memory, memories: Memory[], clues: Clue[]): string {
  if (m.from_clue_id) {
    const clue = clues.find((c) => c.id === m.from_clue_id);
    if (clue) return `'${clue.text}'에서 이어짐`;
  }
  if (m.parent_id) {
    const parent = memories.find((p) => p.id === m.parent_id);
    if (parent) return `'${shortName(parent)}'에서 이어짐`;
  }
  const q = getQuestion(m.question_id);
  if (!q) return "질문 없이 쓴 기억";
  if (q.layer === "start") return "출발 질문";
  if (q.layer === "topic") return q.dimension;
  return "이어진 기억";
}

/** 함께 보기에 보여줄 질문 종류 이름 (실마리가 들어간 질문 문장은 보여주지 않아요) */
export function questionKind(questionId: string | null): string {
  const q = getQuestion(questionId);
  if (!q) return "자유 기록";
  if (q.layer === "start") return "출발 질문";
  if (q.layer === "topic") return q.dimension;
  return "이어진 기억";
}

/**
 * 함께 보기에 보여줄 질문 문장.
 * 출발·주제 질문은 모두에게 같은 문장이라 그대로 보여줘요.
 * 이어가기 질문에는 쓴 사람의 실마리가 들어 있어서(비공개) 문장을 보여주지 않아요 → null
 */
export function sharedQuestionText(questionId: string | null): string | null {
  const q = getQuestion(questionId);
  if (q && (q.layer === "start" || q.layer === "topic")) return q.text;
  return null;
}

/** 기억을 짧게 부르는 이름 (제목, 없으면 본문 앞부분) */
export function shortName(m: Memory): string {
  if (m.title) return m.title;
  const text = m.body.replace(/\s+/g, " ").trim();
  return text.length > 12 ? `${text.slice(0, 12)}…` : text;
}
