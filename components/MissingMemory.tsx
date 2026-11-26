import Link from "next/link";
import { BackLink } from "./BackLink";
import PageHeader from "./PageHeader";
import Seed from "./Seed";
import { textLink } from "./ui";

/** 주소에 있는 기억을 찾지 못했을 때 */
export default function MissingMemory({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} left={<BackLink href="/memories" />} />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-7 text-center">
        <Seed size={48} />
        <p className="text-ui text-ink-sub">이 기억을 찾을 수 없어요. 이미 지웠을 수도 있어요.</p>
        <Link href="/memories" className={textLink}>
          내 기억으로 돌아가기
        </Link>
      </main>
    </>
  );
}
