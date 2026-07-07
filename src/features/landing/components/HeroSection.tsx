import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Cinematic hero — editorial poster style.
 * 
 * Layout: Shrine door (Torii gate) centered with a red stripe.
 * On scroll: camera zooms massively INTO the gate (entering the shrine).
 */
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<HTMLDivElement>(null);
  const toriiRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const toriiWrapperRef = useRef<HTMLDivElement>(null);
  const stripeWrapperRef = useRef<HTMLDivElement>(null);

  const petals = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    delay: `${3 + i * 5}s`,
    drift: `${(Math.random() - 0.5) * 160}px`,
  })), []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current!;
      const scene = sceneRef.current!;
      const stripe = stripeRef.current!;
      const torii = toriiRef.current!;
      const heading = headingRef.current!;
      const label = labelRef.current!;
      const subtitle = subtitleRef.current!;
      const scrollInd = scrollIndRef.current!;
      const divider = dividerRef.current!;

      const textLayer = textLayerRef.current!;
      const toriiWrapper = toriiWrapperRef.current!;
      const stripeWrapper = stripeWrapperRef.current!;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        gsap.set([torii, stripe, label, heading, subtitle], { opacity: 1 });
        return;
      }

      // Initial hidden states
      gsap.set(divider, { opacity: 0, scaleY: 0 });
      gsap.set(torii, { opacity: 0, scale: 0.95 });

      // --- Entrance timeline ---
      const enter = gsap.timeline();
      enter
        .fromTo(stripe, { opacity: 0, scaleY: 0.2 }, { opacity: 0.15, scaleY: 1, duration: 2.2, ease: 'power2.out' })
        .to(torii, { opacity: 1, scale: 1, duration: 2.5, ease: 'power2.out' }, '-=1.5')
        .fromTo(label, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=2')
        .fromTo(heading, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, '-=1.5')
        .fromTo(subtitle, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' }, '-=1')
        .fromTo(scrollInd, { opacity: 0 }, { opacity: 0.35, duration: 0.6 }, '-=0.3');

      // --- Scroll timeline ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: scene,
          pinSpacing: false,
          anticipatePin: 1,
        },
      });

      // We explicitly use fromTo with immediateRender: false for ALL scroll animations
      // This guarantees perfect restoring of values when scrolling backwards

      // Phase 1: Text layer dissolves and gets pulled into the gate
      tl.fromTo(textLayer,
        { opacity: 1, scale: 1, filter: 'blur(0px)' },
        { opacity: 0, scale: 1.5, filter: 'blur(10px)', duration: 12, ease: 'power2.in' },
        0 // Start dissolving text immediately
      );
      tl.fromTo(scrollInd,
        { opacity: 1 },
        { opacity: 0, duration: 4, ease: 'power1.in' },
        0
      );

      // Phase 2: ENTERING THE SHRINE - massive zoom on wrappers
      // Using power3.in makes it feel like we are accelerating INTO the gate (constant forward motion)
      tl.fromTo(toriiWrapper,
        { scale: 1 },
        { scale: 40, duration: 30, ease: 'power3.in' },
        2
      );
      tl.fromTo(stripeWrapper,
        { scaleX: 1, scaleY: 1, opacity: 1 },
        { scaleX: 12, scaleY: 2, opacity: 0, duration: 30, ease: 'power3.in' },
        2
      );

      // Phase 3: The new world emerges (Fade in global background AS we zoom)
      const globalPagodaBg = document.getElementById('global-pagoda-bg');
      if (globalPagodaBg) {
        tl.fromTo(globalPagodaBg,
          { opacity: 0 },
          { opacity: 0.25, duration: 25, ease: 'power2.inOut' },
          12 // Starts appearing through the gate
        );
      }

      // Phase 4: Gate passes the camera completely
      tl.fromTo(toriiWrapper,
        { opacity: 1, filter: 'blur(0px)' },
        { opacity: 0, filter: 'blur(30px)', duration: 8, ease: 'power2.in' },
        26
      );

      // Phase 5: Seamlessly fade in the divider right after the gate passes
      tl.fromTo(divider, 
        { opacity: 0, scaleY: 0 }, 
        { opacity: 1, scaleY: 1, duration: 15, ease: 'power2.out' }, 
        30
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="hero-container">
      <div ref={sceneRef} className="hero-scene">
        {/* Crimson stripe */}
        <div ref={stripeWrapperRef} className="hero-stripe-wrapper">
          <div ref={stripeRef} className="hero-stripe" />
        </div>

        {/* Torii gate image — TOP HALF */}
        <div ref={toriiWrapperRef} className="hero-torii-wrapper">
          <img
            ref={toriiRef}
            src="/landing/torii-gate.png"
            alt="Torii Gate"
            className="hero-torii"
            style={{ opacity: 0 }}
            draggable={false}
          />
        </div>

        {/* ---- TEXT LAYER ---- */}
        <div className="hero-text-layer" ref={textLayerRef}>
          <div ref={labelRef} className="hero-label" style={{ opacity: 0 }}>
            A sacred space for those who seek mastery through discipline.
          </div>

          <div ref={headingRef} className="hero-heading" style={{ opacity: 0 }}>
            <h1>
              <span className="word-master">Master</span>
              <span className="word-your">Your</span>
              <span className="word-mind" style={{ color: 'var(--crimson)' }}>Mind.</span>
            </h1>
            <p ref={subtitleRef} className="subtitle" style={{ opacity: 0 }}>
              Discipline Creates Freedom.
            </p>
          </div>
        </div>

        {/* Scroll */}
        <div ref={scrollIndRef} className="scroll-indicator" style={{ opacity: 0 }}>
          <span>Scroll</span>
        </div>

        {/* Petals */}
        {petals.map((p) => (
          <div
            key={p.id}
            className="petal"
            aria-hidden="true"
            style={{ left: p.left, top: '-20px', animationDelay: p.delay, '--petal-drift': p.drift } as React.CSSProperties}
          />
        ))}

        {/* Divider */}
        <div
          ref={dividerRef}
          className="zen-divider"
          style={{ position: 'absolute', bottom: 0, height: '80px', transformOrigin: 'top center' }}
        />
      </div>
    </div>
  );
}
