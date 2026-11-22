"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { browser } from "react-dom";
import { BackLink } from "@/components/BackLink";
import Chip from "@/components/Chip";
import LinedTextarea from "@/components/LinedTextarea";
import MissingMemory from "@/components/MissingMemory";
import PageHeader from "@/components/PageHeader";
import ProgressBar from "@/components/ProgressBar";
import SceneBox from "@/components/SceneBox";
import Tag from "@/components/Tag";
import { pairLeftButton, pairRightButton } from "@/components/ui";
import {
  ALT_DETAIL_IDS,
  DEFAULT_DETAIL_IDS,
  SOURCES,
  SOURCE_QUESTION_ID,
  getQuestion,
  type Source,
} from "@/data/questions";
import { loadDetails, saveDetail, updateMemory } from "@/lib/storage";
import type { Memory } from "@/lib/types";
import { useMemories } from "@/lib/useStored";

const ANSWER_MAX = 200;

export default function Deepen() {
  use(browser("기억은 브라우저(localStorage)에 저장돼 있어요."));
  const id = useSearchParams().get("id");
  const { bfcacheId } = useRouter();
  const memory = useMemories().find((m) => m.id === id);

  if (!memory) return <MissingMemory title="더 떠올려 보기" />;
  return <DeepenCards key={`${bfcacheId}-${memory.id}`} memory={memory} />;
}

/** 이미 답한 적이 있으면 그 답으로 칸을 채워요 */
function savedAnswer(memoryId: string, questionId: string): string {
  const d = loadDetails().find((x) => x.memory_id === memoryId && x.question_id === questionId);
  return d?.answer ?? "";
}

function DeepenCards({ memory }: { memory: Memory }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  // 단계마다 물을 질문. "다른 걸 떠올려 볼래요"로 바꿀 수 있어요.
  const [slots, setSlots] = useState(DEFAULT_DETAIL_IDS);
  const [answer, setAnswer] = useState(() => savedAnswer(memory.id, DEFAULT_DETAIL_IDS[0]));
  const [source, setSource] = useState<Source | null>(memory.source);

  const questionId = slots[step];
  const question = getQuestion(questionId)!;
  const isSource = questionId === SOURCE_QUESTION_ID;
  const isLast = step === slots.length - 1;
  const organizeHref = `/organize?id=${memory.id}`;

  function goTo(nextStep: number, nextSlots = slots) {
    setStep(nextStep);
    setAnswer(savedAnswer(memory.id, nextSlots[nextStep]));
  }

  /** "잘 모르겠어요" (답 없이 저장) 또는 "다음" (답 저장) */
  function advance(dontKnow: boolean) {
    const text = answer.trim();
    if (dontKnow) saveDetail(memory.id, questionId, null);
    else if (text) saveDetail(memory.id, questionId, text);
    goTo(Math.min(step + 1, slots.length - 1));
  }

  function pickAlt(altId: string) {
    const next = [...slots];
    next[step] = slots[step] === altId ? DEFAULT_DETAIL_IDS[step] : altId;
    setSlots(next);
    setAnswer(savedAnswer(memory.id, next[step]));
  }

  function finish() {
    if (source) updateMemory(memory.id, { source });
    router.push(organizeHref);
  }

  // 지금 다른 칸에서 이미 묻고 있는 질문은 빼고 보여줘요
  const alts = ALT_DETAIL_IDS.filter((a) => a === slots[step] || !slots.includes(a));

  return (
    <>
      <PageHeader
        title="더 떠올려 보기"
        left={<BackLink href={`/write?edit=${memory.id}&then=deepen`} label="쓴 장면 고치기" />}
        right={
          <Link
            href={organizeHref}
            className="flex h-12 w-16 items-center justify-center text-sm text-ink-sub hover:text-ink"
          >
            그만하기
          </Link>
        }
      />

      <main className="flex flex-1 flex-col px-6 pt-1 pb-6">
        <ProgressBar current={step + 1} total={slots.length} />

        <div className="mt-3">
          <SceneBox text={memory.title ? `${memory.title} — ${memory.body}` : memory.body} />
        </div>

        <section aria-live="polite" className="flex flex-col gap-2 pt-6">
          <Tag>{question.dimension}</Tag>
          <h2 className="mt-1 font-batang text-deepen-question font-bold">{question.text}</h2>
          {question.hint && <p className="text-sm text-ink-sub">{question.hint}</p>}
        </section>

        {isSource ? (
          <div role="radiogroup" aria-label="기억의 출처" className="flex flex-col gap-2 pt-3">
            {SOURCES.map((s) => {
              const on = source === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSource(on ? null : s.id)}
                  className={`h-12 rounded-row px-4 text-left text-ui text-ink ${
                    on
                      ? "border-[1.5px] border-primary bg-sand"
                      : "border border-chip-border bg-card hover:border-primary"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="pt-3">
            <LinedTextarea
              id="detail-answer"
              label="답"
              value={answer}
              onChange={setAnswer}
              maxLength={ANSWER_MAX}
              rows={3}
              placeholder="짧게 적어도 괜찮아요."
            />
          </div>
        )}

        <div className="flex gap-2.5 pt-4">
          {isLast ? (
            <>
              <Link href={organizeHref} className={pairLeftButton}>
                건너뛰기
              </Link>
              <button type="button" onClick={finish} className={pairRightButton}>
                기억 정리하기
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => advance(true)} className={pairLeftButton}>
                잘 모르겠어요
              </button>
              <button type="button" onClick={() => advance(false)} className={pairRightButton}>
                다음
              </button>
            </>
          )}
        </div>

        {!isSource && (
          <div className="flex flex-col gap-2.5 pt-6">
            <span className="text-caption text-ink-sub">다른 걸 떠올려 볼래요</span>
            <div className="flex flex-wrap gap-2">
              {alts.map((altId) => (
                <Chip key={altId} selected={slots[step] === altId} onClick={() => pickAlt(altId)}>
                  {getQuestion(altId)?.dimension}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <p className="mt-auto pt-8 text-center text-caption text-ink-sub">
          떠올리기 힘든 장면이라면, 언제든 쉬어 가도 괜찮아요.
        </p>
      </main>
    </>
  );
}
