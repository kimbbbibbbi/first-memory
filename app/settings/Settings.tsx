"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DataGate from "@/components/DataGate";
import { outlineButton, primaryButton } from "@/components/ui";
import { changeNickname, signOut } from "@/lib/auth";
import { NICKNAME_MAX, NICKNAME_MIN } from "@/lib/nickname";
import { refreshMyData } from "@/lib/useStored";

/** 설정: 별명 바꾸기, 로그아웃 (이메일은 보여 주지 않아요) */
export default function Settings() {
  return <DataGate>{({ nickname }) => <SettingsForm current={nickname ?? ""} />}</DataGate>;
}

function SettingsForm({ current }: { current: string }) {
  const router = useRouter();
  const [nickname, setNickname] = useState(current);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const problem = await changeNickname(nickname);
    if (problem) setMessage({ kind: "error", text: problem });
    else {
      await refreshMyData();
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
      <form onSubmit={handleSave} className="flex flex-col gap-3 rounded-card bg-card p-4">
        <label htmlFor="nickname" className="font-batang text-card-question-sm font-bold">
          별명
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
        <p className="text-center text-caption text-ink-sub">
          내보내기와 계정 삭제는 곧 열려요.
        </p>
      </div>
    </main>
  );
}
