import { useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuthStore } from '../auth/store/useAuthStore';

import './landing.css';

import { WashiBackground } from './components/WashiBackground';
import { LandingNavbar } from './components/LandingNavbar';
import { CustomCursor } from './components/CustomCursor';
import { HeroSection } from './components/HeroSection';
import { ChapterSection } from './components/ChapterSection';
import { LandingFooter } from './components/LandingFooter';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const lenisRef = useRef<Lenis | null>(null);

  // Lenis smooth scrolling
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger to fix height calculations on mobile
    setTimeout(() => {
      ScrollTrigger.refresh();
      lenis.resize();
    }, 200);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleEnterClick = () => {
    if (lenisRef.current) {
      // Cinematic slow scroll through the gate animation
      lenisRef.current.scrollTo('#chapter-1', { 
        duration: 3.5, 
        easing: (t: number) => t * (2 - t) // easeOutQuad for a smooth decelerating camera fly-through
      });
    } else {
      const el = document.getElementById('chapter-1');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      <WashiBackground />
      <div id="global-pagoda-bg" className="global-pagoda-bg" aria-hidden="true" />
      <CustomCursor />
      <LandingNavbar onEnterClick={handleEnterClick} />

      {/* === HERO — Torii Gate & Katana Scroll Journey === */}
      <HeroSection />

      {/* === CHAPTER I — Sin === */}
      <div id="chapter-1">
        <ChapterSection
        number="I"
        kanji="罪"
        title="The Burden of Sin"
        crimsonWord="Sin"
        quote="Procrastination is the cardinal sin against your own potential. To conquer the world, you must first conquer your tasks."
      >
        <div className="features-grid">
          <div className="feature-card" data-hoverable>
            <h3>Smart Todos</h3>
            <p>Priority-based tasks with categories, due dates, and progress tracking.</p>
          </div>
          <div className="feature-card" data-hoverable>
            <h3>Task Mastery</h3>
            <p>Break down monumental goals into actionable steps. No objective is left to chance.</p>
          </div>
        </div>
      </ChapterSection>
      </div>

      {/* === CHAPTER II — Discipline === */}
      <ChapterSection
        number="II"
        kanji="道"
        title="The Path of Discipline"
        crimsonWord="Discipline"
        quote="Chaos is the enemy of greatness. True discipline requires mapping your time before it slips away."
      >
        <div className="features-grid">
          <div className="feature-card" data-hoverable>
            <h3>Day Planner</h3>
            <p>Dual-mode timeline & calendar. Organize each day with intention and structure.</p>
          </div>
          <div className="feature-card" data-hoverable>
            <h3>Time Blocking</h3>
            <p>Allocate specific, unbreakable blocks for deep work and strategic planning.</p>
          </div>
        </div>
      </ChapterSection>

      {/* === CHAPTER III — Pride === */}
      <ChapterSection
        number="III"
        kanji="誇"
        title="Forging Pride"
        crimsonWord="Pride"
        quote="True pride is not given; it is forged in the fires of unbroken focus and deep work."
      >
        <div className="features-grid">
          <div className="feature-card" data-hoverable>
            <h3>Focus Timer</h3>
            <p>Pomodoro-style sessions with stopwatch, countdown, and deep work tracking.</p>
          </div>
          <div className="feature-card" data-hoverable>
            <h3>Session History</h3>
            <p>Review your focus sessions. Understand your patterns. Improve daily.</p>
          </div>
        </div>
      </ChapterSection>

      {/* === CHAPTER IV — Wisdom === */}
      <ChapterSection
        number="IV"
        kanji="智"
        title="Seeking Wisdom"
        crimsonWord="Wisdom"
        quote="Wisdom is scattered across the ages. A true master collects, organizes, and reviews their knowledge."
      >
        <div className="features-grid">
          <div className="feature-card" data-hoverable>
            <h3>Link Vault</h3>
            <p>Save, categorize, and curate your knowledge resources in one sacred space.</p>
          </div>
          <div className="feature-card" data-hoverable>
            <h3>Knowledge Curation</h3>
            <p>Tag, search, and instantly retrieve your most critical information exactly when you need it.</p>
          </div>
        </div>
      </ChapterSection>

      {/* === CHAPTER V — Destiny === */}
      <ChapterSection
        number="V"
        kanji="運命"
        title="Choosing Destiny"
        crimsonWord="Destiny"
        quote="You are not a victim of circumstance. Track your growth, visualize your effort, and author your own fate."
      >
        <div className="features-grid">
          <div className="feature-card" data-hoverable>
            <h3>Statistics</h3>
            <p>Visualize your growth. Completion charts, focus analytics, and streaks.</p>
          </div>
          <div className="feature-card" data-hoverable>
            <h3>Unbreakable Chains</h3>
            <p>Watch your consistency forge a relentless chain of daily victories.</p>
          </div>
        </div>
      </ChapterSection>

      {/* Zen divider */}
      <div className="zen-divider" style={{ height: '60px' }} aria-hidden="true" />

      {/* === CHAPTER VI — Awakening === */}
      <ChapterSection
        number="VI"
        kanji="覚醒"
        title="The Awakening"
        crimsonWord="Awakening"
        quote="The tools are laid out before you. The path is clear. Are you ready to claim your destiny?"
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          marginTop: '2rem',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            color: 'var(--ink-light)',
            textAlign: 'center',
            maxWidth: '450px',
            lineHeight: 1.8,
            fontWeight: 300,
          }}>
            Your dojo awaits. A workspace crafted for the protagonist of this story—you. Refuse to be ordinary.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/register" className="btn-landing btn-landing--solid" data-hoverable>
              Enter the Dojo
            </Link>
            <button 
              onClick={() => {
                if (lenisRef.current) {
                  lenisRef.current.scrollTo(0, { 
                    duration: 3, 
                    easing: (t) => t * (2 - t) 
                  });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="btn-landing btn-landing--frosted" 
              data-hoverable
            >
              Return
            </button>
          </div>
        </div>
      </ChapterSection>

      {/* Breathing space */}
      <div style={{ height: '6vh' }} aria-hidden="true" />

      <LandingFooter />
    </div>
  );
}
