import { useEffect, useRef, type ReactNode } from 'react';

interface ChapterSectionProps {
  number: string;
  kanji: string;
  title: string;
  quote: string;
  quoteAuthor?: string;
  children?: ReactNode;
  crimsonWord?: string;
  bgImage?: string;      // Background image path
  featureImage?: string;  // Featured image path
}

/**
 * Editorial chapter section — matches the Yume/Dream poster tone.
 * Background image (very faded, monochrome), crimson center stripe,
 * large kanji, animated feature image, quote, and feature cards.
 */
export function ChapterSection({
  number,
  kanji,
  title,
  quote,
  quoteAuthor,
  children,
  crimsonWord,
  bgImage,
  featureImage,
}: ChapterSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = section.querySelectorAll('.reveal');
            reveals.forEach((el) => el.classList.add('reveal--visible'));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '-40px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Gentle floating animation for feature image
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    let frame: number;
    let start: number | null = null;

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) / 1000;
      const y = Math.sin(elapsed * 0.4) * 6;
      const rot = Math.sin(elapsed * 0.3) * 1;
      img.style.transform = `translateY(${y}px) rotate(${rot}deg)`;
      frame = requestAnimationFrame(animate);
    };

    // Only animate if not reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(frame);
  }, []);

  const renderTitle = () => {
    if (!crimsonWord) return title;
    const parts = title.split(new RegExp(`(${crimsonWord})`, 'i'));
    return parts.map((part, i) =>
      part.toLowerCase() === crimsonWord.toLowerCase() ? (
        <span key={i} style={{ color: 'var(--crimson)' }}>{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <section ref={sectionRef} className="chapter">
      {/* Background image — very faded */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          className="chapter-bg-image"
          loading="lazy"
          draggable={false}
          aria-hidden="true"
        />
      )}

      {/* Crimson center stripe */}
      <div className="chapter-stripe" aria-hidden="true" />

      {/* Kanji backdrop */}
      <div className="kanji reveal" aria-hidden="true">
        {kanji}
      </div>

      {/* Content */}
      <div className="chapter-content">
        <div className="chapter-number reveal reveal--delay-1">
          Chapter {number}
        </div>

        <h2 className="chapter-title reveal reveal--delay-2">
          {renderTitle()}
        </h2>

        <div className="zen-divider reveal reveal--delay-2" style={{ height: '32px' }} aria-hidden="true" />

        <blockquote className="chapter-quote reveal reveal--delay-3">
          "{quote}"
          {quoteAuthor && (
            <footer>— {quoteAuthor}</footer>
          )}
        </blockquote>

        {/* Feature image — floating animation */}
        {featureImage && (
          <div className="reveal reveal--delay-3" style={{ margin: '2rem auto' }}>
            <img
              ref={imgRef}
              src={featureImage}
              alt=""
              className="chapter-feature-img"
              loading="lazy"
              draggable={false}
            />
          </div>
        )}

        {/* Children (feature cards, CTA, etc.) */}
        {children && (
          <div className="reveal reveal--delay-4" style={{ width: '100%', marginTop: '1.5rem' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
