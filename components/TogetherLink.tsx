"use client";

import Link from "next/link";
import { useAccount } from "@/lib/account";

/** 시작 화면의 "다른 사람들의 첫 기억 먼저 보기" 링크. 로그인했을 때만 보여요 (2026-11-27). */
export default function TogetherLink() {
  const account = useAccount();
  if (account.status !== "member") return null;
  return (
    <Link
      href="/together"
      className="flex h-12 items-center justify-center text-ui text-primary underline hover:text-primary-hover"
    >
      다른 사람들의 첫 기억 먼저 보기
    </Link>
  );
}
