"use client";

import { refreshMyData, useMyData, type MyData } from "@/lib/useStored";
import LoadingScreen from "./LoadingScreen";

/**
 * 내 데이터를 다 불러온 뒤에만 화면을 보여줘요.
 * 불러오는 중이면 로딩 화면, 실패하면 다시 시도 버튼을 보여줘요.
 */
export default function DataGate({ children }: { children: (data: MyData) => React.ReactNode }) {
  const data = useMyData();
  if (data.status === "loading") return <LoadingScreen />;
  if (data.status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-7 text-center">
        <p role="alert" className="text-ui text-ink-sub">
          기억을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.
        </p>
        <button
          type="button"
          onClick={() => void refreshMyData()}
          className="flex h-11 items-center px-4 text-ui text-primary underline"
        >
          다시 불러오기
        </button>
      </div>
    );
  }
  return <>{children(data)}</>;
}
