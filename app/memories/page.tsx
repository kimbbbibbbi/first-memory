import type { Metadata } from "next";
import { Suspense } from "react";
import AccountBar from "@/components/AccountBar";
import BottomTabs from "@/components/BottomTabs";
import LoadingScreen from "@/components/LoadingScreen";
import PageHeader from "@/components/PageHeader";
import Timeline from "./Timeline";

export const metadata: Metadata = { title: "내 기억" };

// 내 기억 타임라인 (시안 Timeline.dc.html). 설정은 맨 위 별명 칸 → 마이페이지로 옮겼어요.
export default function MemoriesPage() {
  return (
    <>
      <AccountBar />
      <PageHeader title="내 기억" />
      <Suspense fallback={<LoadingScreen />}>
        <Timeline />
      </Suspense>
      <BottomTabs />
    </>
  );
}
