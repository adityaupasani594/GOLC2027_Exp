import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, KeyRound } from 'lucide-react';

export default function LoginForm({ onSubmit, loading, error }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Please enter your username or registered email.';
    }
    if (!password) {
      errs.password = 'Please enter your password.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ identifier, password, rememberMe });
  };

  // Demo autofill helper for instant testing
  const handleAutofillDemo = () => {
    setIdentifier('aarav_sharma');
    setPassword('Password@123');
    setFormErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username / Email Field */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Student Username or Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (formErrors.identifier) setFormErrors((prev) => ({ ...prev, identifier: null }));
            }}
            placeholder="e.g. student.vesit@ves.ac.in or username"
            disabled={loading}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50/70 border ${formErrors.identifier ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              } focus:bg-white focus:outline-none focus:ring-4 transition-all duration-150 text-slate-900 placeholder:text-slate-400`}
          />
        </div>
        {formErrors.identifier && (
          <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.identifier}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Password
          </label>
          <button
            type="button"
            onClick={() => alert('For this demonstration, use the demo student account (aarav_sharma / Password@123) or create a new account in the Register tab.')}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: null }));
            }}
            placeholder="Enter your password"
            disabled={loading}
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50/70 border ${formErrors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              } focus:bg-white focus:outline-none focus:ring-4 transition-all duration-150 text-slate-900 placeholder:text-slate-400`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {formErrors.password && (
          <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.password}</p>
        )}
      </div>

      {/* Remember Me & Quick Demo Autofill */}
      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs text-slate-600">Remember my session</span>
        </label>

        <button
          type="button"
          onClick={handleAutofillDemo}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
          title="Fill with test student credentials"
        >
          <KeyRound className="w-3 h-3 text-indigo-500" />
          <span>Demo Account</span>
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-200/60 hover:shadow-lg hover:shadow-indigo-300/60 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <span>Sign In to Virtual Lab</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
