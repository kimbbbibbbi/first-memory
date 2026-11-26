import Seed from "./Seed";

/** 서버에서 기억을 불러오는 동안 잠깐 보이는 화면 */
export default function LoadingScreen({ text = "기억을 불러오고 있어요" }: { text?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-caption text-ink-sub">
      <Seed size={48} />
      <p role="status">{text}</p>
    </div>
  );
}
