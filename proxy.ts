// 화면을 열기 전에 로그인했는지 확인해요 (Next.js 16에서는 middleware 대신 proxy라고 불러요)
// - 로그인하지 않았으면: 시작·로그인·가입·함께 보기·개인정보 처리방침·비밀번호 찾기만 열려요.
//   (새 비밀번호 정하기 /reset-password 는 메일 링크로 로그인된 뒤에 열려요) 나머지는 로그인 화면으로 보내요.
// - 로그인했으면: 로그인·가입 화면 대신 질문 탭으로 보내요.
// 진짜 보안은 데이터베이스 규칙(RLS)이 지키고, 여기서는 길 안내만 해요.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/together",
  "/privacy",
  "/forgot-password",
  "/auth/confirm",
];
const AUTH_PAGES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // 로그인 정보를 확인하고, 필요하면 새로 고쳐서 쿠키에 다시 넣어요
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    const [p, q] = path.split("?");
    url.pathname = p;
    url.search = q ? `?${q}` : "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!loggedIn && !PUBLIC_PATHS.includes(pathname)) {
    return redirectTo(`/login?next=${encodeURIComponent(pathname + search)}`);
  }
  if (loggedIn && AUTH_PAGES.includes(pathname)) {
    return redirectTo("/journey");
  }
  return response;
}

export const config = {
  // 그림·글꼴 같은 파일에는 로그인 확인을 하지 않아요
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
