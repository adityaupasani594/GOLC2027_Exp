import React from 'react';
import collegeLogo from '../../image.png';

export default function Footer() {
  return (
    <footer className="glass border-t border-white/80 py-10 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-center">
          <img
            src={collegeLogo}
            alt="VESIT College Logo"
            className="h-10 sm:h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="flex items-center justify-center gap-2 font-bold text-slate-800 text-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>Information Retrieval & Knowledge Graphs Virtual Laboratory</span>
        </div>
        <p className="text-slate-600 font-medium">
          Department of Computer Engineering • Vivekanand Education Society's Institute of Technology (VESIT)
        </p>
        <p className="text-slate-400 text-[11px]">
          GOLC 2027 Curriculum Standards • 15 Prescribed Experiments • Contributed by the 2027 Batch
        </p>
      </div>
    </footer>
  );
}
