-- =====================================================================
-- 첫 기억 — 계정 삭제 함수 (2026-11-23)
-- schema.sql을 실행한 뒤, Supabase 대시보드 > SQL Editor에 이 파일을 붙여 넣고 Run을 한 번 누르세요.
--
-- 로그인한 사람이 "자기 계정"만 지울 수 있어요. 다른 사람 계정은 지울 수 없어요.
-- 계정을 지우면 연결된 별명·기억·구체화 답·실마리·공감·신고가 모두 함께 지워져요
-- (schema.sql의 on delete cascade). 되돌릴 수 없어요.
-- 앱은 이 함수를 부르기 전에 비밀번호를 한 번 더 확인해요.
-- =====================================================================

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception '로그인한 사람만 계정을 지울 수 있어요';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
