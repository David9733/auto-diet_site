'use client';

import { useEffect, useRef, useMemo, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom'
}: ScrollRevealProps) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    const words = text.split(' ');
    return words.map((word, index) => (
      <span key={index}>
        <span className="word">{word}</span>
        {index < words.length - 1 && ' '}
      </span>
    ));
  }, [children]);

  // 초기 마운트 시 ScrollTrigger 새로고침
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === 'undefined') return;

    // ScrollTrigger 강제 새로고침
    ScrollTrigger.refresh();

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    // 컨테이너 회전 애니메이션
    const rotationTween = gsap.fromTo(
      el,
      { transformOrigin: '0% 50%', rotate: baseRotation },
      {
        ease: 'none',
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom',
          end: rotationEnd,
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    );

    const wordElements = el.querySelectorAll('.word');

    // 단어 opacity 애니메이션
    const opacityTween = gsap.fromTo(
      wordElements,
      { opacity: baseOpacity, willChange: 'opacity' },
      {
        ease: 'none',
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom-=15%',
          end: wordAnimationEnd,
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    );

    // 블러 애니메이션
    let blurTween;
    if (enableBlur) {
      blurTween = gsap.fromTo(
        wordElements,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: 'none',
          filter: 'blur(0px)',
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=15%',
            end: wordAnimationEnd,
            scrub: 1,
            invalidateOnRefresh: true
          }
        }
      );
    }

    // cleanup
    return () => {
      rotationTween?.kill();
      opacityTween?.kill();
      blurTween?.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === el) {
          trigger.kill();
        }
      });
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;

