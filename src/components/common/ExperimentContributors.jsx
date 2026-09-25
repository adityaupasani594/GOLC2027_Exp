import React from 'react';
import { Users } from 'lucide-react';
import { getContributors } from '../../data/contributorsData';

/**
 * ExperimentContributors
 * Displays the student and developer contributor credits for an experiment at the bottom of the Theory page.
 */
export default function ExperimentContributors({ expNumber, className = '' }) {
  const contributors = getContributors(expNumber);
  if (!contributors || contributors.length === 0) return null;

  return (
    <div className={`mt-10 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Experiment Contributors & Development Team
            </h2>
            <p className="text-xs text-indigo-200/70 font-mono">
              Academic & Technical Implementation · KIRA Virtual Laboratory (GOLC 2027)
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10">
          {contributors.length} {contributors.length === 1 ? 'Contributor' : 'Contributors'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5 pt-2">
        {contributors.map((name, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-slate-100 transition-colors shadow-2xs"
          >
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-[10px] font-bold flex items-center justify-center text-white shrink-0">
              {name.charAt(0)}
            </span>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
