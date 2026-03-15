'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpenText, Copy, Mail, Send } from 'lucide-react';

const CONTACT_EMAIL = 'dltldnr11@gmail.com';

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [message, setMessage] = useState('');

  const mailPayload = useMemo(() => {
    const safeName = name.trim() || '방문자';
    const safeFrom = fromEmail.trim();
    const safeMessage = message.trim();

    const subject = `[AutoDiet 문의] ${safeName}`;
    const bodyLines = [
      `이름: ${safeName}`,
      safeFrom ? `이메일: ${safeFrom}` : '이메일: (미입력)',
      '',
      '문의 내용:',
      safeMessage || '(미입력)',
    ];
    const body = bodyLines.join('\n');

    return { subject, body };
  }, [name, fromEmail, message]);

  const mailtoHref = useMemo(() => {
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailPayload.subject)}&body=${encodeURIComponent(mailPayload.body)}`;
  }, [mailPayload]);

  const gmailComposeHref = useMemo(() => {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(
      mailPayload.subject
    )}&body=${encodeURIComponent(mailPayload.body)}`;
  }, [mailPayload]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      toast({ title: '복사 완료', description: '이메일 주소가 복사되었습니다.' });
    } catch {
      toast({
        title: '복사 실패',
        description: '브라우저에서 복사가 차단되었습니다. 이메일을 직접 선택해 복사해주세요.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyMessage = async () => {
    try {
      const text = `받는 사람: ${CONTACT_EMAIL}\n제목: ${mailPayload.subject}\n\n${mailPayload.body}`;
      await navigator.clipboard.writeText(text);
      toast({ title: '복사 완료', description: '문의 내용이 복사되었습니다. 메일/폼에 붙여넣어 보내세요.' });
    } catch {
      toast({
        title: '복사 실패',
        description: '브라우저에서 복사가 차단되었습니다. 내용을 직접 선택해 복사해주세요.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenGmail = () => {
    // Windows에서 mailto 핸들러가 없으면 오류가 자주 나서,
    // 브라우저에서 확실히 동작하는 Gmail 작성 화면을 기본 동작으로 제공합니다.
    window.open(gmailComposeHref, '_blank', 'noreferrer');
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Header logoHref="/">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            홈
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/blog">
            <BookOpenText className="w-4 h-4" />
            블로그
          </Link>
        </Button>
      </Header>

      <main className="container py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">문의</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>연락처</CardTitle>
            <CardDescription>아래 이메일로 문의하거나, 폼을 작성해 메일 앱으로 전송할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <a className="text-primary hover:underline break-all" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleCopyEmail}>
                  <Copy className="w-4 h-4" />
                  이메일 복사
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">이름</Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 이시욱"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">회신 이메일 (선택)</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="예: your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">문의 내용</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="문의 내용을 입력해주세요."
                className="min-h-[160px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" className="gap-2" onClick={handleCopyMessage}>
                <Copy className="w-4 h-4" />
                문의 내용 복사
              </Button>
              <Button type="button" className="gap-2" onClick={handleOpenGmail}>
                <Send className="w-4 h-4" />
                Gmail로 보내기
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


