import Link from "next/link";
import type { BranchOption } from "@/lib/prompts";
import Tag from "./Tag";

/** 이어가기 질문 카드. 카드 전체가 링크예요. */
export default function BranchCard({ option }: { option: BranchOption }) {
  return (
    <Link
      href={option.href}
      className="flex flex-col gap-2 rounded-card bg-card p-4 text-ink outline-primary hover:ring-1 hover:ring-primary"
    >
      <Tag tone={option.tone}>{option.tag}</Tag>
      <span className="font-batang text-card-question-sm font-bold">{option.text}</span>
      <span className="self-end text-sm text-primary">이 질문으로 쓰기</span>
    </Link>
  );
}
