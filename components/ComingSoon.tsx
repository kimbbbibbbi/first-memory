// 아직 동작하지 않는 기능을 시안 자리에 보여주는 부품이에요.
// 누를 수 없고, "곧 열려요" 안내를 달아요. (CLAUDE.md "정해진 사항")

import { PhotoIcon } from "./icons";

/** 그때의 사진 추가 버튼 (누를 수 없음) */
export function PhotoButtonComingSoon() {
  return (
    <button
      type="button"
      disabled
      aria-label="그때의 사진 추가 (곧 열려요)"
      className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-row border-[1.5px] border-dashed border-sand-dashed text-ui text-sand-ink"
    >
      <PhotoIcon size={20} />
      <span>그때의 사진 추가 · 곧 열려요</span>
    </button>
  );
}
