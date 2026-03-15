import { Utensils } from 'lucide-react';
import { ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
  onLogoClick?: () => void;
  logoHref?: string;
}

export function Header({ children, onLogoClick, logoHref }: HeaderProps) {
  const LogoWrapper: React.ElementType = logoHref ? "a" : "div";
  const logoWrapperProps = logoHref
    ? { href: logoHref }
    : { onClick: onLogoClick };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      {/*
        모바일에서 로고가 너무 안쪽으로 들어가 보이지 않도록 좌우 패딩을 줄였습니다.
        (sm 이상에서는 기존 여백을 유지)
      */}
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
        <LogoWrapper
          {...logoWrapperProps}
          className="flex items-center gap-1.5 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary shadow-soft">
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div>
            {/* 모바일에서는 타이틀도 약간 줄여 오른쪽 메뉴 공간을 확보 */}
            <h1 className="font-bold text-sm sm:text-lg tracking-tight leading-none">AutoDiet</h1>
            <p className="hidden sm:block text-xs text-muted-foreground">식단 자동 생성 시스템</p>
          </div>
        </LogoWrapper>

        <div
          className="
            flex items-center gap-1 sm:gap-2

            /* 모바일에서 글자가 너무 작고 흐리게 보이는 문제를 방지 */
            [&_button]:h-9 [&_a]:h-9
            [&_button]:px-2 [&_a]:px-2
            [&_button]:text-xs [&_a]:text-xs
            [&_button]:text-foreground/90 [&_a]:text-foreground/90
            [&_button]:whitespace-nowrap [&_a]:whitespace-nowrap
            [&_svg]:w-3.5 [&_svg]:h-3.5

            sm:[&_button]:h-9 sm:[&_a]:h-9
            sm:[&_button]:px-3 sm:[&_a]:px-3
            sm:[&_button]:text-sm sm:[&_a]:text-sm
            sm:[&_svg]:w-4 sm:[&_svg]:h-4
          "
        >
          {children}
        </div>
      </div>
    </header>
  );
}