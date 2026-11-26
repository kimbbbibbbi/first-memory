"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Chip from "@/components/Chip";
import DataGate from "@/components/DataGate";
import MemoryCard from "@/components/MemoryCard";
import Seed from "@/components/Seed";
import { PlusIcon } from "@/components/icons";
import { textLink } from "@/components/ui";
import { memoryOrigin } from "@/lib/prompts";
import { deleteMemory, sortByAge } from "@/lib/storage";
import type { Clue, Memory } from "@/lib/types";

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "private", label: "나만 보기" },
  { id: "shared", label: "공유 중" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

export default function Timeline() {
  return (
    <DataGate>
      {({ memories, clues }) => <TimelineView stored={memories} clues={clues} />}
    </DataGate>
  );
}

function TimelineView({ stored, clues }: { stored: Memory[]; clues: Clue[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const memories = useMemo(() => sortByAge(stored), [stored]);
  const shown = filter === "all" ? memories : memories.filter((m) => m.visibility === filter);

  if (memories.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-7 pb-28 text-center">
        <Seed size={72} />
        <p className="font-batang text-card-question font-bold">아직 쓴 기억이 없어요</p>
        <p className="text-ui text-ink-sub">가장 첫 기억부터 천천히 떠올려 볼까요?</p>
        <Link href="/write?q=s-1" className={textLink}>
          첫 기억 쓰러 가기
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col pb-44">
      <div role="group" aria-label="보기 필터" className="flex gap-2 px-5 pt-1">
        {FILTERS.map((f) => (
          <Chip key={f.id} selected={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="px-7 pt-16 text-center text-ui text-ink-sub">
          {filter === "shared"
            ? "아직 공유한 기억이 없어요. 기억 정리에서 공유를 켤 수 있어요."
            : "나만 보는 기억이 없어요."}
        </p>
      ) : (
        <div className="relative pt-5 pr-5 pl-11">
          {/* 타임라인 세로선 */}
          <div aria-hidden="true" className="absolute top-7 bottom-0 left-6.75 w-0.5 bg-line" />
          <p className="sr-only">어린 나이부터 차례로 보여줘요.</p>
          <ol className="flex flex-col gap-5">
            {shown.map((m) => (
              <MemoryCard
                key={m.id}
                memory={m}
                origin={memoryOrigin(m, stored, clues)}
                onDelete={deleteMemory}
              />
            ))}
          </ol>
        </div>
      )}

      {/* 새 기억 쓰기 버튼 (오른쪽 20, 아래 92) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-23 mx-auto flex max-w-app justify-end px-5">
        <Link
          href="/write?free=1"
          aria-label="새 기억 쓰기"
          className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-primary text-card shadow-md hover:bg-primary-hover"
        >
          <PlusIcon strokeWidth={2.4} />
        </Link>
      </div>
    </main>
  );
}
