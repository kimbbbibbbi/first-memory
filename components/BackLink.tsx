import Link from "next/link";
import { BackIcon, CloseIcon } from "./icons";

const iconLink =
  "flex size-12 items-center justify-center rounded-full text-ink hover:bg-sand";

/** 헤더 왼쪽 뒤로가기 (48 x 48) */
export function BackLink({ href, label = "뒤로" }: { href: string; label?: string }) {
  return (
    <Link href={href} aria-label={label} className={iconLink}>
      <BackIcon />
    </Link>
  );
}

/** 헤더 오른쪽 닫기 (X) */
export function CloseLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} aria-label={label} className={iconLink}>
      <CloseIcon size={22} />
    </Link>
  );
}
