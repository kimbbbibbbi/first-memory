import type { Metadata } from "next";
import Link from "next/link";
import { textLink } from "@/components/ui";

export const metadata: Metadata = { title: "개인정보 처리방침" };

// 개인정보 처리방침 (로그인하지 않아도 볼 수 있어요). 본문은 "~합니다" 말투 (2026-11-27)
// 내용을 바꾸면 아래 "시행일"도 함께 바꿔 주세요.

const OPERATOR = "서광일";
const CONTACT = "rhkdlf02@naver.com";
const EFFECTIVE_DATE = "2026년 11월 27일";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-batang text-card-question-sm font-bold">{title}</h2>
      <div className="flex flex-col gap-2 text-ui leading-relaxed text-ink">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-row border border-line bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-segment-bg">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-normal whitespace-nowrap text-ink-sub">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.join("|")} className="border-t border-line align-top">
              {r.map((c, i) => (
                <td key={i} className={`px-3 py-2 ${i === 0 ? "whitespace-nowrap" : ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="flex flex-col gap-7 px-5 pt-10 pb-12">
      <header className="flex flex-col gap-2">
        <Link href="/" className="font-batang text-xl font-bold tracking-[0.1em] text-primary">
          첫 기억
        </Link>
        <h1 className="font-batang text-question font-bold">개인정보 처리방침</h1>
        <p className="text-caption text-ink-sub">시행일: {EFFECTIVE_DATE}</p>
        <p className="text-ui leading-relaxed">
          &lsquo;첫 기억&rsquo;(이하 &lsquo;서비스&rsquo;)은 이용자가 어린 시절의 기억을 기록하고, 원하는
          기억만 별명으로 나눌 수 있도록 돕는 웹 서비스입니다. 서비스는 「개인정보 보호법」에 따라 이용자의
          개인정보를 아래와 같이 처리합니다.
        </p>
      </header>

      <Section title="1. 수집하는 정보">
        <Table
          head={["시점", "항목", "구분"]}
          rows={[
            ["가입할 때", "이메일 주소, 비밀번호, 별명", "필수"],
            [
              "서비스 이용 중",
              "직접 쓴 기억(본문, 제목, 그때 나이, 질문, 기억의 출처), 구체화 질문에 적은 답, 실마리, 공유 여부, 공감·신고 기록",
              "작성한 경우",
            ],
            ["자동 수집", "로그인을 유지하는 쿠키, 접속 기록(IP 주소, 브라우저 정보, 접속 시각)", "필수"],
          ]}
        />
        <p>
          비밀번호는 암호화되어 저장되며, 운영자도 볼 수 없습니다. 이메일은 로그인, 본인 확인, 비밀번호 찾기
          메일 발송에만 사용하며, 다른 이용자에게는 어떤 화면에서도 보이지 않습니다.
        </p>
        <p className="text-sm text-ink-sub">
          기억에는 가족 이야기나 감정처럼 민감할 수 있는 내용이 포함될 수 있습니다. 이러한 내용은 이용자가
          직접 적은 만큼만 저장되며, 공유를 켜지 않으면 본인만 볼 수 있습니다.
        </p>
      </Section>

      <Section title="2. 수집 목적">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>회원 가입, 로그인, 본인 확인, 비밀번호 찾기</li>
          <li>기억과 답, 실마리의 저장 및 다시 보여 주기</li>
          <li>이용자가 공유를 켠 기억을 별명과 함께 &lsquo;함께 보기&rsquo;에 보여 주기, 공감 표시</li>
          <li>신고 접수와 부적절한 글 관리</li>
          <li>서비스 오류 확인과 안전한 운영</li>
        </ul>
      </Section>

      <Section title="3. 다른 이용자에게 보이는 정보">
        <p>
          모든 기억은 처음에 &lsquo;나만 보기&rsquo;로 저장됩니다. 이용자가 기억마다 공유를 직접 켠 경우에만
          그 기억의 <strong>본문, 별명, 질문 종류, 공감 수</strong>가 &lsquo;함께 보기&rsquo;에 표시됩니다.
          함께 보기는 로그인한 이용자만 볼 수 있습니다.
        </p>
        <p>
          나이, 기억의 출처, 구체화 답, 실마리, 이메일은 공유하더라도 다른 이용자에게 보이지 않습니다. 공유는
          언제든 끄거나 기억을 삭제할 수 있으며, 그러면 함께 보기에서 바로 사라집니다.
        </p>
      </Section>

      <Section title="4. 보관 기간">
        <p>
          이용자가 계정을 삭제할 때까지 보관합니다. 계정을 삭제하면 계정과 기억, 답, 실마리, 공감, 신고 기록이
          즉시 모두 삭제되며 되돌릴 수 없습니다. 기억 하나를 삭제하면 그 기억에 딸린 답과 실마리도 함께
          삭제됩니다.
        </p>
        <p className="text-sm text-ink-sub">
          다만 아래 업체의 시스템에 남는 백업과 접속 기록은 각 업체가 정한 기간이 지나면 삭제됩니다.
        </p>
      </Section>

      <Section title="5. 처리 위탁과 제3자 제공">
        <p>
          개인정보를 다른 사람이나 회사에 판매하거나 제공하지 않습니다. 서비스 운영을 위해 아래 업체에 처리를
          맡깁니다.
        </p>
        <Table
          head={["업체", "맡기는 일", "정보가 있는 곳"]}
          rows={[
            [
              "Supabase Inc.",
              "회원 정보와 기록 저장, 로그인 처리",
              "대한민국(서울) 서버",
            ],
            [
              "Vercel Inc.",
              "웹사이트 제공(화면 전달)과 접속 기록 처리",
              "미국 등 Vercel이 운영하는 서버",
            ],
            [
              "네이버 주식회사",
              "비밀번호 찾기 메일 발송 (받는 이메일 주소와 메일 내용)",
              "대한민국",
            ],
          ]}
        />
        <p className="text-sm text-ink-sub">
          Vercel을 통해 화면을 주고받는 과정에서 접속 기록(IP 주소, 브라우저 정보)과 이용자가 주고받는 내용이
          미국 등 국외 서버를 거칠 수 있습니다. 이는 서비스 제공에 꼭 필요한 처리이며, 서비스를 이용하는 동안
          계속됩니다. 원하지 않으면 계정을 삭제하고 이용을 중단할 수 있습니다.
        </p>
      </Section>

      <Section title="6. 쿠키">
        <p>
          로그인 유지를 위한 쿠키만 사용합니다. 광고나 방문 분석을 위한 쿠키는 사용하지 않습니다. 브라우저
          설정에서 쿠키를 차단하면 로그인이 유지되지 않을 수 있습니다.
        </p>
      </Section>

      <Section title="7. 이용자의 권리">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>내 기억은 &lsquo;내 기억&rsquo; 화면에서 언제든 보고, 고치고, 삭제할 수 있습니다.</li>
          <li>별명은 &lsquo;마이페이지&rsquo;에서 바꿀 수 있습니다.</li>
          <li>계정과 모든 기록은 &lsquo;마이페이지&rsquo; &gt; &lsquo;계정 삭제&rsquo;에서 바로 삭제할 수 있습니다.</li>
          <li>그 밖에 열람, 정정, 삭제, 처리 정지를 원하시면 아래 연락처로 알려 주십시오. 지체 없이 답변드리겠습니다.</li>
        </ul>
      </Section>

      <Section title="8. 만 14세 미만 아동">
        <p>만 14세 미만은 가입할 수 없습니다. 가입할 때 만 14세 이상임을 확인합니다.</p>
      </Section>

      <Section title="9. 안전성 확보 조치">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>모든 연결은 암호화(HTTPS)됩니다.</li>
          <li>
            데이터베이스 규칙(행 단위 보안)으로, 나만 보기 기억과 답, 실마리는 작성한 사람만 읽을 수 있도록
            막아 두었습니다.
          </li>
          <li>비밀번호는 암호화하여 저장합니다.</li>
        </ul>
      </Section>

      <Section title="10. 개인정보 보호책임자와 문의">
        <Table head={["구분", "내용"]} rows={[["보호책임자", OPERATOR], ["문의", CONTACT]]} />
        <p className="text-sm text-ink-sub">
          개인정보 침해에 대한 상담은 개인정보침해신고센터(국번 없이 118, privacy.kisa.or.kr)나
          개인정보분쟁조정위원회(1833-6972, kopico.go.kr)에도 하실 수 있습니다.
        </p>
      </Section>

      <Link href="/" className={textLink}>
        처음 화면으로
      </Link>
    </main>
  );
}
