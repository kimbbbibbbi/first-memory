"use client";

// 브라우저에서 쓰는 Supabase 연결 (로그인 정보는 쿠키에 저장돼요)
// 공개용 키(publishable)만 써요. 누가 무엇을 볼 수 있는지는 데이터베이스 규칙(RLS)이 지켜요.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function supabase(): SupabaseClient {
  client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return client;
}
