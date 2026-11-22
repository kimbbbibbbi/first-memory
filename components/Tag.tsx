// 작은 태그 (높이 26, 글자 12). 차원 태그, 실마리 종류 태그 등
// mist: 연초록 (차원, 사람·장소 실마리) / sand: 베이지 (시간 질문)

export default function Tag({
  tone = "mist",
  children,
}: {
  tone?: "mist" | "sand";
  children: React.ReactNode;
}) {
  const color = tone === "mist" ? "bg-mist text-mist-ink" : "bg-sand text-sand-ink";
  return (
    <span
      className={`inline-flex h-6.5 items-center gap-1 self-start rounded-full px-2.5 text-tag ${color}`}
    >
      {children}
    </span>
  );
}
