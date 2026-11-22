// 여러 화면에서 같이 쓰는 버튼·링크 모양 (DESIGN.md 4장)

/** 주요 버튼: 높이 56, 모서리 16, primary 배경 */
export const primaryButton =
  "flex h-14 w-full items-center justify-center rounded-card bg-primary text-button text-card hover:bg-primary-hover disabled:bg-off";

/** 보조 버튼(외곽선): 높이 52, 1px primary 테두리 */
export const outlineButton =
  "flex h-13 w-full items-center justify-center rounded-card border border-primary text-base text-primary hover:bg-mist";

/** 글자 링크 버튼(오늘은 여기까지 등): 높이 48, 밑줄 */
export const textLink =
  "flex h-12 items-center justify-center px-2 text-ui text-primary underline hover:text-primary-hover";

/** 두 개 나란한 버튼 (더 떠올려 보기 아래) */
export const pairLeftButton =
  "flex h-13 flex-1 items-center justify-center rounded-row border border-chip-border bg-card text-ui text-ink hover:border-primary";
export const pairRightButton =
  "flex h-13 flex-1 items-center justify-center rounded-row bg-primary text-ui text-card hover:bg-primary-hover";

/** 쓰기 순환 화면 아래쪽 버튼 묶음 */
export const bottomActions = "mt-auto flex flex-col pt-6 pb-4";
