"use client";

import Link from "next/link";
import { useState } from "react";
import { formatAgeRange } from "@/lib/ages";
import type { Memory } from "@/lib/types";
import StatusTag from "./StatusTag";

/** 타임라인의 기억 카드 한 장: "나이 · 어디서 온 기억" + 본문 + 상태 태그 + 수정/삭제 */
export default function MemoryCard({
  memory,
  origin,
  onDelete,
}: {
  memory: Memory;
  /** 예: "출발 질문", "놀이와 친구", "'할머니'에서 이어짐" */
  origin: string;
  onDelete: (id: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setBusy(true);
    setError("");
    try {
      await onDelete(memory.id);
    } catch {
      setError("지우지 못했어요. 다시 해 주세요.");
      setBusy(false);
    }
  }

  const smallButton =
    "flex h-11 items-center rounded-full px-3 text-sm text-ink-sub hover:text-ink";

  return (
    <li className="relative flex flex-col gap-2">
      {/* 타임라인 점 */}
      <span
        aria-hidden="true"
        className="absolute top-0.5 -left-6 box-content size-3.5 rounded-full border-3 border-paper bg-primary"
      />
      <span className="text-caption text-ink-sub">
        {formatAgeRange(memory.age_from, memory.age_to)} · {origin}
      </span>

      <article className="flex flex-col gap-2.5 rounded-card bg-card p-4">
        {memory.question_text && (
          <p className="text-caption text-ink-sub">{memory.question_text}</p>
        )}
        {memory.title && (
          <h2 className="font-batang text-memory font-bold">{memory.title}</h2>
        )}
        <p className="font-batang text-memory whitespace-pre-line">{memory.body}</p>

        <div className="flex items-center justify-between gap-2">
          <StatusTag shared={memory.visibility === "shared"} hidden={memory.hidden} />
          {!confirming && (
            <div className="flex items-center whitespace-nowrap">
              <Link href={`/organize?id=${memory.id}`} className={smallButton}>
                정리
              </Link>
              <Link href={`/write?edit=${memory.id}`} className={smallButton}>
                수정
              </Link>
              <button
                type="button"
                className={smallButton}
                onClick={() => setConfirming(true)}
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {confirming && (
          <div
            role="group"
            aria-label="삭제 확인"
            className="flex items-center gap-1 rounded-row bg-sand py-1 pl-4"
          >
            <span className="min-w-0 flex-1 text-sm text-sand-ink">
              {error || (
                <>
                  정말 지울까요?
                  <br />
                  {memory.visibility === "shared"
                    ? "함께 보기에서도 바로 사라져요."
                    : "답과 실마리도 함께 지워져요."}
                </>
              )}
            </span>
            <button
              type="button"
              disabled={busy}
              className={`${smallButton} shrink-0 font-bold text-sand-ink`}
              onClick={handleDelete}
            >
              지우기
            </button>
            <button
              type="button"
              className={`${smallButton} shrink-0`}
              onClick={() => setConfirming(false)}
            >
              취소
            </button>
          </div>
        )}
      </article>
    </li>
  );
}
