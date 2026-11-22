import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Branch from "./Branch";

export const metadata: Metadata = { title: "이어서 떠올리기" };

// 이어서 떠올리기 (시안 Branch.dc.html)
//   /branch?id=기억id   기억 하나를 정리한 뒤: 그 기억의 실마리 질문 + 시간 질문
//   /branch?clue=실마리id 질문 탭에서 실마리를 골랐을 때
export default function BranchPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Branch />
    </Suspense>
  );
}
