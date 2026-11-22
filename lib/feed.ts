"use client";

// 함께 보기: 공유된 기억 읽기, 공감, 신고
// 다른 사람의 기억은 데이터베이스의 get_feed 함수로만 읽어요.
// 이 함수는 본문, 별명, 질문 번호, 공감 수만 돌려줘요 (나이·출처·실마리·답·이메일은 없어요).

import { useEffect, useState } from "react";
import { supabase } from "./supabase/client";

export interface FeedItem {
  id: string;
  body: string;
  nickname: string;
  question_id: string | null;
  reaction_count: number;
  reacted: boolean;
  is_mine: boolean;
}

export const FEED_PAGE = 20;

export async function loadFeed(offset: number): Promise<FeedItem[]> {
  const { data, error } = await supabase().rpc("get_feed", { p_limit: FEED_PAGE, p_offset: offset });
  if (error) throw error;
  return ((data ?? []) as FeedItem[]).map((d) => ({ ...d, reaction_count: Number(d.reaction_count) }));
}

/** 공감 누르기 / 취소하기 */
export async function setReaction(memoryId: string, on: boolean): Promise<void> {
  const db = supabase();
  const { error } = on
    ? await db.from("reactions").insert({ memory_id: memoryId })
    : await db.from("reactions").delete().eq("memory_id", memoryId);
  if (error && error.code !== "23505") throw error; // 23505: 이미 눌러 둔 공감
}

export type ReportReason = "privacy" | "hurtful" | "other";

export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: "privacy", label: "실명·연락처 같은 개인정보가 있어요" },
  { id: "hurtful", label: "불쾌하거나 상처 주는 내용이에요" },
  { id: "other", label: "기타" },
];

/** 신고하기. 이미 신고했으면 "already"를 돌려줘요. */
export async function report(memoryId: string, reason: ReportReason): Promise<"ok" | "already"> {
  const { error } = await supabase().from("reports").insert({ memory_id: memoryId, reason });
  if (error?.code === "23505") return "already";
  if (error) throw error;
  return "ok";
}

/** 로그인했는지 (공감·신고 버튼에 써요). 처음엔 null(확인 중) */
export function useLoggedIn(): boolean | null {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    supabase()
      .auth.getClaims()
      .then(({ data }) => {
        if (alive) setLoggedIn(Boolean(data?.claims));
      });
    return () => {
      alive = false;
    };
  }, []);
  return loggedIn;
}
