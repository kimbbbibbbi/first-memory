"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Seed from "@/components/Seed";
import { primaryButton, textLink } from "@/components/ui";
import { requestPasswordReset } from "@/lib/auth";

/** 비밀번호 찾기: 가입한 이메일로 재설정 링크 보내기 */
export default function ForgotForm() {
  const linkProblem = useSearchParams().get("error") === "link";
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const problem = await requestPasswordReset(email);
    setBusy(false);
    if (problem) return setError(problem);
    setSent(true);
  }

  return (
    <main className="flex flex-1 flex-col px-7 pt-14 pb-8">
      <Link href="/" className="self-center font-batang text-xl font-bold tracking-[0.1em] text-primary">
        첫 기억
      </Link>
      <div className="mt-8 flex flex-col items-center gap-2 text-center">
        <Seed size={56} />
        <h1 className="font-batang text-question font-bold">비밀번호 찾기</h1>
        <p className="text-ui text-ink-sub">
          가입한 이메일로 비밀번호를 다시 정하는 링크를 보내 드려요.
        </p>
      </div>

      {linkProblem && !sent && (
        <p role="alert" className="mt-6 rounded-row bg-sand px-4 py-3 text-ui text-sand-ink">
          링크가 만료됐거나 이미 쓴 링크예요. 메일을 다시 받아 주세요.
        </p>
      )}

      {sent ? (
        <div role="status" className="mt-8 flex flex-col gap-3 rounded-card bg-card p-5 text-ui leading-relaxed">
          <p className="font-batang text-card-question-sm font-bold">메일을 보냈어요</p>
          <p>
            가입한 이메일이라면 곧 &lsquo;첫 기억&rsquo;에서 메일이 도착해요. 메일 속 링크를 누르면 새
            비밀번호를 정할 수 있어요.
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-sub">
            <li>링크는 1시간 동안만 쓸 수 있어요.</li>
            <li>몇 분이 지나도 안 오면 스팸함도 확인해 주세요.</li>
          </ul>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-caption text-ink-sub">
              가입한 이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              className="h-12 rounded-row border border-chip-border bg-card px-4 text-input text-ink outline-none focus-visible:border-primary"
              required
            />
          </div>
          {error && (
            <p role="alert" className="rounded-row bg-sand px-4 py-3 text-ui text-sand-ink">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy || !email.trim()} className={`${primaryButton} mt-2`}>
            {busy ? "보내는 중…" : "재설정 메일 보내기"}
          </button>
        </form>
      )}

      <Link href="/login" className={`${textLink} mt-2`}>
        로그인으로 돌아가기
      </Link>
    </main>
  );
}
