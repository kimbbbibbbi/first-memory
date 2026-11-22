"use client";

import Link from "next/link";
import { use, useState } from "react";
import { browser } from "react-dom";
import Seed from "@/components/Seed";
import { TOPICS, clueTypeLabel } from "@/data/questions";
import { nextTopicQuestion, suggestion, topicCounts } from "@/lib/prompts";
import { unopenedClues } from "@/lib/storage";
import { useClues, useMemories } from "@/lib/useStored";

/** 열지 않은 실마리를 처음에 몇 개까지 보여줄지 */
const CLUE_PREVIEW = 3;

export default function Journey() {
  use(browser("기억은 브라우저(localStorage)에 저장돼 있어요."));

  const memories = useMemories();
  const clues = useClues();
  const [showAllClues, setShowAllClues] = useState(false);

  const open = unopenedClues(clues, memories);
  const card = suggestion(memories, clues);
  const counts = topicCounts(memories);
  const shownClues = showAllClues ? open : open.slice(0, CLUE_PREVIEW);
  const hiddenCount = open.length - shownClues.length;

  return (
    <main className="flex flex-col gap-3 px-5 pt-2 pb-28">
      {/* 통계 카드 2개 */}
      <div className="flex gap-3">
        <Stat label="쓴 기억" value={`${memories.length}개`} />
        <Stat label="열지 않은 실마리" value={`${open.length}개`} />
      </div>

      {/* 이어서 쓰기 큰 카드 */}
      <section
        aria-label="이어서 쓰기"
        className="flex flex-col items-center rounded-card-lg bg-card px-5 pt-5 pb-2 text-center"
      >
        <Seed size={56} />
        <span className="mt-2.5 text-caption text-ink-sub">{card.label}</span>
        <p className="mt-1.5 mb-4 font-batang text-card-question font-bold">{card.text}</p>
        <Link
          href={card.href}
          className="flex h-13 w-full items-center justify-center border-t border-line text-base text-primary hover:text-primary-hover"
        >
          답하러 가기
        </Link>
      </section>

      {/* 열지 않은 실마리 */}
      {open.length > 0 && (
        <section aria-labelledby="open-clues" className="flex flex-col gap-2.5 pt-2">
          <div className="flex items-center justify-between">
            <h2 id="open-clues" className="font-batang text-card-question-sm font-bold">
              열지 않은 실마리
            </h2>
            {open.length > CLUE_PREVIEW && (
              <button
                type="button"
                onClick={() => setShowAllClues(!showAllClues)}
                className="flex h-11 items-center text-caption text-primary underline"
              >
                {showAllClues ? "접기" : "전체 보기"}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {shownClues.map((c) => (
              <Link
                key={c.id}
                href={`/branch?clue=${c.id}`}
                className="flex h-11 items-center gap-1.5 rounded-full border border-chip-border bg-card px-3.5 text-sm text-ink hover:border-primary"
              >
                {c.text}
                <span className="text-tag text-ink-sub">{clueTypeLabel(c.type)}</span>
              </Link>
            ))}
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllClues(true)}
                aria-label={`실마리 ${hiddenCount}개 더 보기`}
                className="flex h-11 items-center rounded-full border border-chip-border bg-card px-3.5 text-sm text-ink-sub hover:border-primary"
              >
                +{hiddenCount}
              </button>
            )}
          </div>
        </section>
      )}

      {/* 주제 질문 */}
      <section aria-labelledby="topics" className="flex flex-col gap-2.5 pt-2">
        <div className="flex items-center justify-between">
          <h2 id="topics" className="font-batang text-card-question-sm font-bold">
            주제 질문
          </h2>
          <span className="text-caption text-ink-sub">빈 주제부터 채워 보세요</span>
        </div>
        <ul className="flex flex-col gap-1">
          {TOPICS.map((topic) => {
            const count = counts[topic];
            const empty = count === 0;
            return (
              <li key={topic}>
                <Link
                  href={`/write?q=${nextTopicQuestion(topic, memories).id}`}
                  className={`flex h-11 items-center justify-between rounded-row px-4 hover:ring-1 hover:ring-primary ${
                    empty ? "bg-sand" : "bg-card"
                  }`}
                >
                  <span className="text-ui">{topic}</span>
                  <span className={`text-caption ${empty ? "text-sand-ink" : "text-ink-sub"}`}>
                    {empty ? "비어 있어요" : `기억 ${count}개`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-card bg-card p-4">
      <span className="text-caption text-ink-sub">{label}</span>
      <span className="font-batang text-question font-bold">{value}</span>
    </div>
  );
}
