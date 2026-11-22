import { GlobeIcon, LockIcon } from "./icons";
import Tag from "./Tag";

/**
 * 공개 상태 태그
 * - 나만 보기: sand 배경 + 자물쇠
 * - 별명으로 공유 중: mist 배경 + 지구
 * - 신고로 숨겨짐: 공유 중이지만 함께 보기에서 숨겨진 상태
 */
export default function StatusTag({
  shared = false,
  hidden = false,
}: {
  shared?: boolean;
  hidden?: boolean;
}) {
  if (shared && hidden) {
    return (
      <Tag tone="sand">
        <GlobeIcon size={12} strokeWidth={2.4} />
        신고로 숨겨짐
      </Tag>
    );
  }
  if (shared) {
    return (
      <Tag tone="mist">
        <GlobeIcon size={12} strokeWidth={2.4} />
        별명으로 공유 중
      </Tag>
    );
  }
  return (
    <Tag tone="sand">
      <LockIcon size={12} strokeWidth={2.4} />
      나만 보기
    </Tag>
  );
}
