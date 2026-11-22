"use client";

/** 줄 노트 입력창 (17px 글자, 32px 줄 간격, 오른쪽 아래 글자 수) */
export default function LinedTextarea({
  id,
  label,
  value,
  onChange,
  maxLength,
  rows = 6,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="lined-paper w-full resize-none border-0 px-1 py-1.5 font-batang text-input text-ink outline-none placeholder:text-ink-sub focus-visible:ring-2 focus-visible:ring-primary/40"
      />
      <div className="text-right text-caption text-ink-sub" aria-live="polite">
        {value.length} / {maxLength}
      </div>
    </div>
  );
}
