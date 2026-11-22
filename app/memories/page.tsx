import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import BottomTabs from "@/components/BottomTabs";
import LoadingScreen from "@/components/LoadingScreen";
import PageHeader from "@/components/PageHeader";
import { GearIcon } from "@/components/icons";
import Timeline from "./Timeline";

export const metadata: Metadata = { title: "내 기억" };

// 내 기억 타임라인 (시안 Timeline.dc.html)
export default function MemoriesPage() {
  return (
    <>
      <PageHeader
        title="내 기억"
        right={
          <Link
            href="/settings"
            aria-label="설정"
            className="flex size-12 items-center justify-center rounded-full text-ink-sub hover:bg-sand hover:text-ink"
          >
            <GearIcon size={22} />
          </Link>
        }
      />
      <Suspense fallback={<LoadingScreen />}>
        <Timeline />
      </Suspense>
      <BottomTabs />
    </>
  );
}
