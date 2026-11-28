import Link from "next/link";
import AccountBar from "@/components/AccountBar";
import BottomTabs from "@/components/BottomTabs";
import Seed from "@/components/Seed";
import TogetherLink from "@/components/TogetherLink";
import { primaryButton } from "@/components/ui";

// 시작 화면 (시안 Main.dc.html). 맨 위 한 줄에서 로그인했는지 보여주고,
// 아래에는 하단 탭(질문·내 기억·함께 보기)을 둬요 (2026-11-26 결정).
export default function Home() {
  return (
    <>
      <AccountBar />
      <main className="flex flex-1 flex-col items-center px-7 pt-14 pb-24">
        <div className="flex flex-col items-center">
          <Seed size={140} />
          <h1 className="mt-7 mb-3 text-center font-batang text-hero font-bold">
            당신이 기억하는
            <br />
            가장 첫 장면은
            <br />
            무엇인가요?
          </h1>
          <p className="text-center text-base leading-relaxed text-ink-sub">
            어렴풋해도 괜찮아요.
            <br />한 장면이면 충분해요.
          </p>
        </div>

        <div className="mt-auto flex w-full flex-col items-center gap-2 pt-10">
          <Link href="/write?q=s-1" className={primaryButton}>
            첫 기억 쓰러 가기
          </Link>
          <TogetherLink />
          <Link
            href="/privacy"
            className="flex h-11 items-center px-2 text-caption text-ink-sub underline hover:text-ink"
          >
            개인정보 처리방침
          </Link>
        </div>
      </main>
      <BottomTabs />
    </>
  );
}
