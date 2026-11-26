"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DataGate from "@/components/DataGate";
import PasswordInput from "@/components/PasswordInput";
import Seed from "@/components/Seed";
import { outlineButton, primaryButton, textLink } from "@/components/ui";
import { changeNickname, deleteAccount, signOut } from "@/lib/auth";
import { NICKNAME_MAX, NICKNAME_MIN } from "@/lib/nickname";
import { refreshAccount } from "@/lib/account";
import type { Memory } from "@/lib/types";
import { refreshMyData } from "@/lib/useStored";

/**
 * 마이페이지: 내 별명, 쓴 기억·공유 중 수, 내 기억 바로가기,
 * 별명 바꾸기, 로그아웃, 처리방침, 계정 삭제 (이메일은 보여 주지 않아요)
 */
export default function MyPage() {
  const [deleted, setDeleted] = useState(false);

  if (deleted) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-7 text-center">
        <Seed size={56} />
        <p role="status" className="font-batang text-card-question font-bold">
          계정을 지웠어요
        </p>
        <p className="text-ui text-ink-sub">그동안 쓴 기억과 함께 모두 지워졌어요. 고마웠어요.</p>
        <Link href="/" className={textLink}>
          처음 화면으로
        </Link>
      </main>
    );
  }

  return (
    <DataGate>
      {({ nickname, memories }) => (
        <MyPageView
          current={nickname ?? ""}
          memories={memories}
          onDeleted={() => setDeleted(true)}
        />
      )}
    </DataGate>
  );
}

function MyPageView({
  current,
  memories,
  onDeleted,
}: {
  current: string;
  memories: Memory[];
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [nickname, setNickname] = useState(current);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const sharedCount = memories.filter((m) => m.visibility === "shared").length;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const problem = await changeNickname(nickname);
    if (problem) setMessage({ kind: "error", text: problem });
    else {
      await Promise.all([refreshMyData(), refreshAccount()]);
      setMessage({ kind: "ok", text: "별명을 바꿨어요. 공유한 기억에도 새 별명이 보여요." });
    }
    setBusy(false);
  }

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-2 pb-8">
      {/* 내 정보 카드 */}
      <section aria-label="내 정보" className="flex flex-col gap-4 rounded-card-lg bg-card p-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-mist font-batang text-question text-mist-ink"
          >
            {current.slice(0, 1)}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-caption text-ink-sub">내 별명</span>
            <span className="truncate font-batang text-card-question font-bold">{current}</span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-row bg-paper p-3">
            <dt className="text-caption text-ink-sub">쓴 기억</dt>
            <dd className="font-batang text-question font-bold">{memories.length}개</dd>
          </div>
          <div className="flex flex-col gap-1 rounded-row bg-paper p-3">
            <dt className="text-caption text-ink-sub">공유 중</dt>
            <dd className="font-batang text-question font-bold">{sharedCount}개</dd>
          </div>
        </dl>
        <Link href="/memories" className={primaryButton}>
          내 기억 보러 가기
        </Link>
      </section>

      <form onSubmit={handleSave} className="flex flex-col gap-3 rounded-card bg-card p-4">
        <label htmlFor="nickname" className="font-batang text-card-question-sm font-bold">
          별명 바꾸기
        </label>
        <p className="text-caption text-ink-sub">
          함께 보기에서 다른 사람에게 보이는 이름이에요. {NICKNAME_MIN}~{NICKNAME_MAX}자로 적어 주세요.
        </p>
        <input
          id="nickname"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setMessage(null);
          }}
          maxLength={NICKNAME_MAX + 4}
          autoComplete="nickname"
          className="h-12 rounded-row border border-chip-border bg-paper px-4 text-input text-ink outline-none focus-visible:border-primary"
        />
        {message && (
          <p
            role={message.kind === "error" ? "alert" : "status"}
            className={`rounded-row px-4 py-3 text-ui ${
              message.kind === "error" ? "bg-sand text-sand-ink" : "bg-mist text-mist-ink"
            }`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || nickname.trim() === current}
          className={primaryButton}
        >
          별명 바꾸기
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <button type="button" onClick={handleSignOut} disabled={busy} className={outlineButton}>
          로그아웃
        </button>
        <Link href="/privacy" className={textLink}>
          개인정보 처리방침
        </Link>
      </div>

      <DeleteAccount onDeleted={onDeleted} />
    </main>
  );
}

/** 계정 삭제: 비밀번호를 다시 적어야 지워져요 */
function DeleteAccount({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const problem = await deleteAccount(password);
    setBusy(false);
    if (problem) return setError(problem);
    onDeleted();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center justify-center self-center px-3 text-sm text-ink-sub underline hover:text-ink"
      >
        계정 삭제
      </button>
    );
  }

  return (
    <form
      onSubmit={handleDelete}
      aria-labelledby="delete-title"
      className="flex flex-col gap-3 rounded-card border border-sand-dashed bg-sand p-4"
    >
      <h2 id="delete-title" className="font-batang text-card-question-sm font-bold text-sand-ink">
        계정 삭제
      </h2>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-sand-ink">
        <li>계정과 그동안 쓴 기억, 답, 실마리, 공감이 모두 바로 지워져요.</li>
        <li>공유한 기억도 함께 보기에서 바로 사라져요.</li>
        <li>지운 뒤에는 되돌릴 수 없어요.</li>
      </ul>
      <PasswordInput
        id="delete-password"
        label="확인을 위해 비밀번호를 다시 적어 주세요"
        value={password}
        onChange={(v) => {
          setPassword(v);
          setError("");
        }}
        autoComplete="current-password"
      />
      {error && (
        <p role="alert" className="text-ui text-sand-ink">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setPassword("");
            setError("");
          }}
          className="flex h-12 flex-1 items-center justify-center rounded-row border border-chip-border bg-card text-ui text-ink"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={busy || !password}
          className="flex h-12 flex-1 items-center justify-center rounded-row bg-sand-ink text-ui text-card disabled:bg-off"
        >
          {busy ? "지우는 중…" : "영구 삭제"}
        </button>
      </div>
    </form>
  );
}
