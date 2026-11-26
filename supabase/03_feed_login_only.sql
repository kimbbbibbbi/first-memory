-- =====================================================================
-- 첫 기억 — 함께 보기는 로그인한 사람만 (2026-11-27)
-- Supabase 대시보드 > SQL Editor에 이 파일을 붙여 넣고 Run을 한 번 누르세요.
--
-- 예전(2026-11-22)에는 로그인하지 않은 사람도 함께 보기를 읽을 수 있었어요.
-- 이제는 로그인하지 않은 사람(anon)이 get_feed 함수를 부를 수 없어요.
-- 화면만 가리면 주소를 직접 불러서 볼 수도 있어서, 데이터베이스에서 잠가요.
-- =====================================================================

revoke execute on function public.get_feed(integer, integer) from public, anon;
grant execute on function public.get_feed(integer, integer) to authenticated;
