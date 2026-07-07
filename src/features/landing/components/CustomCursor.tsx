import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom cursor — small circle with thin outline.
 * Becomes crimson on hoverable elements.
 * Hidden on touch devices.
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const isHovering = useRef(false);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const animate = useCallback(() => {
    pos.current.x = lerp(pos.current.x, target.current.x, 0.15);
    pos.current.y = lerp(pos.current.y, target.current.y, 0.15);

    if (cursorRef.current) {
      cursorRef.current.style.left = `${pos.current.x}px`;
      cursorRef.current.style.top = `${pos.current.y}px`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Don't initialize on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const onMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const hoverable = el.closest('[data-hoverable], a, button');
      if (hoverable) {
        isHovering.current = true;
        cursorRef.current?.classList.add('custom-cursor--hover');
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const hoverable = el.closest('[data-hoverable], a, button');
      if (hoverable) {
        isHovering.current = false;
        cursorRef.current?.classList.remove('custom-cursor--hover');
      }
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />;
}
