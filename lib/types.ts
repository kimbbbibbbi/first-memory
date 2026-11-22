// 앱에서 쓰는 데이터의 모양이에요.
// Supabase 표(supabase/schema.sql)와 같은 이름을 써요. PLAN.md "데이터 구조"를 따라요.

import type { ClueType, Source } from "@/data/questions";

export type { ClueType, Source };

/** 공개 범위: private = 나만 보기, shared = 별명으로 공유 */
export type Visibility = "private" | "shared";

/** 기억 (memories) */
export interface Memory {
  id: string;
  user_id: string;
  /** 어떤 질문에 대한 답인지. 자유 기록이면 null */
  question_id: string | null;
  /**
   * 쓸 때 화면에 보였던 질문 문장.
   * 이어가기 질문은 실마리를 넣어 만든 문장이라, 나중에도 그대로 보여주려고 같이 남겨요.
   */
  question_text: string | null;
  /** 어느 기억에서 이어졌는지 (없을 수 있음) */
  parent_id: string | null;
  /** 어느 실마리에서 이어졌는지 (없을 수 있음) */
  from_clue_id: string | null;
  /** 자유 기록의 제목. 질문에 답한 기억은 빈 문자열이에요 */
  title: string;
  body: string;
  /** 그때 나이 범위 (살) */
  age_from: number;
  age_to: number;
  /** 기억의 출처: 직접 기억 · 사진/영상 · 들은 이야기 · 모름. 아직 안 골랐으면 null */
  source: Source | null;
  /** 처음엔 항상 "private". 쓴 사람이 기억 정리에서 직접 켜야 "shared" */
  visibility: Visibility;
  /** 공유를 켠 때 (함께 보기 순서용) */
  shared_at: string | null;
  /** 신고가 3번 쌓여 함께 보기에서 숨겨졌는지 */
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

/** 구체화 질문에 대한 답 (memory_details) */
export interface MemoryDetail {
  id: string;
  memory_id: string;
  question_id: string;
  /** null이면 "잘 모르겠어요" */
  answer: string | null;
  created_at: string;
}

/** 실마리 (clues) */
export interface Clue {
  id: string;
  memory_id: string;
  type: ClueType;
  text: string;
  created_at: string;
}
