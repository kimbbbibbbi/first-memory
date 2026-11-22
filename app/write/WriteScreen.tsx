"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { browser } from "react-dom";
import AgePicker, { type AgeRange } from "@/components/AgePicker";
import { BackLink } from "@/components/BackLink";
import { PhotoButtonComingSoon } from "@/components/ComingSoon";
import LinedTextarea from "@/components/LinedTextarea";
import MissingMemory from "@/components/MissingMemory";
import PageHeader from "@/components/PageHeader";
import Seed from "@/components/Seed";
import { primaryButton, textLink } from "@/components/ui";
import { START_QUESTIONS } from "@/data/questions";
import {
  cluePrompt,
  freePrompt,
  promptOfMemory,
  startPrompt,
  timePrompt,
  topicPrompt,
  type Prompt,
} from "@/lib/prompts";
import { addMemory, getMemory, loadClues, updateMemory } from "@/lib/storage";
import type { Memory } from "@/lib/types";

const BODY_MAX = 500;
const TITLE_MAX = 40;

/**
 * 주소를 읽어서 어떤 질문을 보여줄지 정해요.
 *   /write?q=s-1              출발 질문 (s-2, s-3은 다른 출발 질문)
 *   /write?q=t-home-1         주제 질문
 *   /write?t=b-person-1&clue=… 실마리로 만든 이어가기 질문
 *   /write?t=b-time-1&from=…   시간 질문 (그다음 장면)
 *   /write?free=1             질문 없이 쓰기
 *   /write?edit=…(&then=deepen) 쓴 기억 고치기
 */
function promptFromParams(params: URLSearchParams): Prompt {
  const t = params.get("t");
  const clueId = params.get("clue");
  const from = params.get("from");
  if (t && clueId) {
    const clue = loadClues().find((c) => c.id === clueId);
    const p = clue && cluePrompt(t, clue);
    if (p) return p;
  }
  if (t && from && getMemory(from)) {
    const p = timePrompt(t, from);
    if (p) return p;
  }
  if (params.get("free")) return freePrompt();
  const q = params.get("q");
  return (q && topicPrompt(q)) || startPrompt();
}

export default function WriteScreen() {
  use(browser("기억은 브라우저(localStorage)에 저장돼 있어요."));
  const params = useSearchParams();
  // bfcacheId: 이 화면에 새로 들어올 때마다 바뀌는 값이에요.
  // Next.js는 떠났던 화면을 그대로 남겨 두는데, 기억 쓰기는 들어올 때마다 빈 칸으로 시작해야 해서 key에 넣어요.
  const { bfcacheId } = useRouter();
  const editId = params.get("edit");

  if (editId) {
    const memory = getMemory(editId);
    if (!memory) return <MissingMemory title="기억 고치기" />;
    return (
      <WriteForm
        key={`${bfcacheId}-edit-${editId}`}
        initialPrompt={promptOfMemory(memory)}
        editing={memory}
        thenDeepen={params.get("then") === "deepen"}
      />
    );
  }
  // 주소(?q= 등)가 바뀌면 key도 바뀌어서 입력칸이 새로 시작돼요
  return <WriteForm key={`${bfcacheId}-${params.toString()}`} initialPrompt={promptFromParams(params)} />;
}

function WriteForm({
  initialPrompt,
  editing,
  thenDeepen = false,
}: {
  initialPrompt: Prompt;
  editing?: Memory;
  thenDeepen?: boolean;
}) {
  const router = useRouter();

  const [prompt, setPrompt] = useState(initialPrompt);
  const [startIndex, setStartIndex] = useState(
    Math.max(0, START_QUESTIONS.findIndex((q) => q.id === initialPrompt.question_id)),
  );
  const [age, setAge] = useState<AgeRange | null>(
    editing ? { from: editing.age_from, to: editing.age_to } : null,
  );
  const [title, setTitle] = useState(editing?.title ?? "");
  const [body, setBody] = useState(editing?.body ?? "");
  const [error, setError] = useState("");
  // 한 번 저장한 뒤 뒤로 와서 다시 저장하면, 새로 만들지 않고 고쳐요
  const [savedId, setSavedId] = useState<string | null>(editing?.id ?? null);

  const isFree = prompt.kind === "free";
  const goesToDeepen = !editing || thenDeepen;

  // 무언가 고치면 안내 문구는 지워요
  function edit<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setError("");
    };
  }

  function handleSave() {
    if (!age) return setError("그때 나이를 골라 주세요.");
    if (isFree && !title.trim()) return setError("제목을 적어 주세요.");
    if (!body.trim()) return setError("기억을 한 줄이라도 적어 주세요.");

    const content = {
      title: isFree ? title.trim() : "",
      body: body.trim(),
      age_from: age.from,
      age_to: age.to,
    };

    let id = savedId;
    if (id) {
      // 고치기: 질문은 그대로 두고 내용만 바꿔요
      updateMemory(id, editing ? content : { ...content, ...questionFields(prompt) });
    } else {
      id = addMemory({ ...content, ...questionFields(prompt) }).id;
      setSavedId(id);
    }
    router.push(goesToDeepen ? `/deepen?id=${id}` : "/memories");
  }

  function switchToFree() {
    setPrompt(freePrompt(prompt.parent_id, prompt.from_clue_id));
    setError("");
  }

  function nextStartQuestion() {
    const next = (startIndex + 1) % START_QUESTIONS.length;
    setStartIndex(next);
    setPrompt(startPrompt(next));
  }

  const backHref = editing ? (thenDeepen ? `/deepen?id=${editing.id}` : "/memories") : "/journey";

  return (
    <>
      <PageHeader
        title={editing ? "기억 고치기" : "기억 쓰기"}
        left={<BackLink href={backHref} />}
      />

      <main className="flex flex-1 flex-col gap-3.5 px-6 pt-2">
        <div className="flex items-center gap-2.5">
          <Seed size={40} />
          <span className="text-caption text-ink-sub">{prompt.label}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-batang text-question font-bold">{prompt.text}</h2>
          {prompt.hint && <p className="text-ui text-ink-sub">{prompt.hint}</p>}
          {prompt.kind === "start" && !editing && (
            <button
              type="button"
              onClick={nextStartQuestion}
              className="flex h-11 items-center self-start text-sm text-primary underline hover:text-primary-hover"
            >
              잘 떠오르지 않으면, 다른 질문으로 시작할래요
            </button>
          )}
        </div>

        {isFree && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="memory-title" className="text-caption text-ink-sub">
              제목
            </label>
            <input
              id="memory-title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => edit(setTitle)(e.target.value)}
              placeholder="예: 초록 대문 집"
              className="h-12 rounded-row border border-chip-border bg-card px-4 font-batang text-input text-ink outline-none placeholder:text-ink-sub focus-visible:border-primary"
            />
          </div>
        )}

        <AgePicker value={age} onChange={edit(setAge)} />

        <LinedTextarea
          id="memory-body"
          label="기억 내용"
          value={body}
          onChange={edit(setBody)}
          maxLength={BODY_MAX}
          placeholder="그때 보이던 것, 들리던 소리, 함께 있던 사람을 떠올려 보세요."
        />

        <PhotoButtonComingSoon />

        {error && (
          <p role="alert" className="rounded-row bg-sand px-4 py-3 text-ui text-sand-ink">
            {error}
          </p>
        )}

        <div className="mt-auto flex flex-col pt-4 pb-4">
          <button type="button" onClick={handleSave} className={primaryButton}>
            {goesToDeepen ? "저장하고 더 떠올려 보기" : "저장"}
          </button>
          {!isFree && !editing && (
            <button type="button" onClick={switchToFree} className={textLink}>
              질문 없이 자유롭게 쓰기
            </button>
          )}
        </div>
      </main>
    </>
  );
}

/** 질문 관련 칸 (질문 문장은 그때 보인 그대로 남겨요) */
function questionFields(p: Prompt) {
  return {
    question_id: p.question_id,
    question_text: p.kind === "free" ? null : p.text,
    parent_id: p.parent_id,
    from_clue_id: p.from_clue_id,
  };
}
