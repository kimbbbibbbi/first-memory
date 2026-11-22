/** 진행 막대: 높이 4, 칸 사이 6, 지나온 칸 primary / 남은 칸 line */
export default function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label="더 떠올려 보기 진행"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-xs ${i < current ? "bg-primary" : "bg-line"}`}
          />
        ))}
      </div>
      <span className="text-caption text-ink-sub">
        질문 {current} / {total}
      </span>
    </div>
  );
}
