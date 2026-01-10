import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Pages
import AuthPage from './pages/AuthPage';
import ProfileSetup from './pages/ProfileSetup';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';

// Components
import Navbar from './components/Navbar';

export default function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 1. Initial session from Supabase (reads localStorage)
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      if (session?.user?.id) {
        await checkUserProfile(session.user.id);
      } else {
        setHasProfile(false);
        setChecking(false);
      }
    };

    initAuth();

    // 2. Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (nextSession?.user?.id) {
        checkUserProfile(nextSession.user.id);
      } else {
        setHasProfile(false);
        setChecking(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserProfile = async (id) => {
    const { data, error } = await supabase
      .from('skill_profiles')
      .select('id')
      .eq('id', id)
      .single();

    // If error is 406 (no row), data will be null – treat as "no profile yet"
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile', error.message);
    }

    setHasProfile(!!data);
    setChecking(false);
  };

  if (checking) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-slate-300 text-sm">Loading Skillr…</div>
      </div>
    );
  }

  // 1. Not logged in → Auth
  if (!session) {
    return <AuthPage />;
  }

  // 2. Logged in but no profile → Setup
  if (!hasProfile) {
    return <ProfileSetup session={session} />;
  }

  // 3. Fully authenticated → App routes
  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30">
        <div className="pb-32">
          <Routes>
            <Route path="/" element={<Dashboard session={session} />} />
            <Route path="/inbox" element={<Inbox session={session} />} />
            <Route path="/profile" element={<Profile session={session} />} />
            <Route path="/profile-setup" element={<ProfileSetup session={session} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Navbar />
      </div>
    </Router>
  );
}
