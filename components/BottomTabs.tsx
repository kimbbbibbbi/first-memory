"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, ListIcon, PencilIcon } from "./icons";

const TABS = [
  { href: "/journey", label: "질문", Icon: PencilIcon },
  { href: "/memories", label: "내 기억", Icon: ListIcon },
  { href: "/together", label: "함께 보기", Icon: GridIcon },
];

/** 하단 탭 3개 (높이 72) */
export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-10 mx-auto flex h-18 max-w-app border-t border-line bg-paper"
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-tab ${
              active ? "font-bold text-primary" : "text-ink-sub hover:text-ink"
            }`}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
