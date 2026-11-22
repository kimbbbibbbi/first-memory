/** 내가 쓴 장면 상자: 구체화 질문을 받는 동안 원래 장면을 계속 보여줘요 */
export default function SceneBox({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-card bg-sand px-4 py-3.5">
      <span className="text-tag text-sand-ink">내가 쓴 장면</span>
      <p className="line-clamp-3 font-batang text-scene whitespace-pre-line">{text}</p>
    </div>
  );
}
