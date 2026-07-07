import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

/**
 * Minimal transparent navbar.
 * Auto-hides on scroll down, reappears on scroll up.
 * Becomes frosted glass when scrolled past threshold.
 */
interface LandingNavbarProps {
  onEnterClick?: () => void;
}

export function LandingNavbar({ onEnterClick }: LandingNavbarProps = {}) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const onScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;

    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const direction = currentY > lastScrollY.current ? 'down' : 'up';
      const delta = Math.abs(currentY - lastScrollY.current);

      if (delta > 5) {
        setHidden(direction === 'down' && currentY > 100);
        lastScrollY.current = currentY;
      }

      setScrolled(currentY > 50);
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <nav
      className={`landing-nav ${hidden ? 'landing-nav--hidden' : ''} ${scrolled ? 'landing-nav--scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <Link to="/welcome" className="nav-brand" data-hoverable>
        WORKBENCH
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/login" className="btn-landing btn-landing--ghost" data-hoverable>
          Sign In
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (onEnterClick) {
              onEnterClick();
            } else {
              const el = document.getElementById('chapter-1');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollBy({ top: window.innerHeight * 2.5, behavior: 'smooth' });
              }
            }
          }}
          className="btn-landing btn-landing--solid"
          data-hoverable
        >
          Enter
        </button>
      </div>
    </nav>
  );
}
