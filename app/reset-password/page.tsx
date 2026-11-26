"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import Seed from "@/components/Seed";
import { primaryButton, textLink } from "@/components/ui";
import { PASSWORD_MIN, setNewPassword } from "@/lib/auth";

/** 새 비밀번호 정하기 (메일 속 링크로 들어오면 로그인된 상태로 이 화면이 열려요) */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const problem = await setNewPassword(password, again);
    setBusy(false);
    if (problem) return setError(problem);
    setDone(true);
  }

  return (
    <main className="flex flex-1 flex-col px-7 pt-14 pb-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Seed size={72} />
        <h1 className="font-batang text-question font-bold">새 비밀번호 정하기</h1>
      </div>

      {done ? (
        <div role="status" className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-ui">비밀번호를 바꿨어요. 다음부터는 새 비밀번호로 로그인해 주세요.</p>
          <button
            type="button"
            onClick={() => {
              router.replace("/journey");
              router.refresh();
            }}
            className={primaryButton}
          >
            기억 쓰러 가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
          <PasswordInput
            id="new-password"
            label={`새 비밀번호 (${PASSWORD_MIN}자 이상)`}
            value={password}
            onChange={(v) => {
              setPassword(v);
              setError("");
            }}
            autoComplete="new-password"
          />
          <PasswordInput
            id="new-password-again"
            label="새 비밀번호 확인"
            value={again}
            onChange={(v) => {
              setAgain(v);
              setError("");
            }}
            autoComplete="new-password"
          />
          {again && password !== again && (
            <p className="-mt-2 text-caption text-sand-ink" aria-live="polite">
              비밀번호와 다르게 적혔어요.
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-row bg-sand px-4 py-3 text-ui text-sand-ink">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className={`${primaryButton} mt-2`}>
            {busy ? "저장하는 중…" : "새 비밀번호 저장"}
          </button>
          <Link href="/forgot-password" className={textLink}>
            링크가 안 되나요? 메일 다시 받기
          </Link>
        </form>
      )}
    </main>
  );
}
