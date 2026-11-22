"use client";

// 가입·로그인·로그아웃과 오류 안내 문구
// 이메일은 로그인할 때만 쓰고, 화면 어디에도 다시 보여 주지 않아요.

import { supabase } from "./supabase/client";
import { cleanNickname, nicknameProblem } from "./nickname";
import { resetMyData } from "./useStored";

/** Supabase가 허락하는 가장 짧은 길이 (Authentication 설정의 Minimum password length와 같게) */
export const PASSWORD_MIN = 6;

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

/**
 * 비밀번호 재설정 메일 보내기.
 * 가입하지 않은 이메일이어도 똑같이 "보냈어요"라고 답해요 (가입 여부를 알려 주지 않으려고요).
 * 메일 속 링크는 Supabase 메일 템플릿에서 /auth/confirm 으로 가게 정해요.
 */
export async function requestPasswordReset(email: string) {
  const trimmed = email.trim();
  if (!trimmed.includes("@")) return "이메일 주소를 다시 확인해 주세요.";
  const { error } = await supabase().auth.resetPasswordForEmail(trimmed, {
    redirectTo: `${window.location.origin}/auth/confirm`,
  });
  if (error) {
    const m = `${error.code ?? ""} ${error.message}`.toLowerCase();
    if (m.includes("rate") || m.includes("seconds")) return "조금 전에 보냈어요. 잠시 뒤에 다시 해 주세요.";
    if (m.includes("email")) return "이메일 주소를 다시 확인해 주세요.";
    return "메일을 보내지 못했어요. 잠시 뒤에 다시 해 주세요.";
  }
  return null;
}

/** 새 비밀번호 저장 (재설정 링크로 들어온 뒤) */
export async function setNewPassword(password: string, again: string) {
  if (password.length < PASSWORD_MIN) return `비밀번호는 ${PASSWORD_MIN}자 이상으로 적어 주세요.`;
  if (password !== again) return "비밀번호와 비밀번호 확인이 달라요. 다시 적어 주세요.";
  const { error } = await supabase().auth.updateUser({ password });
  if (error) {
    const m = `${error.code ?? ""} ${error.message}`.toLowerCase();
    if (m.includes("same_password") || m.includes("different from the old"))
      return "예전 비밀번호와 다른 비밀번호를 적어 주세요.";
    if (m.includes("session") || m.includes("jwt")) return "링크가 만료됐어요. 비밀번호 찾기를 다시 해 주세요.";
    return friendly(error.message, error.code);
  }
  resetMyData();
  return null;
}

/**
 * 계정 삭제: 비밀번호가 맞는지 먼저 확인한 뒤, 데이터베이스의 delete_my_account 함수로 지워요.
 * 계정과 기억·답·실마리·공감·신고가 모두 지워지고 되돌릴 수 없어요.
 * (이메일은 확인용으로만 쓰고 화면에 보여 주지 않아요)
 */
export async function deleteAccount(password: string) {
  if (!password) return "비밀번호를 적어 주세요.";
  const db = supabase();
  const { data } = await db.auth.getUser();
  const email = data.user?.email;
  if (!email) return "다시 로그인해 주세요.";

  const check = await db.auth.signInWithPassword({ email, password });
  if (check.error) return "비밀번호가 맞지 않아요.";

  const { error } = await db.rpc("delete_my_account");
  if (error) return "계정을 지우지 못했어요. 잠시 뒤에 다시 해 주세요.";

  await db.auth.signOut({ scope: "local" });
  resetMyData();
  return null;
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
