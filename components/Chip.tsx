"use client";

/**
 * 고를 수 있는 칩 (나이, 필터, 다른 질문, 실마리 종류 등)
 * 시안 높이는 36이지만, 손가락으로 누르기 쉽게 터치 영역은 44로 맞춰요.
 */
export default function Chip({
  selected,
  onClick,
  children,
  variant = "primary",
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** primary: 고르면 초록 배경 / soft: 고르면 연초록 배경 + 초록 테두리 (실마리 종류) */
  variant?: "primary" | "soft";
  className?: string;
}) {
  const on =
    variant === "primary"
      ? "border-primary bg-primary text-card"
      : "border-primary bg-mist text-mist-ink";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`h-11 rounded-full border px-3.5 text-sm ${
        selected ? on : "border-chip-border bg-card text-ink hover:border-primary"
      } ${className}`}
    >
      {children}
    </button>
  );
}
