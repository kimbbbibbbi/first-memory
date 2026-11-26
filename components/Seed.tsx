import Image from "next/image";

// 캐릭터 "감자" (2026-11-26, 예전 씨앗 SVG 대신)
// 원본: 프로젝트 폴더의 감자.png, 감자 눕기.png → 빈 여백을 자르고 가로 600px webp로 줄였어요.
//   기본(서 있는 감자): public/gamja.webp (600 x 520)
//   lying(엎드려 쓰는 감자): public/gamja-lying.webp (600 x 542) — 질문 탭, 기억 쓰기, 이어서 떠올리기, 내 기억 (2026-11-27)
// size는 가로 크기(px)예요. 세로는 그림 비율에 맞춰 정해져요.

const IMAGES = {
  default: { src: "/gamja.webp", ratio: 520 / 600 },
  lying: { src: "/gamja-lying.webp", ratio: 542 / 600 },
};

export default function Seed({
  size = 56,
  pose = "default",
}: {
  size?: number;
  pose?: keyof typeof IMAGES;
}) {
  const { src, ratio } = IMAGES[pose];
  return (
    <Image
      src={src}
      width={size}
      height={Math.round(size * ratio)}
      alt=""
      aria-hidden="true"
      className="shrink-0 select-none"
      draggable={false}
    />
  );
}
