import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

export default function PasswordStrengthBar({ password = '' }) {
  const analysis = useMemo(() => {
    const checks = {
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };

    let score = 0;
    if (checks.length) score++;
    if (checks.hasUpper && checks.hasLower) score++;
    if (checks.hasNumber) score++;
    if (checks.hasSpecial) score++;

    let label = 'Enter password';
    let color = 'bg-slate-200';
    let textColor = 'text-slate-400';

    if (password.length > 0) {
      if (score <= 1) {
        label = 'Weak';
        color = 'bg-rose-500';
        textColor = 'text-rose-600';
      } else if (score === 2) {
        label = 'Fair';
        color = 'bg-amber-500';
        textColor = 'text-amber-600';
      } else if (score === 3) {
        label = 'Good';
        color = 'bg-indigo-500';
        textColor = 'text-indigo-600';
      } else {
        label = 'Strong';
        color = 'bg-emerald-500';
        textColor = 'text-emerald-600';
      }
    }

    return { checks, score, label, color, textColor };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5 transition-all">
      {/* 4-segment progress bar */}
      <div className="flex items-center gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`flex-1 h-full rounded-full transition-all duration-300 ${seg <= analysis.score ? analysis.color : 'bg-slate-200'
              }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500">Security strength:</span>
        <span className={`font-semibold ${analysis.textColor}`}>
          {analysis.label}
        </span>
      </div>

      {/* Mini requirements checklist */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 text-[10px] text-slate-500">
        <span className={`flex items-center gap-1 ${analysis.checks.length ? 'text-emerald-600 font-medium' : ''}`}>
          {analysis.checks.length ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
          8+ Characters
        </span>
        <span className={`flex items-center gap-1 ${analysis.checks.hasUpper && analysis.checks.hasLower ? 'text-emerald-600 font-medium' : ''}`}>
          {analysis.checks.hasUpper && analysis.checks.hasLower ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
          Upper & Lower case
        </span>
        <span className={`flex items-center gap-1 ${analysis.checks.hasNumber ? 'text-emerald-600 font-medium' : ''}`}>
          {analysis.checks.hasNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
          At least 1 Number
        </span>
        <span className={`flex items-center gap-1 ${analysis.checks.hasSpecial ? 'text-emerald-600 font-medium' : ''}`}>
          {analysis.checks.hasSpecial ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
          Special Symbol (!@#$)
        </span>
      </div>
    </div>
  );
}
