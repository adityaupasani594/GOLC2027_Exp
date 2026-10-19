import React from 'react';
import collegeLogo from '../../image.png';
import kiraLogo from '../../logo.jpeg';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-sm py-7">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: brand */}
          <div className="flex items-center gap-3">
            <img src={kiraLogo} alt="KIRA" className="w-7 h-7 object-contain rounded-md shadow-xs" />

            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">KIRA Lab</p>
              <p className="text-[10px] text-slate-400 leading-tight">
                Knowledge Graph &amp; Information Retrieval Analytics Lab
              </p>
            </div>
          </div>

          {/* Center: institution */}
          <div className="flex items-center gap-2.5 order-3 sm:order-2">
            <img src={collegeLogo} alt="VESIT" className="h-7 w-auto object-contain opacity-80" />
            <div className="text-[10px] text-slate-500 leading-snug text-left hidden sm:block">
              <p className="font-semibold text-slate-700">Dept. of Computer Engineering, VESIT</p>
              <p>GOLC 2027 Curriculum • 2027 Batch</p>
            </div>
          </div>

          {/* Right: copyright */}
          <p className="text-[10px] text-slate-400 order-2 sm:order-3">
            Academic Year 2026–27
          </p>
        </div>
      </div>
    </footer>
  );
}
