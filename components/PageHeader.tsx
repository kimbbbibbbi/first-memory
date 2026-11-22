// 화면 상단 제목 (높이 64, 제목은 가운데). 왼쪽·오른쪽에 버튼을 넣을 수 있어요.

export default function PageHeader({
  title,
  left,
  right,
}: {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="grid h-16 shrink-0 grid-cols-[4rem_1fr_4rem] items-center px-2 pt-3">
      <div className="flex justify-start">{left}</div>
      <h1 className="text-center font-batang text-header font-bold">{title}</h1>
      <div className="flex justify-end">{right}</div>
    </header>
  );
}
