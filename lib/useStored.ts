"use client";

// 로그인한 사람의 기억·구체화 답·실마리·별명을 서버(Supabase)에서 불러와 담아 두는 곳이에요.
// 여러 화면이 같은 내용을 보고, 저장하면 모든 화면이 자동으로 새 내용을 보여줘요.
// (Next.js는 떠난 화면도 숨겨서 남겨 두기 때문에, 한곳에 모아 두고 바뀌면 알려 줘요.)
// 데이터베이스 규칙(RLS) 덕분에 내 것만 불러와져요.

import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "./supabase/client";
import type { Clue, Memory, MemoryDetail } from "./types";

export interface MyData {
  status: "loading" | "ready" | "error";
  memories: Memory[];
  details: MemoryDetail[];
  clues: Clue[];
  nickname: string | null;
}

const INITIAL: MyData = { status: "loading", memories: [], details: [], clues: [], nickname: null };

let state: MyData = INITIAL;
let started = false;
let version = 0;
const listeners = new Set<() => void>();

function setState(next: MyData) {
  state = next;
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

/** 서버에서 내 것을 모두 다시 불러와요 (저장한 뒤에도 불러요) */
export async function refreshMyData(): Promise<void> {
  started = true;
  const myVersion = ++version;
  const db = supabase();
  const [memories, details, clues, profile] = await Promise.all([
    db.from("memories").select("*").order("created_at"),
    db.from("memory_details").select("*").order("created_at"),
    db.from("clues").select("*").order("created_at"),
    db.from("profiles").select("nickname").maybeSingle(),
  ]);
  if (myVersion !== version) return; // 그사이 로그아웃 등으로 새로 불러오기 시작했으면 버려요
  const error = memories.error ?? details.error ?? clues.error ?? profile.error;
  if (error) {
    setState({ ...state, status: "error" });
    return;
  }
  setState({
    status: "ready",
    memories: (memories.data ?? []) as Memory[],
    details: (details.data ?? []) as MemoryDetail[],
    clues: (clues.data ?? []) as Clue[],
    nickname: profile.data?.nickname ?? null,
  });
}

/** 로그인·로그아웃할 때 담아 둔 것을 비워요 (다른 사람 것이 섞이지 않게) */
export function resetMyData() {
  version++;
  started = false;
  setState(INITIAL);
}

/** 화면에서 내 데이터 쓰기. 처음 부르면 서버에서 불러오기 시작해요. */
export function useMyData(): MyData {
  const data = useSyncExternalStore(subscribe, () => state, () => INITIAL);
  useEffect(() => {
    if (!started) void refreshMyData();
  });
  return data;
}
