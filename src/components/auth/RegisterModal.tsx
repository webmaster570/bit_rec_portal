import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { THEME_CONFIGS } from '../../themeStyles';
import { X, UserPlus, Mail, Phone, Calendar, Lock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
}) => {
  const { registerApplicant, sendOtp, verifyOtp, branding } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [category, setCategory] = useState<'UR' | 'OBC' | 'SC' | 'ST' | 'EWS'>('UR');
  const [dob, setDob] = useState('1996-05-15');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !mobile.trim()) {
      setError('Please fill in all mandatory applicant details.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    const result = await sendOtp(email);
    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error || 'Failed to send OTP. Please check your email address or try again later.');
    }
    setIsSubmitting(false);
  };

  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const result = await verifyOtp(email, otp);
    if (result.success) {
      registerApplicant({
        fullName,
        email,
        mobile,
        category,
        dob,
        password,
      });
      onRegisterSuccess();
      onClose();
    } else {
      setError(result.error || 'Invalid OTP code. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn ${theme.rootContainer}`}>
      <div className={`${theme.cardBase} w-full max-w-lg overflow-hidden relative text-slate-800 my-8 shadow-2xl`}>
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${branding.theme === 'industrial_heavy' ? 'bg-slate-900' : 'bg-slate-900'}`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${theme.headingFont}`}>Applicant Registration</h3>
              <p className="text-xs opacity-70 truncate">{branding.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleStartRegistration} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (as per 10th Certificate) *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className={`w-full bg-white border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} px-3 py-2 text-xs text-slate-900 focus:outline-none ${theme.focusColor}`}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="applicant@domain.com"
                      className={`w-full bg-white border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none ${theme.focusColor}`}
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    10-Digit Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876543210"
                      className={`w-full bg-white border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none ${theme.focusColor}`}
                      required
                    />
                  </div>
                </div>

                {/* Reservation Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reservation Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full bg-white border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} px-3 py-2 text-xs text-slate-900 focus:outline-none ${theme.focusColor}`}
                  >
                    <option value="UR">Unreserved (UR)</option>
                    <option value="OBC">OBC (Non-Creamy Layer)</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="EWS">Economically Weaker Section (EWS)</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className={`w-full bg-white border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none ${theme.focusColor}`}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-white border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none ${theme.focusColor}`}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-white border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none ${theme.focusColor}`}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={`p-3 bg-slate-50 border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} text-[11px] text-slate-600 flex items-start gap-2`}>
                <CheckCircle className={`w-4 h-4 ${theme.accentColor} shrink-0 mt-0.5`} />
                <span>
                  A verification code (OTP) will be sent to <strong>{email || 'your email'}</strong> to complete registration.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 ${theme.primaryButton} font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Verification OTP</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 py-4 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className={`w-16 h-16 bg-slate-50 ${theme.accentColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <Mail className="w-8 h-8" />
                </div>
                <h4 className={`text-sm font-bold ${theme.headingFont}`}>Verify Your Email</h4>
                <p className="text-xs opacity-60">
                  We've sent a 6-digit code to <strong className={theme.accentColor}>{email || 'your email'}</strong>. <br />
                  Please enter it below to complete your registration.
                </p>
              </div>

              <form onSubmit={handleVerifyAndComplete} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    placeholder="0 0 0 0 0 0"
                    className={`w-full bg-slate-50 border-2 border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-2xl'} px-4 py-4 text-2xl text-center font-black tracking-widest ${theme.accentColor} focus:outline-none ${theme.focusColor} focus:bg-white transition`}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length !== 6}
                    className={`w-full py-3 ${theme.primaryButton} font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify & Complete Registration</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('details'); setError(''); }}
                    className="w-full py-2 text-xs opacity-50 hover:opacity-100 transition font-medium"
                  >
                    Edit Registration Details
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer Switcher */}
          <div className="text-center pt-4 border-t border-slate-200 text-xs text-slate-600 mt-4">
            <span>Already registered? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
              className={`${theme.accentColor} font-bold hover:underline`}
            >
              Sign in to account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
