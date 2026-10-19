import React from 'react';
import { Users, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserDropdown from './UserDropdown';
import kiraLogo from '../../logo.jpeg';
import collegeLogo from '../../image.png';

export default function LandingNavbar({
  onNavigateToAuth,
  onNavigateToLab,
  onOpenProfile,
  onNavigateToHome,
  onNavigateToCurriculum,
  currentView = 'landing'
}) {
  const { user } = useAuth();

  const handleSignInClick = () => {
    if (onNavigateToAuth) onNavigateToAuth('login');
    else window.location.hash = 'login';
  };

  const handleBrandClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onNavigateToHome) onNavigateToHome();
    else window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e, section) => {
    if (e && e.preventDefault) e.preventDefault();
    if (currentView === 'landing') {
      if (onNavigateToCurriculum) onNavigateToCurriculum(section);
      else window.location.hash = `#${section}`;
    } else {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      if (window.history?.replaceState) window.history.replaceState(null, '', `#${section}`);
    }
  };

  const navLink = (label, section) => (
    <a
      key={section}
      href={`#${section}`}
      onClick={(e) => handleNavClick(e, section)}
      className={`text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg cursor-pointer ${
        currentView === 'curriculum' && document?.location?.hash === `#${section}`
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
      }`}
    >
      {label}
    </a>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Brand: 1) KIRA logo, 2) KIRA name & text, 3) VESIT logo */}
          <div
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 cursor-pointer group"
            title="KIRA Lab — Home"
          >
            {/* 1. KIRA Logo */}
            <img
              src={kiraLogo}
              alt="KIRA Lab Logo"
              className="w-8 h-8 rounded-lg object-contain shadow-xs group-hover:scale-105 transition-transform border border-slate-100"
            />

            {/* 2. KIRA Name and Text */}
            <div>
              <p className="text-sm font-extrabold text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
                KIRA Lab
              </p>
              <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                Knowledge Graph &amp; IR Analytics · GOLC 2027
              </p>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* 3. VESIT Logo */}
            <img
              src={collegeLogo}
              alt="VESIT College Logo"
              className="h-7 w-auto object-contain opacity-90 hidden sm:block group-hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleBrandClick}
              className={`text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg cursor-pointer ${
                currentView === 'landing'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Home
            </button>
            {navLink('Experiments', 'catalog')}
            {navLink('Tracks', 'tracks')}
            <a
              href="#team"
              onClick={(e) => handleNavClick(e, 'team')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              Team
            </a>
          </nav>

          {/* Auth */}
          {user ? (
            <UserDropdown onNavigateToLab={onNavigateToLab} onOpenProfile={onOpenProfile} />
          ) : (
            <button
              type="button"
              onClick={handleSignInClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-semibold shadow-sm hover:shadow-md hover:-translate-y-px transition-all cursor-pointer shrink-0"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#6d28d9)' }}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
