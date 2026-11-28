import type { Metadata } from "next";
import AccountBar from "@/components/AccountBar";
import BottomTabs from "@/components/BottomTabs";
import PageHeader from "@/components/PageHeader";
import Feed from "./Feed";

export const metadata: Metadata = { title: "함께 보기" };

// 함께 보는 기억 (시안 Feed.dc.html). 로그인하지 않아도 읽어요. 공감·신고는 로그인한 사람만 (2026-11-28).
// "같은 질문 모아보기" 탭은 기획서의 확장 기능이라 나중에 만들어요.
export default function TogetherPage() {
  return (
    <>
      <AccountBar />
      <PageHeader title="함께 보는 기억" />
      <Feed />
      <BottomTabs />
    </>
  );
}
