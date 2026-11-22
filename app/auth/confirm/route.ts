// 비밀번호 재설정 메일 속 링크가 오는 곳: /auth/confirm?token_hash=…&type=recovery
// 링크가 맞으면 로그인시키고 새 비밀번호 화면으로, 틀리거나 시간이 지났으면 다시 요청 화면으로 보내요.
// (token_hash 방식이라 메일을 요청한 기기와 다른 기기에서 열어도 돼요)

import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type === "recovery") {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/reset-password`);
  }
  return NextResponse.redirect(`${origin}/forgot-password?error=link`);
}
