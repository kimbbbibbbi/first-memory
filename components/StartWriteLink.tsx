"use client";

import Link from "next/link";
import { useAccount } from "@/lib/account";
import { primaryButton } from "./ui";

/**
 * 시작 화면의 "첫 기억 쓰러 가기" (2026-11-28)
 * 로그인했으면 바로 기억 쓰기로, 로그인하지 않았으면 질문 탭으로 가요.
 * (갑자기 로그인 화면이 뜨면 헷갈린다는 피드백. 질문 탭 맨 위에 로그인 안내가 있어요.)
 */
export default function StartWriteLink() {
  const account = useAccount();
  const href = account.status === "member" ? "/write?q=s-1" : "/journey";
  return (
    <Link href={href} className={primaryButton}>
      첫 기억 쓰러 가기
    </Link>
  );
}
