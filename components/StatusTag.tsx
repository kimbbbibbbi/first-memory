import { LockIcon } from "./icons";
import Tag from "./Tag";

/**
 * 공개 상태 태그. 1단계에서는 모든 기억이 "나만 보기"예요.
 * ("별명으로 공유 중" 태그는 3단계에서 추가해요.)
 */
export default function StatusTag() {
  return (
    <Tag tone="sand">
      <LockIcon size={12} strokeWidth={2.4} />
      나만 보기
    </Tag>
  );
}
