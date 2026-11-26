"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BackLink, CloseLink } from "@/components/BackLink";
import BranchCard from "@/components/BranchCard";
import DataGate from "@/components/DataGate";
import MissingMemory from "@/components/MissingMemory";
import PageHeader from "@/components/PageHeader";
import Seed from "@/components/Seed";
import { outlineButton, textLink } from "@/components/ui";
import { branchOptionsForClue, branchOptionsForMemory, type BranchOption } from "@/lib/prompts";
import type { Clue, Memory } from "@/lib/types";

export default function Branch() {
  const params = useSearchParams();
  return (
    <DataGate>
      {({ memories, clues }) => (
        <BranchChoice params={params} memories={memories} clues={clues} />
      )}
    </DataGate>
  );
}

function BranchChoice({
  params,
  memories,
  clues,
}: {
  params: URLSearchParams;
  memories: Memory[];
  clues: Clue[];
}) {
  const clueId = params.get("clue");
  if (clueId) {
    const clue = clues.find((c) => c.id === clueId);
    if (!clue) return <MissingMemory title="이어서 떠올리기" />;
    return (
      <BranchView
        fromJourney
        heading={`'${clue.text}'에서 이어 가 볼까요?`}
        sub="실마리로 만든 질문 중 하나를 골라 보세요."
        options={branchOptionsForClue(clue)}
      />
    );
  }

  const memory = memories.find((m) => m.id === params.get("id"));
  if (!memory) return <MissingMemory title="이어서 떠올리기" />;
  return (
    <BranchView
      heading="기억 하나가 남았어요"
      sub="남긴 실마리에서 다음 기억으로 이어 가 볼까요?"
      options={branchOptionsForMemory(memory, clues, memories)}
    />
  );
}

function BranchView({
  heading,
  sub,
  options,
  fromJourney = false,
}: {
  heading: string;
  sub: string;
  options: BranchOption[];
  fromJourney?: boolean;
}) {
  return (
    <>
      <PageHeader
        title="이어서 떠올리기"
        left={fromJourney ? <BackLink href="/journey" /> : undefined}
        right={
          fromJourney ? undefined : <CloseLink href="/memories" label="오늘은 여기까지" />
        }
      />

      <main className="flex flex-1 flex-col px-5 pt-1">
        <div className="flex flex-col items-center gap-1.5 px-1 text-center">
          <Seed size={88} />
          <h2 className="mt-1 font-batang text-notice font-bold">{heading}</h2>
          <p className="text-sm text-ink-sub">{sub}</p>
        </div>

        <div className="flex flex-col gap-3 pt-5">
          {options.map((o) => (
            <BranchCard key={o.href} option={o} />
          ))}
        </div>

        <div className="mt-auto flex flex-col pt-6 pb-4">
          <Link href="/journey" className={outlineButton}>
            주제 질문에서 고르기
          </Link>
          <Link href="/memories" className={textLink}>
            오늘은 여기까지
          </Link>
        </div>
      </main>
    </>
  );
}
