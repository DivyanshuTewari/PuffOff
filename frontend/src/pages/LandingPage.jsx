import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Clock, DollarSign, Heart, Shield, BookOpen, ArrowRight, CheckCircle, TrendingUp, Zap, CalendarDays, Banknote, Users, Target } from 'lucide-react';

const features = [
  { icon: Clock, title: 'Real-time Clean Timer', desc: 'Track exact days, hours, minutes, and seconds since your last relapse — live.', color: 'teal' },
  { icon: DollarSign, title: 'Financial Tracker', desc: 'Watch your savings grow in real time based on your previous daily spending.', color: 'green' },
  { icon: Heart, title: 'Health Milestones', desc: 'Discover what\'s healing in your body — from 20 minutes to 15 years clean.', color: 'purple' },
  { icon: Shield, title: 'Emergency Button', desc: 'One-click access to breathing exercises, motivational quotes, and crisis lines.', color: 'amber' },
  { icon: CheckCircle, title: 'Daily Check-ins', desc: 'Log your urge level (1–10), mood, and triggers every day to spot patterns.', color: 'blue' },
  { icon: BookOpen, title: 'Private Journal', desc: 'Write freely in a private, encrypted space. Your story, your growth.', color: 'violet' },
];

const cBg = { teal: 'from-teal-500/15 to-teal-600/5 border-teal-500/20', green: 'from-green-500/15 to-green-600/5 border-green-500/20', purple: 'from-purple-500/15 to-purple-600/5 border-purple-500/20', amber: 'from-amber-500/15 to-amber-600/5 border-amber-500/20', blue: 'from-blue-500/15 to-blue-600/5 border-blue-500/20', violet: 'from-violet-500/15 to-violet-600/5 border-violet-500/20' };
const cText = { teal: 'text-teal-400', green: 'text-green-400', purple: 'text-purple-400', amber: 'text-amber-400', blue: 'text-blue-400', violet: 'text-violet-400' };

const stats = [
  { val: '10K+', label: 'Days Tracked', icon: CalendarDays },
  { val: '$2M+', label: 'Money Saved', icon: Banknote },
  { val: '5K+', label: 'Lives Changed', icon: Users },
  { val: '7', label: 'Addiction Types', icon: Target },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function LandingPage() {
  return (
    <div className="min-h-screen mesh-bg">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Flame size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-gradient">PuffOff</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-outline text-sm py-2 px-5">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started <ArrowRight size={14} /></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
        <motion.div {...fadeUp(0)}>
          <span className="inline-flex items-center gap-2 badge bg-teal-500/15 border border-teal-500/25 text-teal-300 text-sm px-4 py-1.5 mb-6">
            <Zap size={13} className="text-teal-400" /> Your recovery journey starts now
          </span>
        </motion.div>
        <motion.h1 {...fadeUp(0.1)} className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
          Break Free From<br />
          <span className="text-gradient">Every Addiction</span>
        </motion.h1>
        <motion.p {...fadeUp(0.2)} className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          PuffOff helps you quit nicotine, alcohol, and other substances through real-time tracking,
          cognitive behavioral tools, and unwavering support.
        </motion.p>
        <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base py-3.5 px-8">
            Start Your Journey Free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-outline text-base py-3.5 px-8">
            Sign In
          </Link>
        </motion.div>

        {/* Floating badges */}
        <motion.div {...fadeUp(0.4)} className="flex flex-wrap justify-center gap-3 mt-10">
          {['No credit card', 'Completely private', '100% free', 'Multi-addiction support'].map(t => (
            <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle size={12} className="text-teal-400" /> {t}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ val, label, icon: Icon }, i) => (
            <motion.div key={label} {...fadeUp(0.1 * i)} className="glass text-center p-6">
              <div className="flex justify-center mb-2"><Icon size={28} className="text-teal-500/80" /></div>
              <div className="font-display font-black text-3xl text-gradient mb-1">{val}</div>
              <div className="text-slate-400 text-sm">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Everything you need to <span className="text-gradient">stay clean</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Science-backed tools designed around the psychology of addiction recovery.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} {...fadeUp(0.08 * i)}
              className={`glass-hover bg-gradient-to-br ${cBg[color]} border p-6`}>
              <div className={`mb-3 ${cText[color]}`}><Icon size={32} strokeWidth={1.5} /></div>
              <h3 className={`font-display font-bold text-xl text-white mb-2`}>{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <motion.div {...fadeUp(0)}
          className="glass bg-gradient-to-br from-teal-500/10 to-violet-500/10 border border-teal-500/20 p-12 text-center rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-violet-500/5" />
          <div className="relative z-10">
            <TrendingUp size={40} className="text-teal-400 mx-auto mb-4" />
            <h2 className="font-display font-black text-4xl text-white mb-4">
              One decision. <span className="text-gradient">A lifetime of freedom.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of people who chose to reclaim their health, wealth, and happiness.
            </p>
            <Link to="/register" className="btn-primary text-base py-3.5 px-10 mx-auto">
              Begin for Free <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame size={14} className="text-teal-400" />
          <span className="font-display font-bold text-teal-400">PuffOff</span>
        </div>
        <p>Built with 💙 to help you break free. Not a substitute for professional medical help.</p>
      </footer>
    </div>
  );
}
