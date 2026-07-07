import { Link, Navigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { 
  Calendar, CheckSquare, Timer, Link as LinkIcon, BarChart2, 
  ArrowRight, Zap, Shield, Sparkles 
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useAuthStore } from '../auth/store/useAuthStore';

const features = [
  {
    icon: Calendar,
    title: 'Day Planner',
    description: 'Dual-mode timeline & calendar view. Organize your day with drag-and-drop events.',
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: CheckSquare,
    title: 'Smart Todos',
    description: 'Priority-based task management with categories, due dates, and progress tracking.',
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
  },
  {
    icon: Timer,
    title: 'Focus Timer',
    description: 'Pomodoro-style focus sessions with stopwatch, countdown, and session history.',
    color: 'from-accent/20 to-accent/5',
    iconColor: 'text-accent',
    borderColor: 'border-accent/20',
  },
  {
    icon: LinkIcon,
    title: 'Link Vault',
    description: 'Save, categorize, and organize your important links and resources.',
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: BarChart2,
    title: 'Statistics',
    description: 'Visualize your productivity with completion charts and focus time analytics.',
    color: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: Shield,
    title: 'Secure & Personal',
    description: 'Your data is yours. Authenticated accounts with encrypted storage.',
    color: 'from-rose-500/20 to-rose-600/5',
    iconColor: 'text-rose-400',
    borderColor: 'border-rose-500/20',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function LandingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-main overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-bg-app/80 backdrop-blur-xl border-b border-border-subtle/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-text-main scale-125 flex-shrink-0" style={{ WebkitMaskImage: `url(${logoImg})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${logoImg})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-main to-text-muted">
              WORKBENCH
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 relative">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Your Personal Productivity OS
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-text-main via-text-main to-text-muted">
              Master Your Day.
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-rose-400 to-blue-400">
              Own Your Time.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed mb-10">
            WORKBENCH brings together a day planner, smart todos, focus timer, link vault, and analytics — 
            all in one beautifully crafted workspace designed for deep work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group px-8 py-3.5 text-base font-semibold bg-accent text-white rounded-2xl hover:bg-accent-hover transition-all shadow-xl shadow-accent/25 hover:shadow-accent/35 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start Building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 text-base font-medium bg-bg-card text-text-main rounded-2xl border border-border-subtle hover:border-text-muted transition-colors w-full sm:w-auto text-center"
            >
              I Have an Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-card border border-border-subtle text-text-muted text-xs font-medium uppercase tracking-wider mb-4">
              <Zap className="w-3 h-3 text-accent" />
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-main mb-4">
              Everything You Need to
              <span className="text-accent"> Focus</span>
            </h2>
            <p className="text-text-muted max-w-lg mx-auto">
              Six powerful modules, one unified workspace. Built for people who take their productivity seriously.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={`group relative bg-bg-card rounded-2xl border ${feature.borderColor} p-6 hover:border-text-muted/30 transition-all duration-300 overflow-hidden`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-bg-app border border-border-subtle flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="bg-bg-card rounded-3xl border border-border-subtle p-10 md:p-14 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main mb-4">
                Ready to Build Your Routine?
              </h2>
              <p className="text-text-muted mb-8 max-w-md mx-auto">
                Join WORKBENCH and start organizing your days, tracking your focus, and achieving your goals.
              </p>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-accent text-white rounded-2xl hover:bg-accent-hover transition-all shadow-xl shadow-accent/25"
              >
                Get Started — It's Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-text-main scale-125 flex-shrink-0" style={{ WebkitMaskImage: `url(${logoImg})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${logoImg})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
            <span className="text-sm font-semibold text-text-muted">WORKBENCH</span>
          </div>
          <p className="text-xs text-text-muted">
            Built with The Harsh Method · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
