import Seed from "./Seed";

/** 브라우저에서 기억을 불러오는 동안 잠깐 보이는 화면 */
export default function LoadingScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-caption text-ink-sub">
      <Seed size={48} />
      <p>기억을 불러오고 있어요</p>
    </div>
  );
}
