interface KatanaProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Hand-crafted Katana SVG with sumi-e ink-brush aesthetic.
 * Vertical orientation: blade pointing up, handle at bottom.
 * Includes blade, guard (tsuba), handle (tsuka), wrapping, and tassel.
 */
export function Katana({ className = '', style }: KatanaProps) {
  return (
    <svg
      viewBox="0 0 80 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Japanese Katana Sword"
    >
      <defs>
        {/* Subtle metallic gradient for the blade */}
        <linearGradient id="blade-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="30%" stopColor="#444444" />
          <stop offset="50%" stopColor="#555555" />
          <stop offset="70%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>

        {/* Hamon (temper line) pattern */}
        <linearGradient id="hamon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="40%" stopColor="transparent" />
          <stop offset="50%" stopColor="rgba(200,200,200,0.15)" />
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        {/* Ink-brush displacement for organic feel */}
        <filter id="katana-rough" x="-1%" y="-1%" width="102%" height="102%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.05"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      <g filter="url(#katana-rough)">
        {/* === BLADE (Toshin) === */}
        {/* Main blade — slight curve (sori), tapering to kissaki (tip) */}
        <path
          d="M 40 10
             Q 39 8, 40 4
             L 41 4
             Q 42 8, 41 10
             L 44 60
             Q 45 120, 45 200
             L 45 340
             Q 45 350, 44 355
             L 37 355
             Q 36 350, 36 340
             L 36 200
             Q 36 120, 37 60
             Z"
          fill="url(#blade-metal)"
        />

        {/* Hamon line (temper pattern) — wavy line along the blade */}
        <path
          d="M 38 40
             Q 42 80, 39 120
             Q 43 160, 39 200
             Q 43 240, 39 280
             Q 42 320, 40 350"
          stroke="rgba(180,180,180,0.12)"
          strokeWidth="3"
          fill="none"
        />

        {/* Blade spine highlight (shinogi) */}
        <line
          x1="40.5" y1="15" x2="40.5" y2="350"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />

        {/* === GUARD (Tsuba) === */}
        {/* Round tsuba with slight organic shape */}
        <ellipse
          cx="40" cy="370"
          rx="18" ry="10"
          fill="#1a1a1a"
          stroke="#2a2a2a"
          strokeWidth="1"
        />
        {/* Tsuba decorative cutout */}
        <ellipse
          cx="40" cy="370"
          rx="6" ry="3"
          fill="#111111"
          stroke="#333333"
          strokeWidth="0.5"
        />

        {/* === HANDLE (Tsuka) === */}
        {/* Handle base shape */}
        <rect
          x="34" y="378" width="12" height="130"
          rx="3"
          fill="#1a1a1a"
        />

        {/* Handle wrapping (tsuka-ito) — diamond pattern */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <g key={i}>
            <line
              x1="34" y1={385 + i * 13}
              x2="46" y2={391 + i * 13}
              stroke="#333"
              strokeWidth="1.5"
            />
            <line
              x1="46" y1={385 + i * 13}
              x2="34" y2={391 + i * 13}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* Pommel (Kashira) */}
        <rect
          x="33" y="506" width="14" height="8"
          rx="3"
          fill="#1a1a1a"
        />

        {/* === TASSEL === */}
        <path
          d="M 40 514
             Q 40 525, 38 535
             Q 36 545, 37 558"
          stroke="#8A1010"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className="katana-tassel"
        />
        <path
          d="M 40 514
             Q 41 525, 43 535
             Q 45 545, 44 558"
          stroke="#8A1010"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className="katana-tassel"
        />
        {/* Tassel knot */}
        <circle cx="40" cy="514" r="2.5" fill="#8A1010" />

        {/* Small tassel ends */}
        <line x1="37" y1="558" x2="36" y2="568" stroke="#8A1010" strokeWidth="1" strokeLinecap="round" />
        <line x1="44" y1="558" x2="45" y2="568" stroke="#8A1010" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Ink stroke path (for scroll-driven painting animation) */}
      <path
        id="katana-ink-path"
        d="M 44 355 L 45 200 Q 45 120, 44 60 L 40 10"
        stroke="none"
        fill="none"
        className="ink-stroke"
      />
    </svg>
  );
}
