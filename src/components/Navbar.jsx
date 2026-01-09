// import { Link, useLocation } from 'react-router-dom';
// import { Mail, User, Zap, LogOut } from 'lucide-react';
// import { supabase } from '../lib/supabase';
// import { motion } from 'framer-motion';

// export default function Navbar() {
//   const location = useLocation();

//   const navLinks = [
//     { path: '/', icon: Zap, label: 'Feed' },
//     { path: '/inbox', icon: Mail, label: 'Inbox' },
//     { path: '/profile', icon: User, label: 'Profile' },
//   ];

//   return (
//     <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
//       <div className="glass px-8 py-4 rounded-[2.5rem] flex items-center gap-10 border border-white/10 shadow-2xl relative">
//         {navLinks.map((link) => {
//           const isActive = location.pathname === link.path;
//           return (
//             <Link 
//               key={link.path}
//               to={link.path} 
//               className={`relative p-2 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}
//             >
//               <link.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
//               {isActive && (
//                 <motion.div 
//                   layoutId="nav-glow"
//                   className="absolute -inset-2 bg-cyan-500/10 blur-xl rounded-full -z-10"
//                 />
//               )}
//             </Link>
//           );
//         })}
        
//         <div className="w-[1px] h-6 bg-white/10 mx-2" />
        
//         <button 
//           onClick={() => supabase.auth.signOut()}
//           className="text-slate-500 hover:text-red-400 transition-colors p-2"
//         >
//           <LogOut size={24} />
//         </button>
//       </div>
//     </nav>
//   );
// }


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

