"use client";

/**
 * 별명으로 공유하기 스위치 (기본 꺼짐)
 * 켜면 아래에 "본문만 별명과 함께 보여요…" 확인 안내가 나와요.
 * 실제 공유는 "저장" 버튼을 눌러야 일어나요.
 */
export default function ShareSwitch({
  on,
  onChange,
  hidden = false,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  /** 신고가 쌓여 숨겨진 기억인지 */
  hidden?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-card bg-card px-4 py-3.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-ui">별명으로 공유하기</span>
          <span className="text-caption text-ink-sub">
            {on ? "저장하면 함께 보기에 별명과 함께 올라가요" : "꺼져 있으면 나만 볼 수 있어요"}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="별명으로 공유하기"
          onClick={() => onChange(!on)}
          className={`relative h-8 w-13 shrink-0 rounded-full transition-colors ${
            on ? "bg-primary" : "bg-off"
          }`}
        >
          <span
            className={`absolute top-0.75 size-6.5 rounded-full bg-card transition-[left] ${
              on ? "left-5.75" : "left-0.75"
            }`}
          />
        </button>
      </div>
      {on && (
        <p role="note" className="rounded-input bg-sand px-3.5 py-2.5 text-caption leading-normal text-sand-ink">
          본문만 별명과 함께 보여요. 실명, 연락처, 학교 이름이 들어 있지 않은지 확인해 주세요.
        </p>
      )}
      {hidden && (
        <p role="note" className="rounded-input bg-sand px-3.5 py-2.5 text-caption leading-normal text-sand-ink">
          신고가 쌓여서 이 기억은 함께 보기에서 숨겨졌어요. 운영자가 확인할 때까지 다른 사람에게 보이지 않아요.
        </p>
      )}
    </div>
  );
}
