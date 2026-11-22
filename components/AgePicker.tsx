"use client";

import { useState } from "react";
import { AGE_PRESETS, MAX_AGE, MIN_AGE, findPreset } from "@/lib/ages";
import Chip from "./Chip";

export interface AgeRange {
  from: number;
  to: number;
}

const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

/** 그때 나이: 시기 칩 + "숫자로 고르기" */
export default function AgePicker({
  value,
  onChange,
}: {
  value: AgeRange | null;
  onChange: (value: AgeRange) => void;
}) {
  // 처음 값이 시기 칩과 맞지 않으면 "숫자로 고르기"로 열어 둬요
  const [custom, setCustom] = useState(
    value !== null && !findPreset(value.from, value.to),
  );
  // 숫자로 고를 때: 기본은 나이 하나, "범위로 고르기"를 누르면 끝 나이 칸이 생겨요
  const [range, setRange] = useState(value !== null && value.from !== value.to);
  const selectedPreset = !custom && value ? findPreset(value.from, value.to) : undefined;

  function chooseCustom() {
    setCustom(true);
    if (!value) onChange({ from: 4, to: 4 });
    else if (!range && value.from !== value.to) onChange({ from: value.from, to: value.from });
  }

  function toggleRange() {
    if (!value) return;
    // 범위를 끄면 나이 하나로 돌아가요 (끝 나이 = 시작 나이)
    if (range) onChange({ from: value.from, to: value.from });
    setRange(!range);
  }

  const selectClass =
    "h-11 rounded-row border border-chip-border bg-card px-3 text-ui text-ink";
  const smallLink =
    "flex h-11 items-center px-1 text-sm text-primary underline hover:text-primary-hover";

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-caption text-ink-sub">그때 나이</legend>
      <div className="flex flex-wrap gap-2">
        {AGE_PRESETS.map((p) => (
          <Chip
            key={p.id}
            selected={selectedPreset?.id === p.id}
            onClick={() => {
              setCustom(false);
              onChange({ from: p.from, to: p.to });
            }}
          >
            {p.label}
          </Chip>
        ))}
        <Chip selected={custom} onClick={chooseCustom}>
          숫자로 고르기
        </Chip>
      </div>

      {custom && value && (
        <div className="flex flex-wrap items-center gap-2 text-ui">
          <label className="sr-only" htmlFor="age-from">
            {range ? "시작 나이" : "나이"}
          </label>
          <select
            id="age-from"
            className={selectClass}
            value={value.from}
            onChange={(e) => {
              const from = Number(e.target.value);
              onChange({ from, to: range ? Math.max(from, value.to) : from });
            }}
          >
            {AGES.map((a) => (
              <option key={a} value={a}>
                {a}살
              </option>
            ))}
          </select>
          {range ? (
            <>
              <span aria-hidden="true">부터</span>
              <label className="sr-only" htmlFor="age-to">
                끝 나이
              </label>
              <select
                id="age-to"
                className={selectClass}
                value={value.to}
                onChange={(e) => onChange({ from: value.from, to: Number(e.target.value) })}
              >
                {AGES.filter((a) => a >= value.from).map((a) => (
                  <option key={a} value={a}>
                    {a}살
                  </option>
                ))}
              </select>
              <span aria-hidden="true">까지</span>
              <button type="button" onClick={toggleRange} className={smallLink}>
                나이 하나로
              </button>
            </>
          ) : (
            <button type="button" onClick={toggleRange} className={smallLink}>
              범위로 고르기
            </button>
          )}
        </div>
      )}
    </fieldset>
  );
}
