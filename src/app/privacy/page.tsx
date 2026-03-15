import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold tracking-tight text-foreground">{children}</h2>;
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground">{children}</h3>;
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-hero">
      <Header logoHref="/">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            홈
          </Link>
        </Button>
      </Header>

      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">개인정보처리방침</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-7 text-foreground/90 space-y-6">
              <p>
                AutoDiet(이하 “서비스”)는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를
                보호하기 위해 다음과 같은 개인정보처리방침을 수립·공개합니다.
              </p>

              <section className="space-y-3">
                <SectionTitle>1. 개인정보의 처리 목적</SectionTitle>
                <p>서비스는 다음 목적을 위해 개인정보를 처리합니다.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>회원 가입 및 로그인(인증), 계정 관리</li>
                  <li>식단 및 운영 설정 저장·불러오기 기능 제공</li>
                  <li>
                    서비스 운영 및 보안 관리
                    <div className="text-muted-foreground">(비정상 사용 방지, 요청 제한(Rate Limiting), 오류 대응 등)</div>
                  </li>
                  <li>광고 제공(Google AdSense)</li>
                </ul>
              </section>

              <section className="space-y-3">
                <SectionTitle>2. 처리하는 개인정보 항목</SectionTitle>

                <div className="space-y-2">
                  <SubTitle>(1) 회원가입 및 로그인</SubTitle>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>이메일 주소</li>
                    <li>비밀번호</li>
                    <li>
                      비밀번호는 인증 제공자(Supabase Auth)에서 일방향 해시 등 안전한 방식으로 처리되며, 서비스는
                      비밀번호 원문을 저장하거나 조회할 수 없습니다.
                    </li>
                  </ul>
                  <p className="font-semibold text-foreground">소셜 로그인 이용 시</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>OAuth 제공자(Google, Kakao)로부터 제공되는 기본 식별 정보(이메일 등)</li>
                    <li>실제 제공 항목은 각 OAuth 제공자의 정책 및 이용자가 동의한 범위에 따라 달라질 수 있습니다.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <SubTitle>(2) 서비스 이용 및 저장 기능</SubTitle>
                  <p className="font-semibold text-foreground">이용자가 입력하거나 서비스 이용 과정에서 생성되는 데이터</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>급식소(가게)명</li>
                    <li>운영 설정 정보(1인 예산, 원가 비율, 반찬 수 등)</li>
                    <li>생성된 식단 데이터(메뉴 구성, 기간, 주차 정보 등)</li>
                  </ul>
                  <p className="font-semibold text-foreground">서비스 이용 과정에서 자동 생성되는 정보</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>접속 IP 주소</li>
                    <li>User-Agent 등 접속 환경 정보</li>
                    <li>요청 시각, 오류 로그</li>
                  </ul>
                  <p>해당 정보는 서비스 보안, 요청 제한, 오류 분석을 위한 목적으로 사용될 수 있습니다.</p>
                </div>

                <div className="space-y-2">
                  <SubTitle>(3) 문의</SubTitle>
                  <p>
                    문의 페이지에서 이용자가 입력하는 이름, 회신 이메일, 문의 내용은 이용자의 메일 작성 편의를 위해
                    브라우저에서 제목·본문을 구성하는 용도로만 사용됩니다.
                  </p>
                  <p>서비스 서버는 해당 내용을 별도로 저장하거나 데이터베이스로 수집하지 않습니다.</p>
                  <p>실제 문의 내용은 이용자가 사용하는 이메일 서비스(Gmail 등)를 통해 직접 전송됩니다.</p>
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>3. 개인정보의 보유 및 이용 기간</SectionTitle>
                <p>서비스는 개인정보의 처리 목적이 달성되면 지체 없이 해당 정보를 삭제합니다.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    계정 정보: 회원 탈퇴 시 즉시 삭제
                    <div className="text-muted-foreground">(단, 관계 법령에 따라 보관이 필요한 경우 해당 법령에서 정한 기간 동안 보관)</div>
                  </li>
                  <li>
                    저장된 설정 및 식단 데이터: 이용자가 삭제하거나 회원 탈퇴 시 삭제
                    <div className="text-muted-foreground">
                      (기술적·운영상 백업이 존재할 수 있으며, 백업 데이터는 일정 기간 후 순차적으로 삭제)
                    </div>
                  </li>
                  <li>
                    보안 및 오류 대응을 위한 로그(IP 등):
                    <div>
                      서비스는 접속·요청·오류 등 로그 정보를 별도 데이터베이스에 장기 저장하지 않습니다.
                    </div>
                    <div>
                      다만 보안 및 장애 대응을 위해 호스팅/플랫폼 환경(Vercel 등)에서 로그가 생성되거나, 요청 제한(Rate Limiting)을 위한 단기 기록이 일시적으로 처리될 수 있습니다.
                    </div>
                  </li>
                  <li>
                    광고 관련 정보(쿠키, 식별자 등): Google의 정책에 따라 처리되며, 서비스가 별도로 보관하지 않을 수
                    있습니다.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <SectionTitle>4. 개인정보의 제3자 제공</SectionTitle>
                <p>서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.</p>
                <p>
                  다만, 광고 제공 및 측정을 위해 Google 등 제3자 서비스가 이용자의 브라우저 환경에서 쿠키 또는 식별자
                  정보를 처리할 수 있습니다.
                </p>
                <p>
                  이는 서비스가 개인정보를 직접 제공하는 것이 아니라, 이용자의 브라우저 환경에서 제3자 서비스가
                  독립적으로 처리하는 것입니다.
                </p>
              </section>

              <section className="space-y-3">
                <SectionTitle>5. 개인정보 처리의 위탁 및 국외 이전</SectionTitle>
                <p>서비스는 기능 제공을 위해 다음과 같은 외부 서비스를 사용할 수 있습니다.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Supabase: 사용자 인증(회원가입·로그인), 데이터베이스 관리</li>
                  <li>Vercel: 웹 서비스 호스팅 및 배포</li>
                  <li>Google AdSense: 광고 제공</li>
                </ul>
                <p>위 서비스들은 국외 서버를 이용할 수 있어 개인정보가 국외로 이전(전송·저장)될 수 있습니다.</p>
                <p>
                  이 과정에서 계정 식별정보(이메일 등) 및 서비스 이용·저장 데이터(운영 설정, 식단 데이터 등)가 국외
                  서버로 전송·저장될 수 있습니다.
                </p>
                <p>구체적인 이전 국가 및 서버 위치는 각 서비스 제공자의 정책 및 이용 환경에 따라 달라질 수 있습니다.</p>
                <p>국외 이전이 발생하는 경우, 서비스는 관련 법령에서 요구하는 고지 및 보호 조치를 따릅니다.</p>
              </section>

              <section className="space-y-3">
                <SectionTitle>6. 쿠키(Cookie) 및 맞춤형 광고 안내</SectionTitle>
                <div className="space-y-2">
                  <SubTitle>(1) 서비스 기능 쿠키</SubTitle>
                  <p>서비스는 사용자 편의 기능 제공을 위해 쿠키를 사용할 수 있습니다(예: UI 상태 유지 등).</p>
                </div>
                <div className="space-y-2">
                  <SubTitle>(2) Google AdSense 광고</SubTitle>
                  <p>서비스는 Google AdSense를 사용합니다.</p>
                  <p>
                    Google 및 제3자 공급업체는 쿠키를 사용하여 이용자의 이전 방문 기록 등을 기반으로 광고를 제공할 수
                    있습니다.
                  </p>
                  <p>이용자는 Google 광고 설정을 통해 맞춤형 광고를 관리하거나 해제할 수 있습니다.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Google 광고 설정:{' '}
                      <a className="text-primary hover:underline" href="https://adssettings.google.com" target="_blank" rel="noreferrer">
                        https://adssettings.google.com
                      </a>
                    </li>
                    <li>
                      Google 개인정보처리방침:{' '}
                      <a className="text-primary hover:underline" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
                        https://policies.google.com/privacy
                      </a>
                    </li>
                    <li>
                      Google 광고 기술 안내:{' '}
                      <a
                        className="text-primary hover:underline"
                        href="https://policies.google.com/technologies/ads"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://policies.google.com/technologies/ads
                      </a>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>7. 이용자의 권리 및 행사 방법</SectionTitle>
                <p>
                  이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.
                </p>
                <p>
                  관련 요청은 아래 “개인정보 보호책임자”에게 이메일로 문의할 수 있으며, 서비스는 관련 법령에 따라
                  지체 없이 조치합니다.
                </p>
              </section>

              <section className="space-y-3">
                <SectionTitle>8. 개인정보의 안전성 확보 조치</SectionTitle>
                <p>서비스는 개인정보 보호를 위해 다음과 같은 조치를 취합니다.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>전송 구간 암호화(HTTPS)</li>
                  <li>인증 기반 접근 통제 및 접근 권한 최소화</li>
                  <li>보안 취약점 및 오류 모니터링(가능한 범위 내)</li>
                </ul>
              </section>

              <section className="space-y-3">
                <SectionTitle>9. 만 14세 미만 아동의 개인정보 처리 제한</SectionTitle>
                <p>본 서비스는 만 14세 미만 아동을 대상으로 하지 않습니다.</p>
                <p>
                  서비스는 만 14세 미만 아동의 개인정보를 수집하지 않으며, 만 14세 미만 아동의 정보가 수집된 사실을
                  인지한 경우 지체 없이 삭제 등 필요한 조치를 합니다.
                </p>
              </section>

              <section className="space-y-3">
                <SectionTitle>10. 개인정보 보호책임자</SectionTitle>
                <p>운영자: 이시욱</p>
                <p>문의 이메일: dltldnr11@gmail.com</p>
              </section>

              <section className="space-y-3">
                <SectionTitle>11. 개인정보처리방침의 변경</SectionTitle>
                <p>본 개인정보처리방침은 법령 또는 서비스 내용 변경에 따라 수정될 수 있습니다.</p>
                <p>변경 사항은 서비스 내 공지 또는 본 페이지를 통해 안내합니다.</p>
                <p className="text-muted-foreground">시행일: 2025년 12월 28일</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


