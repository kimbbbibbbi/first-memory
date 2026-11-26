"use client";

// 지금 로그인했는지, 했다면 내 별명은 무엇인지 (화면 맨 위 로그인 칸에 써요)
// 로그인·로그아웃·계정 삭제·비밀번호 변경 때 Supabase가 알려 주면 자동으로 다시 확인해요.
// 이메일은 가져오지 않아요.

import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "./supabase/client";

export type Account =
  | { status: "checking" }
  | { status: "guest" }
  | { status: "member"; nickname: string };

const CHECKING: Account = { status: "checking" };

let account: Account = CHECKING;
let started = false;
let version = 0;
const listeners = new Set<() => void>();

function set(next: Account) {
  account = next;
  listeners.forEach((notify) => notify());
}

/** 로그인 상태와 별명을 다시 확인해요 (별명을 바꾼 뒤에도 불러요) */
export async function refreshAccount(): Promise<void> {
  const myVersion = ++version;
  const db = supabase();
  const { data } = await db.auth.getClaims();
  if (myVersion !== version) return;
  if (!data?.claims) return set({ status: "guest" });
  const { data: profile } = await db.from("profiles").select("nickname").maybeSingle();
  if (myVersion !== version) return;
  set({ status: "member", nickname: profile?.nickname ?? "" });
}

function start() {
  if (started) return;
  started = true;
  void refreshAccount();
  supabase().auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
      // Supabase 안내대로, 이 알림 안에서 바로 다른 요청을 하지 않고 잠깐 뒤에 해요
      setTimeout(() => void refreshAccount(), 0);
    }
  });
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function useAccount(): Account {
  const value = useSyncExternalStore(subscribe, () => account, () => CHECKING);
  useEffect(start, []);
  return value;
}
