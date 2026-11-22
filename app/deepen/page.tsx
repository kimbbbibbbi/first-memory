import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Deepen from "./Deepen";

export const metadata: Metadata = { title: "더 떠올려 보기" };

// 더 떠올려 보기 (시안 Deepen.dc.html): /deepen?id=기억id
export default function DeepenPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Deepen />
    </Suspense>
  );
}
