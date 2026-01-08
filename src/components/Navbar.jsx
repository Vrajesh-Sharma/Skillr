import { Link, useLocation } from 'react-router-dom';
import { Mail, User, Zap, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { path: '/', icon: Zap, label: 'Feed' },
    { path: '/inbox', icon: Mail, label: 'Inbox' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="glass px-8 py-4 rounded-[2.5rem] flex items-center gap-10 border border-white/10 shadow-2xl relative">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path}
              to={link.path} 
              className={`relative p-2 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}
            >
              <link.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute -inset-2 bg-cyan-500/10 blur-xl rounded-full -z-10"
                />
              )}
            </Link>
          );
        })}
        
        <div className="w-[1px] h-6 bg-white/10 mx-2" />
        
        <button 
          onClick={() => supabase.auth.signOut()}
          className="text-slate-500 hover:text-red-400 transition-colors p-2"
        >
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  );
}