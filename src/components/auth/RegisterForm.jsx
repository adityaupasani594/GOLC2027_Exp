import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react';
import PasswordStrengthBar from './PasswordStrengthBar';

export default function RegisterForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    institution: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';

    if (!formData.username.trim()) {
      errs.username = 'Username is required.';
    } else if (formData.username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      errs.username = 'Username may only contain letters, numbers, and underscores.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const passwordsMatch = Boolean(
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword
  );

  const passwordsMismatch = Boolean(
    formData.confirmPassword &&
    formData.password &&
    formData.password !== formData.confirmPassword
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* 2-Column: First Name & Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            First Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="e.g. Alex"
              disabled={loading}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50/70 border ${
                formErrors.firstName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              } focus:bg-white focus:outline-none focus:ring-4 transition-all text-slate-900 placeholder:text-slate-400`}
            />
          </div>
          {formErrors.firstName && (
            <p className="mt-1 text-[10px] text-rose-500 font-medium">{formErrors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Last Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="e.g. Rivers"
              disabled={loading}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50/70 border ${
                formErrors.lastName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              } focus:bg-white focus:outline-none focus:ring-4 transition-all text-slate-900 placeholder:text-slate-400`}
            />
          </div>
          {formErrors.lastName && (
            <p className="mt-1 text-[10px] text-rose-500 font-medium">{formErrors.lastName}</p>
          )}
        </div>
      </div>

      {/* Username Field */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Student Username <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <span className="text-xs font-mono font-bold">@</span>
          </div>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="scholar_user"
            disabled={loading}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50/70 border ${
              formErrors.username ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            } focus:bg-white focus:outline-none focus:ring-4 transition-all text-slate-900 placeholder:text-slate-400 font-mono`}
          />
        </div>
        {formErrors.username && (
          <p className="mt-1 text-[10px] text-rose-500 font-medium">{formErrors.username}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Email <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="e.g. scholar@university.edu or yourname@gmail.com"
            disabled={loading}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50/70 border ${
              formErrors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            } focus:bg-white focus:outline-none focus:ring-4 transition-all text-slate-900 placeholder:text-slate-400`}
          />
        </div>
        {formErrors.email && (
          <p className="mt-1 text-[10px] text-rose-500 font-medium">{formErrors.email}</p>
        )}
      </div>

      {/* Institution / University Field (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Institution / University <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => handleChange('institution', e.target.value)}
            placeholder="e.g. University / College / Independent Scholar"
            disabled={loading}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50/70 border border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 focus:bg-white focus:outline-none focus:ring-4 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Create Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Create Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Minimum 8 characters"
            disabled={loading}
            className={`w-full pl-9 pr-10 py-2 rounded-xl text-xs sm:text-sm bg-slate-50/70 border ${
              formErrors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            } focus:bg-white focus:outline-none focus:ring-4 transition-all text-slate-900 placeholder:text-slate-400`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        {formErrors.password && (
          <p className="mt-1 text-[10px] text-rose-500 font-medium">{formErrors.password}</p>
        )}
        <PasswordStrengthBar password={formData.password} />
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Confirm Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Re-enter your password"
            disabled={loading}
            className={`w-full pl-9 pr-10 py-2 rounded-xl text-xs sm:text-sm bg-slate-50/70 border ${
              formErrors.confirmPassword || passwordsMismatch
                ? 'border-rose-400 focus:ring-rose-200'
                : passwordsMatch
                  ? 'border-emerald-400 focus:ring-emerald-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            } focus:bg-white focus:outline-none focus:ring-4 transition-all text-slate-900 placeholder:text-slate-400`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Live confirmation badge */}
        {passwordsMatch && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Passwords match</span>
          </div>
        )}
        {passwordsMismatch && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-medium">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Passwords do not match</span>
          </div>
        )}
        {formErrors.confirmPassword && !passwordsMismatch && (
          <p className="mt-1 text-[10px] text-rose-500 font-medium">{formErrors.confirmPassword}</p>
        )}
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
            <span>Creating Student Account...</span>
          </>
        ) : (
          <>
            <span>Create Student Account</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
