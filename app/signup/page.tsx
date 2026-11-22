import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata: Metadata = { title: "가입하기" };

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
