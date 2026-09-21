import React from 'react';
import { Users, LogIn } from 'lucide-react';
import collegeLogo from '../../image.png';
import { useAuth } from '../../context/AuthContext';
import UserDropdown from './UserDropdown';

export default function LandingNavbar({ onNavigateToAuth, onNavigateToLab }) {
  const { user } = useAuth();

  const handleSignInClick = () => {
    if (onNavigateToAuth) {
      onNavigateToAuth('login');
    } else {
      window.location.hash = 'login';
    }
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/70 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 z-10">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 flex items-center justify-center shadow-md shadow-indigo-300/40 text-white font-bold text-sm sm:text-base">
              IR
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-tight truncate max-w-[135px] sm:max-w-[200px] md:max-w-none">
                IR & Knowledge Graphs Lab
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block">
                GOLC 2027 • Practical Curriculum & Simulation Suite
              </p>
            </div>
          </div>

          {/* Center: College Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none px-2">
            <a
              href="#team"
              title="Vivekanand Education Society's Institute of Technology (VESIT)"
              className="pointer-events-auto transition-transform hover:scale-105 inline-block"
            >
              <img
                src={collegeLogo}
                alt="VESIT College Logo"
                className="h-9 sm:h-12 md:h-14 w-auto max-w-[130px] sm:max-w-[220px] md:max-w-[280px] object-contain drop-shadow-xs"
              />
            </a>
          </div>

          {/* Right: Navigation links & Auth State */}
          <div className="flex items-center gap-1.5 sm:gap-3 z-10 shrink-0">
            <a
              href="#catalog"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100/70 hidden lg:inline-block"
            >
              Experiments
            </a>
            <a
              href="#tracks"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100/70 hidden sm:inline-block"
            >
              Tracks
            </a>
            <a
              href="#team"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/70 transition-colors px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1 hidden sm:flex"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team</span>
            </a>

            {/* Auth: User Dropdown or Sign In Button */}
            {user ? (
              <UserDropdown onNavigateToLab={onNavigateToLab} />
            ) : (
              <button
                type="button"
                onClick={handleSignInClick}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm hover:shadow-md shadow-indigo-200/50 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Student Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

