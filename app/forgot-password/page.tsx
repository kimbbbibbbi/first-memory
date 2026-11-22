import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = { title: "비밀번호 찾기" };

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen text="" />}>
      <ForgotForm />
    </Suspense>
  );
}
