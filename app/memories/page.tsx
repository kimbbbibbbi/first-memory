import type { Metadata } from "next";
import { Suspense } from "react";
import BottomTabs from "@/components/BottomTabs";
import LoadingScreen from "@/components/LoadingScreen";
import PageHeader from "@/components/PageHeader";
import Timeline from "./Timeline";

export const metadata: Metadata = { title: "내 기억" };

// 내 기억 타임라인 (시안 Timeline.dc.html)
export default function MemoriesPage() {
  return (
    <>
      <PageHeader title="내 기억" />
      <Suspense fallback={<LoadingScreen />}>
        <Timeline />
      </Suspense>
      <BottomTabs />
    </>
  );
}
