"use client";

import Link from "next/link";
import { useState } from "react";
import DataGate from "@/components/DataGate";
import Seed from "@/components/Seed";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";
import { TOPICS, clueTypeLabel, topicQuestions } from "@/data/questions";
import { suggestion, topicCounts } from "@/lib/prompts";
import { unopenedClues } from "@/lib/storage";
import type { Clue, Memory } from "@/lib/types";

/** 열지 않은 실마리를 처음에 몇 개까지 보여줄지 */
const CLUE_PREVIEW = 3;

export default function Journey() {
  return (
    <DataGate>
      {({ memories, clues, guest }) => <JourneyView memories={memories} clues={clues} guest={guest} />}
    </DataGate>
  );
}

function JourneyView({ memories, clues, guest }: { memories: Memory[]; clues: Clue[]; guest: boolean }) {
  const [showAllClues, setShowAllClues] = useState(false);
  // 펼쳐 둔 주제 (한 번에 하나만)
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  // 질문마다 쓴 기억 수 (답한 질문 표시용)
  const answeredCount = new Map<string, number>();
  for (const m of memories) {
    if (m.question_id) answeredCount.set(m.question_id, (answeredCount.get(m.question_id) ?? 0) + 1);
  }

  const open = unopenedClues(clues, memories);
  const card = suggestion(memories, clues);
  const counts = topicCounts(memories);
  const shownClues = showAllClues ? open : open.slice(0, CLUE_PREVIEW);
  const hiddenCount = open.length - shownClues.length;

  return (
    <main className="flex flex-col gap-3 px-5 pt-2 pb-28">
      {/* 로그인하지 않고 둘러보는 중 (2026-11-28) */}
      {guest && (
        <p className="rounded-row bg-sand px-4 py-3 text-caption text-sand-ink">
          로그인하면 기억을 쓰고 모아 둘 수 있어요.{" "}
          <Link href="/login?next=%2Fjourney" className="text-primary underline">
            로그인
          </Link>
        </p>
      )}
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
        <Seed size={56} pose="lying" />
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
          {TOPICS.map((topic, i) => {
            const count = counts[topic];
            const empty = count === 0;
            const isOpen = openTopic === topic;
            const listId = `topic-questions-${i}`;
            return (
              <li key={topic} className="flex flex-col">
                {/* 주제 줄: 누르면 아래에 질문이 펼쳐져요 (한 번에 하나만) */}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={listId}
                  onClick={() => setOpenTopic(isOpen ? null : topic)}
                  className={`flex h-11 items-center gap-2 rounded-row px-4 text-left hover:ring-1 hover:ring-primary ${
                    empty ? "bg-sand" : "bg-card"
                  } ${isOpen ? "rounded-b-none" : ""}`}
                >
                  <span className="flex-1 text-ui text-ink">{topic}</span>
                  <span className={`text-caption ${empty ? "text-sand-ink" : "text-ink-sub"}`}>
                    {empty ? "비어 있어요" : `기억 ${count}개`}
                  </span>
                  <span className={`text-ink-sub transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDownIcon size={16} />
                  </span>
                </button>

                {isOpen && (
                  <ul
                    id={listId}
                    aria-label={`${topic} 질문`}
                    className="flex flex-col rounded-b-row border-t border-line bg-card px-2 pb-2"
                  >
                    {topicQuestions(topic).map((q) => {
                      const answered = answeredCount.get(q.id) ?? 0;
                      // 이미 답한 질문은 흐리게 보여 주고 다시 고를 수 없어요 (2026-11-28)
                      if (answered > 0) {
                        return (
                          <li
                            key={q.id}
                            className="flex min-h-11 items-center gap-2.5 px-2 py-2.5 opacity-50"
                          >
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-sub text-card">
                              <CheckIcon size={12} strokeWidth={3} />
                            </span>
                            <span className="flex-1 font-batang text-scene text-ink-sub">{q.text}</span>
                            <span className="shrink-0 text-tag text-ink-sub">
                              답했어요<span className="sr-only"> (다시 고를 수 없어요)</span>
                            </span>
                          </li>
                        );
                      }
                      return (
                        <li key={q.id}>
                          <Link
                            href={`/write?q=${q.id}`}
                            className="flex min-h-11 items-center gap-2.5 rounded-row px-2 py-2.5 hover:bg-paper"
                          >
                            <span
                              aria-hidden="true"
                              className="size-5 shrink-0 rounded-full border-2 border-off"
                            />
                            <span className="flex-1 font-batang text-scene text-ink">{q.text}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
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
