-- =====================================================================
-- 첫 기억 — 보안 점검 보완 (2026-11-28)
-- Supabase 대시보드 > SQL Editor에 이 파일 전체를 붙여 넣고 Run을 한 번 누르세요.
--
-- 1) 가짜 계정으로 남의 글 숨기기 막기
--    가입하면 바로 쓸 수 있어서, 한 사람이 계정 3개를 만들어 신고하면 글이 숨겨질 수 있었어요.
--    이제 "가입한 지 하루가 지난 계정"의 신고만 세어서, 서로 다른 3명이면 숨겨요.
--    (신고 자체는 그대로 저장돼요. 운영자는 대시보드에서 모든 신고를 볼 수 있어요.)
--
-- 2) 질문 칸 길이 제한
--    question_text, question_id에 길이 제한이 없어서 아주 긴 글을 넣을 수 있었어요.
-- =====================================================================

create or replace function public.reports_auto_hide()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(distinct r.reporter_id)
    from public.reports r
    join auth.users u on u.id = r.reporter_id
    where r.memory_id = new.memory_id
      and u.created_at < now() - interval '1 day'
  ) >= 3 then
    update public.memories set hidden = true where id = new.memory_id;
  end if;
  return new;
end;
$$;

revoke execute on function public.reports_auto_hide() from public, anon, authenticated;

alter table public.memories
  add constraint memories_question_text_len check (question_text is null or char_length(question_text) <= 300),
  add constraint memories_question_id_len check (question_id is null or char_length(question_id) <= 40);

alter table public.memory_details
  add constraint memory_details_question_id_len check (char_length(question_id) <= 40);
