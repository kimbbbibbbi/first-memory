import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import PageHeader from "@/components/PageHeader";
import Settings from "./Settings";

export const metadata: Metadata = { title: "설정" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="설정" left={<BackLink href="/memories" />} />
      <Settings />
    </>
  );
}
