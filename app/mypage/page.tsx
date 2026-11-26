import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import PageHeader from "@/components/PageHeader";
import MyPage from "./MyPage";

export const metadata: Metadata = { title: "마이페이지" };

// 마이페이지: 화면 맨 위 별명 칸을 누르면 와요. (예전 설정 화면을 합쳤어요)
export default function MyPageRoute() {
  return (
    <>
      <PageHeader title="마이페이지" left={<BackLink href="/journey" />} />
      <MyPage />
    </>
  );
}
