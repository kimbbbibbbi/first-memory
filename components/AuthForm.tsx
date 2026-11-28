"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PASSWORD_MIN, safeNext, signIn, signUp } from "@/lib/auth";
import { NICKNAME_MAX, NICKNAME_MIN } from "@/lib/nickname";
import PasswordInput from "./PasswordInput";
import Seed from "./Seed";
import { primaryButton, textLink } from "./ui";

const inputClass =
  "h-12 rounded-row border border-chip-border bg-card px-4 text-input text-ink outline-none placeholder:text-ink-sub focus-visible:border-primary";

/** 가입·로그인 화면 공통 */
export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [nickname, setNickname] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";
  const goTo = safeNext(next, isSignup ? "/write?q=s-1" : "/journey");
  // 기억 쓰기 화면에서 넘어왔으면 왜 로그인해야 하는지 알려 줘요 (2026-11-28)
  const fromWriting = /^\/(write|deepen|organize|branch)(\?|$)/.test(goTo);
  const otherHref = `${isSignup ? "/login" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (isSignup && password !== passwordAgain) {
      return setError("비밀번호와 비밀번호 확인이 달라요. 다시 적어 주세요.");
    }
    if (isSignup && !agreed) {
      return setError("만 14세 이상이고 개인정보 처리방침에 동의해야 가입할 수 있어요.");
    }
    setBusy(true);
    const problem = isSignup
      ? await signUp(email, password, nickname)
      : await signIn(email, password);
    setBusy(false);
    if (problem) return setError(problem);
    router.replace(goTo);
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col px-7 pt-14 pb-8">
      <Link href="/" className="self-center font-batang text-xl font-bold tracking-[0.1em] text-primary">
        첫 기억
      </Link>
      <div className="mt-8 flex flex-col items-center gap-2 text-center">
        <Seed size={56} />
        <h1 className="font-batang text-question font-bold">{isSignup ? "가입하기" : "로그인"}</h1>
        <p className="text-ui text-ink-sub">
          {isSignup
            ? "다른 사람에게는 별명만 보여요. 이메일은 어디에도 보이지 않아요."
            : "쓴 기억은 로그인하면 어디서든 볼 수 있어요."}
        </p>
      </div>

      {fromWriting && (
        <p role="note" className="mt-6 rounded-row bg-sand px-4 py-3 text-center text-caption text-sand-ink">
          기억을 쓰려면 로그인이 필요해요.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        {isSignup && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nickname" className="text-caption text-ink-sub">
              별명 ({NICKNAME_MIN}~{NICKNAME_MAX}자, 다른 사람에게 보여요)
            </label>
            <input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={NICKNAME_MAX + 4}
              autoComplete="nickname"
              placeholder="예: 마루의 햇빛"
              className={inputClass}
              required
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-caption text-ink-sub">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
            required
          />
        </div>
        <PasswordInput
          id="password"
          label={isSignup ? `비밀번호 (${PASSWORD_MIN}자 이상)` : "비밀번호"}
          value={password}
          onChange={setPassword}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
        {isSignup && (
          <PasswordInput
            id="password-again"
            label="비밀번호 확인"
            value={passwordAgain}
            onChange={setPasswordAgain}
            autoComplete="new-password"
          />
        )}
        {isSignup && passwordAgain && password !== passwordAgain && (
          <p className="-mt-2 text-caption text-sand-ink" aria-live="polite">
            비밀번호와 다르게 적혔어요.
          </p>
        )}

        {isSignup && (
          <label className="flex min-h-11 items-start gap-2.5 rounded-row bg-card px-4 py-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              aria-label="[필수] 만 14세 이상이며, 개인정보 처리방침을 읽고 동의해요"
              className="mt-0.5 size-5 shrink-0 accent-primary"
            />
            <span>
              [필수] 만 14세 이상이며,{" "}
              <Link href="/privacy" target="_blank" className="text-primary underline">
                개인정보 처리방침
              </Link>
              을 읽고 동의해요.
            </span>
          </label>
        )}

        {error && (
          <p role="alert" className="rounded-row bg-sand px-4 py-3 text-ui text-sand-ink">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className={`${primaryButton} mt-2`}>
          {busy ? "잠시만요…" : isSignup ? "가입하고 시작하기" : "로그인"}
        </button>
      </form>

      <Link href={otherHref} className={`${textLink} mt-2`}>
        {isSignup ? "이미 가입했다면, 로그인" : "처음이라면, 가입하기"}
      </Link>
      {!isSignup && (
        <Link
          href="/forgot-password"
          className="flex h-11 items-center justify-center text-sm text-ink-sub underline hover:text-ink"
        >
          비밀번호를 잊었어요
        </Link>
      )}
    </main>
  );
}
