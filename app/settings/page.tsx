import { redirect } from "next/navigation";

// 설정 화면은 마이페이지로 합쳤어요. 예전 주소로 들어오면 마이페이지로 보내요.
export default function SettingsPage() {
  redirect("/mypage");
}
