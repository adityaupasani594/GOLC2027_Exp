import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogOut,
  ChevronDown,
  Award,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserDropdown({ onNavigateToLab, onOpenProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, progress, certificates } = useAuth();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'ST';
  const completedCount = progress?.completedExperiments?.length || 0;
  const certsCount = certificates ? Object.keys(certificates).length : 0;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/80 hover:bg-white border border-indigo-100 shadow-xs hover:shadow transition-all cursor-pointer group"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-7 h-7 rounded-full object-cover border border-indigo-200"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
            {initials}
          </div>
        )}

        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors truncate max-w-[110px]">
            {user.firstName || user.displayName}
          </p>
          <p className="text-[10px] text-slate-500 font-medium leading-none">
            Student
          </p>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-2 z-50 text-slate-800"
          >
            {/* Header info */}
            <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Active Lab Session
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">
                {user.displayName || `${user.firstName} ${user.lastName}`}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              <p className="text-[10px] text-indigo-600 font-medium mt-1 truncate">
                {user.institution || "Virtual Laboratory"}
              </p>
            </div>

            {/* Progress Badge Card */}
            <div className="px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100/80 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-[11px] font-semibold text-indigo-950">Curriculum Progress</p>
                  <p className="text-[10px] text-indigo-600 font-medium">{completedCount} of 15 Experiments</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md shadow-xs">
                {Math.round((completedCount / 15) * 100)}%
              </span>
            </div>

            {/* Quick Actions */}
            {onNavigateToLab && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToLab(15);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer text-left mb-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Launch Experiment 15 (Active)</span>
              </button>
            )}

            {/* View Profile Button — Placed Directly Above Sign Out */}
            <div className="pt-1 mt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenProfile) {
                    onOpenProfile();
                  } else {
                    window.location.hash = 'profile';
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/90 transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span>View Student Profile</span>
                </div>
                <span className="text-[10px] bg-white text-indigo-700 font-bold px-1.5 py-0.5 rounded shadow-2xs">
                  {certsCount} {certsCount === 1 ? 'Cert' : 'Certs'}
                </span>
              </button>
            </div>

            {/* Logout Button */}
            <div className="pt-1 mt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={async () => {
                  setIsOpen(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Lab</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
