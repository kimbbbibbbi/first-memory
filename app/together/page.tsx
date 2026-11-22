import type { Metadata } from "next";
import Link from "next/link";
import BottomTabs from "@/components/BottomTabs";
import PageHeader from "@/components/PageHeader";
import Seed from "@/components/Seed";

export const metadata: Metadata = { title: "함께 보기" };

// 함께 보기 (3단계에서 공유 피드로 바뀌어요). 지금은 "곧 열려요" 안내만 보여줘요.
export default function TogetherPage() {
  return (
    <>
      <PageHeader title="함께 보는 기억" />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-7 pb-28 text-center">
        <Seed size={56} />
        <h2 className="mt-2 font-batang text-card-question font-bold">곧 열려요</h2>
        <p className="text-ui leading-relaxed text-ink-sub">
          다른 사람들이 별명으로 나눈 첫 기억을
          <br />
          여기에서 함께 볼 수 있게 될 거예요.
        </p>
        <Link
          href="/journey"
          className="mt-4 flex h-12 items-center px-4 text-ui text-primary underline hover:text-primary-hover"
        >
          먼저 내 기억을 써 볼까요?
        </Link>
      </main>
      <BottomTabs />
    </>
  );
}
