import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '0.6rem',
        letterSpacing: '10px',
        textTransform: 'uppercase' as const,
        color: 'var(--ink-light)',
      }}>
        WORKBENCH
      </div>

      <Link to="/register" className="btn-landing" data-hoverable>
        Begin Your Practice
      </Link>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.65rem',
        color: 'var(--ink-light)',
        opacity: 0.4,
        letterSpacing: '2px',
        margin: 0,
      }}>
        Built with The Harsh Method · © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
