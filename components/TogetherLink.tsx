import Link from "next/link";

/** 시작 화면의 "다른 사람들의 첫 기억 먼저 보기" 링크. 누구에게나 보여요 (2026-11-28). */
export default function TogetherLink() {
  return (
    <Link
      href="/together"
      className="flex h-12 items-center justify-center text-ui text-primary underline hover:text-primary-hover"
    >
      다른 사람들의 첫 기억 먼저 보기
    </Link>
  );
}
