import type { Metadata } from "next";
import { Suspense } from "react";
import BottomTabs from "@/components/BottomTabs";
import LoadingScreen from "@/components/LoadingScreen";
import PageHeader from "@/components/PageHeader";
import Journey from "./Journey";

export const metadata: Metadata = { title: "질문" };

// 질문 탭 (시안 Journey.dc.html)
export default function JourneyPage() {
  return (
    <>
      <PageHeader title="질문" />
      {/* 기억은 브라우저에 저장돼 있어서, 불러오는 동안 잠깐 로딩 화면을 보여줘요 */}
      <Suspense fallback={<LoadingScreen />}>
        <Journey />
      </Suspense>
      <BottomTabs />
    </>
  );
}
