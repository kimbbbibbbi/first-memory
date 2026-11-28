import Link from "next/link";
import { outlineButton } from "./ui";

/** 시작 화면의 "다른 사람들의 첫 기억 먼저 보기" 링크. 누구에게나 보여요.
 *  잘 안 보인다는 피드백으로 글자 링크 대신 테두리 버튼 (2026-11-28). */
export default function TogetherLink() {
  return (
    <Link
      href="/together"
      className={outlineButton}
    >
      다른 사람들의 첫 기억 먼저 보기
    </Link>
  );
}
