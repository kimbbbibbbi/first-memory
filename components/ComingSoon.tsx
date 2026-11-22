// 1단계에서는 아직 동작하지 않는 기능을 시안 자리에 보여주는 부품이에요.
// 누를 수 없고, "곧 열려요" 안내를 달아요. (CLAUDE.md "정해진 사항")

import { PhotoIcon } from "./icons";

/** 별명으로 공유하기 스위치 (꺼진 채로 고정) */
export function ShareSwitchComingSoon() {
  return (
    <div className="flex items-center gap-3 rounded-card bg-card px-4 py-3.5">
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-ui">
          별명으로 공유하기
        </span>
        <span id="share-desc" className="text-caption text-ink-sub">
          곧 열려요. 지금은 나만 볼 수 있어요.
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked="false"
        aria-label="별명으로 공유하기 (곧 열려요)"
        aria-describedby="share-desc"
        disabled
        className="relative h-8 w-13 shrink-0 cursor-not-allowed rounded-full bg-off"
      >
        <span className="absolute top-0.75 left-0.75 size-6.5 rounded-full bg-card" />
      </button>
    </div>
  );
}

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
