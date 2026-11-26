import Image from "next/image";

// 캐릭터 "감자" (2026-11-26, 예전 씨앗 SVG 대신)
// 원본: 프로젝트 폴더의 감자.png → 빈 여백을 자르고 가로 600px webp로 줄인 public/gamja.webp
// size는 가로 크기(px)예요. 세로는 그림 비율(600 x 520)에 맞춰 정해져요.

const RATIO = 520 / 600;

export default function Seed({ size = 72 }: { size?: number }) {
  return (
    <Image
      src="/gamja.webp"
      width={size}
      height={Math.round(size * RATIO)}
      alt=""
      aria-hidden="true"
      className="shrink-0 select-none"
      draggable={false}
    />
  );
}
