"use client";

import { useSyncExternalStore } from "react";
import { emptyList, loadClues, loadDetails, loadMemories, subscribe } from "./storage";
import type { Clue, Memory, MemoryDetail } from "./types";

// 저장된 내용을 읽는 훅이에요. 저장 내용이 바뀌면 화면이 자동으로 다시 그려져요.

export function useMemories(): Memory[] {
  return useSyncExternalStore(subscribe, loadMemories, emptyList<Memory>);
}

export function useDetails(): MemoryDetail[] {
  return useSyncExternalStore(subscribe, loadDetails, emptyList<MemoryDetail>);
}

export function useClues(): Clue[] {
  return useSyncExternalStore(subscribe, loadClues, emptyList<Clue>);
}
