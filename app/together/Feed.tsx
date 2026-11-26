"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FeedCard from "@/components/FeedCard";
import LoadingScreen from "@/components/LoadingScreen";
import Seed from "@/components/Seed";
import { primaryButton, textLink } from "@/components/ui";
import { useAccount } from "@/lib/account";
import { FEED_PAGE, loadFeed, type FeedItem } from "@/lib/feed";

/**
 * 함께 보는 기억 (2026-11-27부터 로그인한 사람만)
 * 로그인하지 않았으면 안내 화면을 보여주고, 기억은 불러오지 않아요.
 * (데이터베이스도 로그인하지 않은 사람에게는 get_feed를 막아요: supabase/03_feed_login_only.sql)
 */
export default function Feed() {
  const account = useAccount();
  if (account.status === "checking") return <LoadingScreen text="함께 보는 기억을 불러오고 있어요" />;
  if (account.status === "guest") return <LoginNeeded />;
  return <FeedList />;
}

function LoginNeeded() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-7 pb-28 text-center">
      <Seed size={56} />
      <p className="font-batang text-card-question font-bold">
        로그인하면 다른 사람들의
        <br />
        첫 기억을 볼 수 있어요
      </p>
      <p className="text-ui text-ink-sub">나눈 기억에는 본문과 별명만 보여요.</p>
      <div className="mt-3 flex w-full flex-col">
        <Link href="/login?next=%2Ftogether" className={primaryButton}>
          로그인
        </Link>
        <Link href="/signup?next=%2Ftogether" className={textLink}>
          가입하기
        </Link>
      </div>
    </main>
  );
}

/** 공유된 기억을 최근 순서로 보여줘요 (로그인한 사람만 여기에 와요) */
function FeedList() {
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reportedNote, setReportedNote] = useState(false);

  useEffect(() => {
    let alive = true;
    loadFeed(0)
      .then((list) => {
        if (!alive) return;
        setItems(list);
        setHasMore(list.length === FEED_PAGE);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  async function loadMore() {
    if (!items) return;
    setLoadingMore(true);
    try {
      const more = await loadFeed(items.length);
      const seen = new Set(items.map((i) => i.id));
      setItems([...items, ...more.filter((m) => !seen.has(m.id))]);
      setHasMore(more.length === FEED_PAGE);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  function handleReported(id: string) {
    // 신고한 기억은 내 화면에서 바로 치워요
    setItems((list) => list?.filter((i) => i.id !== id) ?? null);
    setReportedNote(true);
  }

  if (error && !items) {
    return (
      <p role="alert" className="px-7 pt-16 text-center text-ui text-ink-sub">
        함께 보기를 불러오지 못했어요. 잠시 뒤에 다시 와 주세요.
      </p>
    );
  }
  if (!items) return <LoadingScreen text="함께 보는 기억을 불러오고 있어요" />;

  return (
    <main className="flex flex-col gap-3 px-5 pt-1 pb-28">
      {reportedNote && (
        <p role="status" className="rounded-row bg-mist px-4 py-3 text-caption text-mist-ink">
          신고했어요. 알려 주셔서 고마워요.
        </p>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 pt-16 text-center">
          <Seed size={56} />
          <p className="font-batang text-card-question font-bold">아직 나눈 기억이 없어요</p>
          <p className="text-ui text-ink-sub">첫 번째로 기억을 나눠 볼까요?</p>
          <Link href="/write?q=s-1" className={textLink}>
            첫 기억 쓰러 가기
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item, i) => (
            <FeedCard
              key={item.id}
              item={item}
              index={i}
              loggedIn
              onReported={handleReported}
            />
          ))}
        </ul>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="flex h-12 items-center justify-center text-ui text-primary underline"
        >
          {loadingMore ? "불러오는 중…" : "더 보기"}
        </button>
      )}
    </main>
  );
}
