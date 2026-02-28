import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, User } from 'lucide-react';

// Map icon names from XML to actual Lucide icon components
const ICON_MAP = {
  'Zap': Zap,
  'Mail': Mail,
  'User': User
};

export default function XMLNavbar({ unreadCount = 0 }) {
  const location = useLocation();
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch XML file from public folder
    fetch('/navbar-component.xml')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load XML file');
        }
        return response.text();
      })
      .then(xmlString => {
        // Parse XML string into DOM
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
          throw new Error('XML parsing error');
        }
        
        // Extract navItem elements and convert to JavaScript objects
        const items = Array.from(xmlDoc.getElementsByTagName('navItem')).map(item => ({
          id: item.getAttribute('id'),
          path: item.getElementsByTagName('path')[0].textContent,
          label: item.getElementsByTagName('label')[0].textContent,
          icon: item.getElementsByTagName('icon')[0].textContent,
          active: item.getAttribute('active') === 'true'
        }));
        
        console.log('✅ Loaded navigation from XML:', items);
        setNavItems(items);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error loading XML:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Show nothing while loading
  if (loading) {
    return (
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="rounded-full border border-slate-800 bg-slate-900/90 px-6 py-3">
          <span className="text-xs text-slate-400">Loading navigation...</span>
        </div>
      </nav>
    );
  }

  // Show error message if XML failed to load
  if (error) {
    return (
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="rounded-full border border-red-800 bg-red-900/30 px-6 py-3">
          <span className="text-xs text-red-400">XML Load Error: {error}</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-6 rounded-full border border-slate-800 bg-slate-900/90 px-6 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.9)]">
        <div className="flex items-center gap-4">
          {navItems.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === '/' && location.pathname === '');
            
            // Get the icon component from our map
            const IconComponent = ICON_MAP[link.icon];
            
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
                  {IconComponent && (
                    <IconComponent
                      className={`h-4 w-4 ${
                        isActive ? 'text-slate-50' : 'text-slate-400'
                      }`}
                      strokeWidth={2}
                    />
                  )}
                  
                  {/* Notification Badge: Only shows for Inbox if unreadCount > 0 */}
                  {link.label === 'Inbox' && unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                  )}
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