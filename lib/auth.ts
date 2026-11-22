"use client";

// 가입·로그인·로그아웃과 오류 안내 문구
// 이메일은 로그인할 때만 쓰고, 화면 어디에도 다시 보여 주지 않아요.

import { supabase } from "./supabase/client";
import { cleanNickname, nicknameProblem } from "./nickname";
import { resetMyData } from "./useStored";

export const PASSWORD_MIN = 8;

/** 로그인 뒤 돌아갈 곳. 우리 앱 안의 주소만 허락해요. */
export function safeNext(next: string | null, fallback: string): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function friendly(message: string | undefined, code: string | undefined): string {
  const m = `${code ?? ""} ${message ?? ""}`.toLowerCase();
  if (m.includes("already") && m.includes("registered")) return "이미 가입한 이메일이에요. 로그인해 주세요.";
  if (m.includes("user_already_exists")) return "이미 가입한 이메일이에요. 로그인해 주세요.";
  if (m.includes("invalid login") || m.includes("invalid_credentials"))
    return "이메일이나 비밀번호가 맞지 않아요.";
  if (m.includes("password")) return `비밀번호는 ${PASSWORD_MIN}자 이상으로 적어 주세요.`;
  if (m.includes("email")) return "이메일 주소를 다시 확인해 주세요.";
  if (m.includes("database error saving new user"))
    return "이미 있는 별명이에요. 다른 별명을 적어 주세요.";
  if (m.includes("rate") || m.includes("too many")) return "잠시 뒤에 다시 해 주세요.";
  return "잠시 문제가 생겼어요. 다시 해 주세요.";
}

export async function signUp(email: string, password: string, rawNickname: string) {
  const nickname = cleanNickname(rawNickname);
  const problem = nicknameProblem(nickname);
  if (problem) return problem;
  if (password.length < PASSWORD_MIN) return `비밀번호는 ${PASSWORD_MIN}자 이상으로 적어 주세요.`;

  const { data: available, error: checkError } = await supabase().rpc("nickname_available", {
    p_nickname: nickname,
  });
  if (checkError) return friendly(checkError.message, checkError.code);
  if (!available) return "이미 있는 별명이에요. 다른 별명을 적어 주세요.";

  const { error } = await supabase().auth.signUp({
    email: email.trim(),
    password,
    options: { data: { nickname } },
  });
  if (error) return friendly(error.message, error.code);
  resetMyData();
  return null;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) return friendly(error.message, error.code);
  resetMyData();
  return null;
}

export async function signOut() {
  await supabase().auth.signOut();
  resetMyData();
}

/** 내 별명 바꾸기 */
export async function changeNickname(rawNickname: string) {
  const nickname = cleanNickname(rawNickname);
  const problem = nicknameProblem(nickname);
  if (problem) return problem;
  const { data: claims } = await supabase().auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return "다시 로그인해 주세요.";
  const { error } = await supabase().from("profiles").update({ nickname }).eq("id", userId);
  if (error?.code === "23505") return "이미 있는 별명이에요. 다른 별명을 적어 주세요.";
  if (error) return "잠시 문제가 생겼어요. 다시 해 주세요.";
  return null;
}
