import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.user && !isLogin) {
        alert('Registration successful. Please sign in to Skillr.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_55%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 px-8 py-8 shadow-[0_22px_60px_rgba(15,23,42,0.9)]"
      >
        {/* Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950">
              <Zap className="h-5 w-5 text-slate-200" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Skillr
              </p>
              <h1 className="text-lg font-semibold text-slate-50">
                Learn faster with the right people
              </h1>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Sign in to match what you want to learn with people who can actually teach it.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-3 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/60"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-3 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/60"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Please wait…' : isLogin ? 'Sign in to Skillr' : 'Create Skillr account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? "Don't have a Skillr account yet?" : 'Already using Skillr?'}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-blue-400 hover:text-blue-300 font-medium"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
