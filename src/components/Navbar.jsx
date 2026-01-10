import { Link, useLocation } from 'react-router-dom';
import { Mail, User, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { path: '/', icon: Zap, label: 'Feed' },
    { path: '/inbox', icon: Mail, label: 'Inbox' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-6 rounded-full border border-slate-800 bg-slate-900/90 px-6 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.9)]">
        <div className="flex items-center gap-4">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === '/' && location.pathname === '');
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative flex flex-col items-center gap-1 px-2"
              >
                <div className="relative flex h-8 w-8 items-center justify-center">
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-slate-700/40"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <link.icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-slate-50' : 'text-slate-400'
                    }`}
                    strokeWidth={2}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? 'text-slate-50' : 'text-slate-500'
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

