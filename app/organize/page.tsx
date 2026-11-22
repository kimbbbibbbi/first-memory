import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Organize from "./Organize";

export const metadata: Metadata = { title: "기억 정리" };

// 기억 정리 (시안 Clue.dc.html): /organize?id=기억id
export default function OrganizePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Organize />
    </Suspense>
  );
}
