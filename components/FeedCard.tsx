"use client";

import Link from "next/link";
import { useState } from "react";
import { REPORT_REASONS, report, setReaction, type FeedItem, type ReportReason } from "@/lib/feed";
import { questionKind, sharedQuestionText } from "@/lib/prompts";
import { HeartIcon } from "./icons";

/**
 * 함께 보기 카드: 별명, 질문 문장, 본문, 공감, 신고 (댓글은 없어요)
 * 질문 문장은 출발·주제 질문만 보여줘요. 이어가기·자유 기록은 "이어진 기억", "자유 기록"만 보여줘요.
 */
export default function FeedCard({
  item,
  index,
  loggedIn,
  onReported,
}: {
  item: FeedItem;
  index: number;
  loggedIn: boolean;
  onReported: (id: string) => void;
}) {
  const [reacted, setReacted] = useState(item.reacted);
  const [count, setCount] = useState(item.reaction_count);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const question = sharedQuestionText(item.question_id);
  const avatarTone =index % 2 === 0 ? "bg-mist text-mist-ink" : "bg-sand text-sand-ink";
  const loginHref = "/login?next=%2Ftogether";

  async function toggleReaction() {
    if (!loggedIn) return setNotice("로그인하면 공감할 수 있어요.");
    const next = !reacted;
    setReacted(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      await setReaction(item.id, next);
    } catch {
      setReacted(!next);
      setCount((c) => c + (next ? -1 : 1));
      setNotice("공감하지 못했어요. 다시 해 주세요.");
    }
  }

  async function sendReport() {
    if (!reason) return;
    setBusy(true);
    try {
      const result = await report(item.id, reason);
      setReporting(false);
      if (result === "already") setNotice("이미 신고한 기억이에요.");
      else onReported(item.id);
    } catch {
      setNotice("신고하지 못했어요. 다시 해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-card bg-card p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`flex size-7 items-center justify-center rounded-full text-tag ${avatarTone}`}
        >
          {item.nickname.slice(0, 1)}
        </span>
        <span className="text-ui">{item.nickname}</span>
        {!question && (
          <span className="text-caption text-ink-sub">· {questionKind(item.question_id)}</span>
        )}
      </div>

      {question && (
        <p className="font-batang text-scene font-bold text-ink-sub">{question}</p>
      )}
      <p className="font-batang text-memory whitespace-pre-line">{item.body}</p>

      <div className="flex items-center justify-between">
        {item.is_mine ? (
          <span className="text-caption text-ink-sub">내 기억 · 공감 {count}</span>
        ) : (
          <button
            type="button"
            aria-pressed={reacted}
            onClick={toggleReaction}
            className={`flex h-11 items-center gap-1.5 rounded-full border px-4 text-sm ${
              reacted
                ? "border-primary bg-mist text-mist-ink"
                : "border-chip-border bg-paper text-ink hover:border-primary"
            }`}
          >
            <HeartIcon filled={reacted} size={16} />
            공감 {count}
          </button>
        )}
        {!item.is_mine && !reporting && (
          <button
            type="button"
            onClick={() => (loggedIn ? setReporting(true) : setNotice("로그인하면 신고할 수 있어요."))}
            className="flex h-11 items-center px-2 text-caption text-ink-sub hover:text-ink"
          >
            신고
          </button>
        )}
      </div>

      {reporting && (
        <fieldset className="flex flex-col gap-2 rounded-row bg-sand p-3">
          <legend className="sr-only">신고 이유</legend>
          <span className="text-caption text-sand-ink">어떤 점이 걱정되나요?</span>
          {REPORT_REASONS.map((r) => (
            <label key={r.id} className="flex min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name={`reason-${item.id}`}
                value={r.id}
                checked={reason === r.id}
                onChange={() => setReason(r.id)}
                className="size-4 accent-primary"
              />
              {r.label}
            </label>
          ))}
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setReporting(false)}
              className="flex h-11 items-center px-3 text-sm text-ink-sub"
            >
              취소
            </button>
            <button
              type="button"
              onClick={sendReport}
              disabled={!reason || busy}
              className="flex h-11 items-center rounded-full bg-primary px-4 text-sm text-card disabled:bg-off"
            >
              신고하기
            </button>
          </div>
        </fieldset>
      )}

      {notice && (
        <p role="status" className="text-caption text-sand-ink">
          {notice}{" "}
          {!loggedIn && (
            <Link href={loginHref} className="text-primary underline">
              로그인하기
            </Link>
          )}
        </p>
      )}
    </li>
  );
}
