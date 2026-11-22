"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { browser } from "react-dom";
import { BackLink } from "@/components/BackLink";
import Chip from "@/components/Chip";
import { ShareSwitchComingSoon } from "@/components/ComingSoon";
import MissingMemory from "@/components/MissingMemory";
import PageHeader from "@/components/PageHeader";
import { CloseIcon, PlusIcon } from "@/components/icons";
import { primaryButton, textLink } from "@/components/ui";
import {
  CLUE_TYPES,
  clueTypeLabel,
  getQuestion,
  sourceLabel,
  type ClueType,
} from "@/data/questions";
import { formatAgeRange } from "@/lib/ages";
import { memoryOrigin } from "@/lib/prompts";
import { MAX_CLUES, loadClues, replaceClues, type ClueDraft } from "@/lib/storage";
import type { Memory, MemoryDetail } from "@/lib/types";
import { useClues, useDetails, useMemories } from "@/lib/useStored";

const CLUE_MAX_LENGTH = 20;

export default function Organize() {
  use(browser("기억은 브라우저(localStorage)에 저장돼 있어요."));
  const id = useSearchParams().get("id");
  const { bfcacheId } = useRouter();
  const memory = useMemories().find((m) => m.id === id);

  if (!memory) return <MissingMemory title="기억 정리" />;
  return <OrganizeForm key={`${bfcacheId}-${memory.id}`} memory={memory} />;
}

function OrganizeForm({ memory }: { memory: Memory }) {
  const router = useRouter();
  const memories = useMemories();
  const clues = useClues();
  const details = useDetails().filter((d) => d.memory_id === memory.id);

  // 이미 남긴 실마리가 있으면 그대로 불러와요
  const [drafts, setDrafts] = useState<ClueDraft[]>(() =>
    loadClues()
      .filter((c) => c.memory_id === memory.id)
      .map(({ id, type, text }) => ({ id, type, text })),
  );
  const [text, setText] = useState("");
  const [type, setType] = useState<ClueType>("person");

  const full = drafts.length >= MAX_CLUES;
  const has = (t: string) => drafts.some((d) => d.text === t);

  function addClue(clueText: string, clueType: ClueType) {
    const t = clueText.trim().slice(0, CLUE_MAX_LENGTH);
    if (!t || full || has(t)) return;
    setDrafts([...drafts, { text: t, type: clueType }]);
  }

  function removeClue(index: number) {
    setDrafts(drafts.filter((_, i) => i !== index));
  }

  // 구체화 답에서 실마리 후보 만들기 (예: "누가 함께 있었나요?" → "할머니 · 사람")
  const candidates = details
    .map((d) => {
      const suggests = getQuestion(d.question_id)?.suggests;
      const answer = d.answer?.trim().slice(0, CLUE_MAX_LENGTH);
      return suggests && answer ? { text: answer, type: suggests } : null;
    })
    .filter((c): c is { text: string; type: ClueType } => c !== null && !has(c.text));

  function save(next: string) {
    replaceClues(memory.id, drafts);
    router.push(next);
  }

  return (
    <>
      <PageHeader title="기억 정리" left={<BackLink href={`/deepen?id=${memory.id}`} />} />

      <main className="flex flex-1 flex-col gap-4 px-5 pt-1">
        <SummaryCard memory={memory} details={details} origin={memoryOrigin(memory, memories, clues)} />

        <section aria-labelledby="clue-title" className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <h2 id="clue-title" className="font-batang text-card-question-sm font-bold">
              실마리 고르기
            </h2>
            <span className="text-caption text-ink-sub" aria-live="polite">
              {drafts.length} / {MAX_CLUES}
            </span>
          </div>
          <p className="text-caption text-ink-sub">
            다음 기억으로 이어질 말을 남겨 두세요. 사람, 장소, 물건처럼 짧게요.
          </p>

          {drafts.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {drafts.map((d, i) => (
                <li
                  key={`${d.text}-${i}`}
                  className="flex h-11 items-center gap-1.5 rounded-full bg-primary pl-3.5 text-sm text-card"
                >
                  <span>{d.text}</span>
                  <span className="text-tag text-mist">{clueTypeLabel(d.type)}</span>
                  <button
                    type="button"
                    onClick={() => removeClue(i)}
                    aria-label={`${d.text} 실마리 지우기`}
                    className="flex size-11 items-center justify-center rounded-full hover:bg-primary-hover"
                  >
                    <CloseIcon size={14} strokeWidth={2.4} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {candidates.length > 0 && !full && (
            <div className="flex flex-col gap-2">
              <span className="text-caption text-ink-sub">답에서 찾은 실마리 (누르면 추가돼요)</span>
              <div className="flex flex-wrap gap-2">
                {candidates.map((c) => (
                  <button
                    key={`${c.type}-${c.text}`}
                    type="button"
                    onClick={() => addClue(c.text, c.type)}
                    aria-label={`${c.text} (${clueTypeLabel(c.type)}) 실마리로 추가`}
                    className="flex h-11 items-center gap-1.5 rounded-full border border-chip-border bg-card px-3.5 text-sm text-ink hover:border-primary"
                  >
                    <PlusIcon size={14} />
                    <span>{c.text}</span>
                    <span className="text-tag text-ink-sub">{clueTypeLabel(c.type)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {full ? (
            <p className="text-caption text-ink-sub">실마리는 5개까지 남길 수 있어요.</p>
          ) : (
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addClue(text, type);
                setText("");
              }}
            >
              <div className="flex gap-2">
                <label htmlFor="clue-input" className="sr-only">
                  실마리 직접 적기
                </label>
                <input
                  id="clue-input"
                  value={text}
                  maxLength={CLUE_MAX_LENGTH}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="예: 초록 대문, 노란 장판"
                  className="h-11 min-w-0 flex-1 rounded-input border border-chip-border bg-card px-3.5 text-ui text-ink outline-none placeholder:text-ink-sub focus-visible:border-primary"
                />
                <button
                  type="submit"
                  className="h-11 w-16 rounded-input bg-sand text-ui text-sand-ink hover:bg-segment-bg"
                >
                  추가
                </button>
              </div>
              <div role="group" aria-label="실마리 종류" className="flex gap-1.5">
                {CLUE_TYPES.map((t) => (
                  <Chip
                    key={t.id}
                    variant="soft"
                    selected={type === t.id}
                    onClick={() => setType(t.id)}
                    className="flex-1 px-0 text-caption"
                  >
                    {t.label}
                  </Chip>
                ))}
              </div>
            </form>
          )}
        </section>

        <ShareSwitchComingSoon />

        <div className="mt-auto flex flex-col pt-4 pb-4">
          <button type="button" onClick={() => save(`/branch?id=${memory.id}`)} className={primaryButton}>
            저장하고 이어서 떠올리기
          </button>
          <button type="button" onClick={() => save("/memories")} className={textLink}>
            저장하고 오늘은 여기까지
          </button>
        </div>
      </main>
    </>
  );
}

/** 기억 요약 카드: 나이·어디서 온 기억, 본문, 구체화 답 목록 */
function SummaryCard({
  memory,
  details,
  origin,
}: {
  memory: Memory;
  details: MemoryDetail[];
  origin: string;
}) {
  const source = sourceLabel(memory.source);
  const rows = details.map((d) => ({
    key: d.id,
    label: getQuestion(d.question_id)?.dimension ?? "",
    value: d.answer ?? "잘 모르겠어요",
  }));
  if (source) rows.push({ key: "source", label: "출처", value: source });

  return (
    <article className="flex flex-col gap-2.5 rounded-card bg-card p-4">
      <span className="text-caption text-ink-sub">
        {formatAgeRange(memory.age_from, memory.age_to)} · {origin}
      </span>
      {memory.title && <h2 className="font-batang text-memory font-bold">{memory.title}</h2>}
      <p className="font-batang text-memory whitespace-pre-line">{memory.body}</p>
      {rows.length > 0 && (
        <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-2 gap-y-1.5 border-t border-line pt-2.5">
          {rows.map((r) => (
            <div key={r.key} className="contents">
              <dt className="text-caption text-ink-sub">{r.label}</dt>
              <dd className="font-batang text-scene">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}
