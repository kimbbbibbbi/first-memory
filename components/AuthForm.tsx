"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PASSWORD_MIN, safeNext, signIn, signUp } from "@/lib/auth";
import { NICKNAME_MAX, NICKNAME_MIN } from "@/lib/nickname";
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
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";
  const goTo = safeNext(next, isSignup ? "/write?q=s-1" : "/journey");
  const otherHref = `${isSignup ? "/login" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-caption text-ink-sub">
            비밀번호{isSignup ? ` (${PASSWORD_MIN}자 이상)` : ""}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className={inputClass}
            required
          />
        </div>

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
    </main>
  );
}
