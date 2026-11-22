"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

/** 비밀번호 칸 + 보기 버튼 (누르면 적은 비밀번호가 글자로 보여요) */
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password" | "current-password";
}) {
  const [shown, setShown] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption text-ink-sub">
        {label}
      </label>
      <div className="flex h-12 items-center rounded-row border border-chip-border bg-card focus-within:border-primary">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          className="h-full min-w-0 flex-1 rounded-row bg-transparent pl-4 text-input text-ink outline-none"
          required
        />
        <button
          type="button"
          onClick={() => setShown(!shown)}
          aria-pressed={shown}
          aria-controls={id}
          aria-label={shown ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="flex size-11 shrink-0 items-center justify-center rounded-row text-ink-sub hover:text-ink"
        >
          {shown ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
    </div>
  );
}
