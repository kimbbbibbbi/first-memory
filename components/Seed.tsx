// 캐릭터: 싹이 난 작은 씨앗 (DESIGN.md 6장)
// 크기: 시작 화면 112, 질문 카드 56, 기억 쓰기 48

export default function Seed({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
      <path d="M40 18 C40 8 30 5 23 9 C25 17 33 20 40 18Z" className="fill-seed-leaf" />
      <path d="M40 18 C40 8 50 5 57 9 C55 17 47 20 40 18Z" className="fill-seed-leaf-dark" />
      <path
        d="M40 18 L40 28"
        className="stroke-seed-leaf-dark"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="40" cy="52" rx="22" ry="25" className="fill-seed-body" />
      <circle cx="32" cy="50" r="2.6" className="fill-ink" />
      <circle cx="48" cy="50" r="2.6" className="fill-ink" />
      <path
        d="M35 58 Q40 63 45 58"
        className="stroke-ink"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
