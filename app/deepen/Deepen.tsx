"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BackLink } from "@/components/BackLink";
import Chip from "@/components/Chip";
import DataGate from "@/components/DataGate";
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
import { SaveError, saveDetail, updateMemory } from "@/lib/storage";
import type { Memory, MemoryDetail } from "@/lib/types";

const ANSWER_MAX = 200;

export default function Deepen() {
  const id = useSearchParams().get("id");
  const { bfcacheId } = useRouter();

  return (
    <DataGate>
      {({ memories, details }) => {
        const memory = memories.find((m) => m.id === id);
        if (!memory) return <MissingMemory title="더 떠올려 보기" />;
        return (
          <DeepenCards
            key={`${bfcacheId}-${memory.id}`}
            memory={memory}
            details={details.filter((d) => d.memory_id === memory.id)}
          />
        );
      }}
    </DataGate>
  );
}

function DeepenCards({ memory, details }: { memory: Memory; details: MemoryDetail[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  // 단계마다 물을 질문. "다른 걸 떠올려 볼래요"로 바꿀 수 있어요.
  const [slots, setSlots] = useState(DEFAULT_DETAIL_IDS);
  const [answer, setAnswer] = useState(() => savedAnswer(DEFAULT_DETAIL_IDS[0]));
  const [source, setSource] = useState<Source | null>(memory.source);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const questionId = slots[step];
  const question = getQuestion(questionId)!;
  const isSource = questionId === SOURCE_QUESTION_ID;
  const isLast = step === slots.length - 1;
  const organizeHref = `/organize?id=${memory.id}`;

  /** 이미 답한 적이 있으면 그 답으로 칸을 채워요 */
  function savedAnswer(qid: string): string {
    return details.find((d) => d.question_id === qid)?.answer ?? "";
  }

  /** 저장하는 동안 버튼을 잠그고, 실패하면 안내를 보여줘요 */
  async function saving(work: () => Promise<void>): Promise<boolean> {
    setBusy(true);
    setError("");
    try {
      await work();
      return true;
    } catch (e) {
      setError(e instanceof SaveError ? e.message : "저장하지 못했어요. 다시 해 주세요.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  /** "잘 모르겠어요" (답 없이 저장) 또는 "다음" (답 저장) */
  async function advance(dontKnow: boolean) {
    const text = answer.trim();
    const ok = await saving(async () => {
      if (dontKnow) await saveDetail(memory.id, questionId, null);
      else if (text) await saveDetail(memory.id, questionId, text);
    });
    if (!ok) return;
    const nextStep = Math.min(step + 1, slots.length - 1);
    setStep(nextStep);
    setAnswer(savedAnswer(slots[nextStep]));
  }

  function pickAlt(altId: string) {
    const next = [...slots];
    next[step] = slots[step] === altId ? DEFAULT_DETAIL_IDS[step] : altId;
    setSlots(next);
    setAnswer(savedAnswer(next[step]));
  }

  async function finish() {
    const ok = await saving(async () => {
      if (source && source !== memory.source) await updateMemory(memory.id, { source });
    });
    if (ok) router.push(organizeHref);
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

        {error && (
          <p role="alert" className="mt-3 rounded-row bg-sand px-4 py-3 text-ui text-sand-ink">
            {error}
          </p>
        )}

        <div className="flex gap-2.5 pt-4">
          {isLast ? (
            <>
              <Link href={organizeHref} className={pairLeftButton}>
                건너뛰기
              </Link>
              <button type="button" onClick={finish} disabled={busy} className={pairRightButton}>
                기억 정리하기
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => advance(true)}
                disabled={busy}
                className={pairLeftButton}
              >
                잘 모르겠어요
              </button>
              <button
                type="button"
                onClick={() => advance(false)}
                disabled={busy}
                className={pairRightButton}
              >
                {busy ? "저장 중…" : "다음"}
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
