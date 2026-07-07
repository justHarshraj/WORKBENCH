interface ToriiGateProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Hand-crafted Torii Gate SVG with sumi-e ink-brush aesthetic.
 * Monochrome black, organic edges, traditional proportions.
 */
export function ToriiGate({ className = '', style }: ToriiGateProps) {
  return (
    <svg
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Traditional Japanese Torii Gate"
    >
      {/* Rough edge filter for ink-brush feel */}
      <defs>
        <filter id="torii-rough" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.04"
            numOctaves="4"
            seed="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      <g filter="url(#torii-rough)">
        {/* Top beam (Kasagi) — the uppermost horizontal beam, slightly curved */}
        <path
          d="M 30 60 
             Q 35 48, 200 45 
             Q 365 48, 370 60 
             L 380 70 
             Q 365 63, 200 60 
             Q 35 63, 20 70 Z"
          fill="#111111"
        />

        {/* Second beam (Nuki) — horizontal beam below kasagi */}
        <rect x="65" y="105" width="270" height="14" rx="1" fill="#111111" />

        {/* Support blocks (Kusabi) — small wedges between beams and pillars */}
        <rect x="98" y="74" width="16" height="31" rx="1" fill="#111111" />
        <rect x="286" y="74" width="16" height="31" rx="1" fill="#111111" />

        {/* Left pillar (Hashira) */}
        <path
          d="M 90 70 
             L 86 490 
             L 80 495 
             L 80 500 
             L 130 500 
             L 130 495 
             L 124 490 
             L 120 70 Z"
          fill="#111111"
        />

        {/* Right pillar (Hashira) */}
        <path
          d="M 280 70 
             L 276 490 
             L 270 495 
             L 270 500 
             L 320 500 
             L 320 495 
             L 314 490 
             L 310 70 Z"
          fill="#111111"
        />

        {/* Central name plate (Gakuzuka) */}
        <rect x="175" y="80" width="50" height="35" rx="2" fill="#111111" />

        {/* Inner character suggestion — a simple zen circle (enso) */}
        <circle
          cx="200"
          cy="97"
          r="9"
          stroke="#F5F2EC"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}
