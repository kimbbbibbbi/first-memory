import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
