import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import WriteScreen from "./WriteScreen";

export const metadata: Metadata = { title: "기억 쓰기" };

// 기억 쓰기 (시안 Write.dc.html)
// 주소에 따라 하는 일이 달라요.
//   /write?q=질문id  → 그 질문에 답하기
//   /write           → 자유 기록
//   /write?edit=기억id → 쓴 기억 고치기
export default function WritePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WriteScreen />
    </Suspense>
  );
}
