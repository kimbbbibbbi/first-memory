"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "@/lib/account";
import { ChevronRightIcon } from "./icons";

/**
 * 화면 맨 위 한 줄: 왼쪽 "첫 기억", 오른쪽 로그인 칸
 * - 로그인했으면: 별명 첫 글자 동그라미 + 별명 + › (누르면 마이페이지)
 * - 로그인하지 않았으면: 로그인 · 가입하기
 * 시작 화면과 탭 화면(질문·내 기억·함께 보기)에만 둬요. 이메일은 보여 주지 않아요.
 */
export default function AccountBar() {
  const account = useAccount();
  const pathname = usePathname();
  const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";

  return (
    <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-5">
      <Link href="/" className="font-batang text-lg font-bold tracking-[0.1em] text-primary">
        첫 기억
      </Link>

      {account.status === "checking" && <span aria-hidden="true" className="h-11 w-24" />}

      {account.status === "guest" && (
        <div className="flex items-center text-sm">
          <Link href={`/login${next}`} className="flex h-11 items-center px-2 text-primary hover:text-primary-hover">
            로그인
          </Link>
          <span aria-hidden="true" className="text-ink-sub">
            ·
          </span>
          <Link href={`/signup${next}`} className="flex h-11 items-center px-2 text-primary hover:text-primary-hover">
            가입하기
          </Link>
        </div>
      )}

      {account.status === "member" && (
        <Link
          href="/mypage"
          aria-label={`마이페이지 (${account.nickname})`}
          className="flex h-11 min-w-0 items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-sand"
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mist text-sm text-mist-ink"
          >
            {account.nickname.slice(0, 1)}
          </span>
          <span className="max-w-36 truncate text-ui text-ink">{account.nickname}</span>
          <ChevronRightIcon size={16} />
        </Link>
      )}
    </div>
  );
}
