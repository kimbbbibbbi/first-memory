-- =====================================================================
-- 첫 기억 — 데이터베이스 설계도 (2단계 계정·저장 + 3단계 공유)
-- Supabase 대시보드 > SQL Editor에 이 파일 전체를 붙여 넣고 Run을 한 번 누르세요.
--
-- 핵심 규칙 (CLAUDE.md "꼭 지킬 규칙")
-- * 기억, 구체화 답, 실마리, 별명 표는 "쓴 사람만" 읽고 쓸 수 있어요 (RLS).
-- * 다른 사람에게 보이는 것은 get_feed() 함수 하나뿐이에요:
--   공유된 기억의 본문 + 별명 + 질문 번호(질문 종류를 보여 주는 데만 씀) + 공감 수.
-- * 이메일은 Supabase 로그인 시스템(auth.users)에만 있고, 이 표들에는 복사하지 않아요.
-- * 새 기억은 항상 '나만 보기'로 저장돼요. 공유는 쓴 사람이 직접 바꿀 때만.
-- * 서로 다른 3명이 신고하면 그 기억은 자동으로 숨겨져요.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. 별명 (profiles)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null
    check (char_length(nickname) between 2 and 12 and nickname = btrim(nickname)),
  created_at timestamptz not null default now()
);

-- 대소문자만 다른 별명도 같은 별명으로 봐요
create unique index profiles_nickname_unique on public.profiles (lower(nickname));

alter table public.profiles enable row level security;

create policy "별명: 내 것만 읽기" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "별명: 내 것만 바꾸기" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 별명 칸만 바꿀 수 있어요. 새 줄은 가입할 때 아래 트리거가 만들어요.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (nickname) on public.profiles to authenticated;

-- 가입하면 가입할 때 적은 별명으로 profiles 줄을 자동으로 만들어요.
-- 별명이 비었거나 겹치면 가입 자체가 실패해요.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, btrim(coalesce(new.raw_user_meta_data ->> 'nickname', '')));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 가입 화면에서 "이 별명 쓸 수 있나요?"를 미리 확인하는 함수 (참/거짓만 알려줘요)
create function public.nickname_available(p_nickname text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles
    where lower(nickname) = lower(btrim(p_nickname))
      and id is distinct from auth.uid()
  );
$$;

grant execute on function public.nickname_available(text) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. 기억 (memories)
-- ---------------------------------------------------------------------
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id text check (question_id is null or char_length(question_id) <= 40),            -- 자유 기록이면 비어 있어요
  question_text text check (question_text is null or char_length(question_text) <= 300),   -- 쓸 때 보였던 질문 문장 (실마리가 들어 있을 수 있어 공유하지 않아요)
  parent_id uuid references public.memories (id) on delete set null,
  from_clue_id uuid,                      -- 아래 clues 표를 만든 뒤 연결해요
  title text not null default '' check (char_length(title) <= 40),
  body text not null check (char_length(btrim(body)) between 1 and 500),
  age_from smallint not null check (age_from between 0 and 19),
  age_to smallint not null check (age_to between 0 and 19),
  source text check (source in ('direct', 'media', 'told', 'unknown')),
  visibility text not null default 'private' check (visibility in ('private', 'shared')),
  shared_at timestamptz,                  -- 공유를 켠 때 (함께 보기 순서에만 써요)
  hidden boolean not null default false,  -- 신고가 쌓여 숨겨졌는지
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (age_to >= age_from)
);

create index memories_user_id_idx on public.memories (user_id);
create index memories_feed_idx on public.memories (shared_at desc) where visibility = 'shared' and not hidden;

alter table public.memories enable row level security;

create policy "기억: 내 것만 읽기" on public.memories
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "기억: 내 것만 쓰기 (처음엔 나만 보기)" on public.memories
  for insert to authenticated
  with check (user_id = (select auth.uid()) and visibility = 'private');

create policy "기억: 내 것만 고치기" on public.memories
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "기억: 내 것만 지우기" on public.memories
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- 칸마다 허락: "숨김(hidden)", "공유 시각", "작성자"는 사용자가 직접 바꿀 수 없어요.
revoke all on public.memories from anon, authenticated;
grant select, delete on public.memories to authenticated;
grant insert (question_id, question_text, parent_id, from_clue_id, title, body, age_from, age_to)
  on public.memories to authenticated;
grant update (title, body, age_from, age_to, source, visibility)
  on public.memories to authenticated;

-- 고칠 때 시각을 바꾸고, 공유를 켜고 끌 때 공유 시각을 정해요
create function public.memories_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.visibility = 'shared' and old.visibility <> 'shared' then
    new.shared_at := now();
  elsif new.visibility = 'private' then
    new.shared_at := null;
  end if;
  return new;
end;
$$;

create trigger memories_before_update
  before update on public.memories
  for each row execute function public.memories_before_update();


-- ---------------------------------------------------------------------
-- 3. 구체화 답 (memory_details) — 쓴 사람만
-- ---------------------------------------------------------------------
create table public.memory_details (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id text not null check (char_length(question_id) <= 40),
  answer text check (answer is null or char_length(answer) <= 200),  -- 비어 있으면 "잘 모르겠어요"
  created_at timestamptz not null default now(),
  unique (memory_id, question_id)
);

create index memory_details_user_id_idx on public.memory_details (user_id);

alter table public.memory_details enable row level security;

create policy "답: 내 것만 읽기" on public.memory_details
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "답: 내 기억에만 쓰기" on public.memory_details
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.memories m where m.id = memory_id and m.user_id = (select auth.uid()))
  );

create policy "답: 내 것만 고치기" on public.memory_details
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.memories m where m.id = memory_id and m.user_id = (select auth.uid()))
  );

create policy "답: 내 것만 지우기" on public.memory_details
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.memory_details from anon;


-- ---------------------------------------------------------------------
-- 4. 실마리 (clues) — 쓴 사람만, 기억 하나에 최대 5개
-- ---------------------------------------------------------------------
create table public.clues (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('person', 'place', 'thing', 'sense', 'feeling')),
  text text not null check (char_length(btrim(text)) between 1 and 20),
  created_at timestamptz not null default now()
);

create index clues_user_id_idx on public.clues (user_id);
create index clues_memory_id_idx on public.clues (memory_id);

-- 이어서 쓴 기억이 어느 실마리에서 왔는지 연결 (실마리를 지우면 연결만 풀려요)
alter table public.memories
  add constraint memories_from_clue_id_fkey
  foreign key (from_clue_id) references public.clues (id) on delete set null;

alter table public.clues enable row level security;

create policy "실마리: 내 것만 읽기" on public.clues
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "실마리: 내 기억에만 쓰기" on public.clues
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.memories m where m.id = memory_id and m.user_id = (select auth.uid()))
  );

create policy "실마리: 내 것만 지우기" on public.clues
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.clues from anon;
revoke update on public.clues from authenticated;

create function public.clues_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.clues where memory_id = new.memory_id) >= 5 then
    raise exception '실마리는 기억 하나에 5개까지 남길 수 있어요';
  end if;
  return new;
end;
$$;

create trigger clues_limit
  before insert on public.clues
  for each row execute function public.clues_limit();


-- ---------------------------------------------------------------------
-- 5. 공감 (reactions)
-- ---------------------------------------------------------------------
-- 공감·신고할 수 있는 기억인지: 공유 중이고, 숨겨지지 않았고, 내 글이 아닌지
create function public.can_react(p_memory_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memories m
    where m.id = p_memory_id
      and m.visibility = 'shared'
      and not m.hidden
      and m.user_id is distinct from auth.uid()
  );
$$;

grant execute on function public.can_react(uuid) to authenticated;

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (memory_id, user_id)
);

create index reactions_user_id_idx on public.reactions (user_id);

alter table public.reactions enable row level security;

create policy "공감: 내 것만 읽기" on public.reactions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "공감: 공유된 남의 글에만 누르기" on public.reactions
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.can_react(memory_id));

create policy "공감: 내 것만 취소하기" on public.reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.reactions from anon;
revoke update on public.reactions from authenticated;


-- ---------------------------------------------------------------------
-- 6. 신고 (reports) — 넣기만 가능, 아무도 읽을 수 없음(운영자는 대시보드에서 확인)
-- ---------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason text not null check (reason in ('privacy', 'hurtful', 'other')),
  created_at timestamptz not null default now(),
  unique (memory_id, reporter_id)
);

create index reports_reporter_id_idx on public.reports (reporter_id);

alter table public.reports enable row level security;

create policy "신고: 공유된 남의 글에만 하기" on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()) and public.can_react(memory_id));

revoke all on public.reports from anon, authenticated;
grant insert (memory_id, reason) on public.reports to authenticated;

-- 서로 다른 3명(가입한 지 하루 지난 계정)이 신고하면 자동으로 숨겨요
create function public.reports_auto_hide()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 가입한 지 하루가 지난 계정의 신고만 세요 (가짜 계정으로 숨기기 방지, 04_report_guard.sql)
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

create trigger reports_auto_hide
  after insert on public.reports
  for each row execute function public.reports_auto_hide();


-- ---------------------------------------------------------------------
-- 7. 함께 보기 피드 — 다른 사람에게 보이는 유일한 통로
-- ---------------------------------------------------------------------
-- 로그인하지 않은 사람도 읽을 수 있어요 (2026-11-27에 잠갔다가 2026-11-28에 다시 엶, 05_feed_public.sql).
-- 돌려주는 것: 기억 번호, 본문, 별명, 질문 번호, 공감 수, 내가 공감했는지, 내 글인지.
-- 나이·출처·제목·질문 문장·작성 시각·작성자 번호는 돌려주지 않아요.
create function public.get_feed(p_limit integer default 20, p_offset integer default 0)
returns table (
  id uuid,
  body text,
  nickname text,
  question_id text,
  reaction_count bigint,
  reacted boolean,
  is_mine boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.id,
    m.body,
    p.nickname,
    m.question_id,
    (select count(*) from public.reactions r where r.memory_id = m.id) as reaction_count,
    exists (select 1 from public.reactions r where r.memory_id = m.id and r.user_id = auth.uid()) as reacted,
    (m.user_id = auth.uid()) is true as is_mine
  from public.memories m
  join public.profiles p on p.id = m.user_id
  where m.visibility = 'shared' and not m.hidden
  order by m.shared_at desc nulls last, m.id
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;

grant execute on function public.get_feed(integer, integer) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 8. 함수 실행 권한 정리
-- ---------------------------------------------------------------------
-- 트리거용 함수는 아무도 직접 부를 수 없게 해요.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.memories_before_update() from public, anon, authenticated;
revoke execute on function public.clues_limit() from public, anon, authenticated;
revoke execute on function public.reports_auto_hide() from public, anon, authenticated;

-- 화면에서 부르는 함수는 필요한 사람에게만 열어요.
revoke execute on function public.can_react(uuid) from public, anon;
grant execute on function public.can_react(uuid) to authenticated;
revoke execute on function public.nickname_available(text) from public;
grant execute on function public.nickname_available(text) to anon, authenticated;
-- 함께 보기는 로그인하지 않은 사람도 읽어요 (2026-11-28, 05_feed_public.sql)
revoke execute on function public.get_feed(integer, integer) from public;
grant execute on function public.get_feed(integer, integer) to anon, authenticated;
