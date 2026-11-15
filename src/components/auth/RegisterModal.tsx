import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { THEME_CONFIGS, BRAND_COLORS, getThemeTitleColor } from '../../themeStyles';
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
  const titleColorClass = getThemeTitleColor(branding);
  const brandHeader = branding.navbarColor && branding.navbarColor !== 'default' ? BRAND_COLORS[branding.navbarColor] : null;
  const isLightBrandHeader = brandHeader ? !brandHeader.isDark : false;
  const headerBgClass = brandHeader?.header || 'bg-slate-900 border-slate-800';

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

  const inputBaseClass = `w-full bg-white border border-slate-300 ${
    branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'
  } px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition`;

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn ${theme.rootContainer}`}>
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden relative text-slate-800 my-8 shadow-xl">
        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between border-b ${headerBgClass} ${isLightBrandHeader ? 'text-slate-900' : 'text-white'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${isLightBrandHeader ? 'bg-slate-100 border-slate-200' : 'bg-white/10 border-white/15'}`}>
              <UserPlus className={`w-4 h-4 ${isLightBrandHeader ? titleColorClass : 'text-white'}`} />
            </div>
            <div className="min-w-0">
              <h3 className={`text-base font-bold tracking-tight ${isLightBrandHeader ? titleColorClass : 'text-white'}`}>Applicant Registration</h3>
              <p className={`text-xs truncate font-medium ${isLightBrandHeader ? 'text-blue-700' : 'text-blue-200'}`}>{branding.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration dialog"
            className={`p-1.5 rounded-lg transition shrink-0 ${isLightBrandHeader ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2 font-medium mb-4">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleStartRegistration} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name (as per 10th Certificate) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className={inputBaseClass}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="applicant@domain.com"
                      className={`${inputBaseClass} pl-9`}
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    10-Digit Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876543210"
                      className={`${inputBaseClass} pl-9 font-mono tabular-nums`}
                      required
                    />
                  </div>
                </div>

                {/* Reservation Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reservation Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'UR' | 'OBC' | 'SC' | 'ST' | 'EWS')}
                    className={inputBaseClass}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className={`${inputBaseClass} pl-9 font-mono tabular-nums`}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className={`${inputBaseClass} pl-9`}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`${inputBaseClass} pl-9`}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  A 6-digit verification code (OTP) will be sent to <strong className="text-slate-900">{email || 'your email'}</strong> to verify your registration.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Verification OTP...</span>
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
            <div className="space-y-6 py-2 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className={`text-sm font-bold ${titleColorClass}`}>Verify Your Email Address</h4>
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  We&apos;ve sent a 6-digit verification code to{' '}
                  <strong className="text-blue-900">{email || 'your email'}</strong>.
                  <br />
                  Enter the code below to complete your applicant registration.
                </p>
              </div>

              <form onSubmit={handleVerifyAndComplete} className="space-y-5">
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    placeholder="000000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-2xl text-center font-mono font-bold tabular-nums tracking-[0.45em] text-indigo-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 focus:bg-white transition"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length !== 6}
                    className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify &amp; Complete Registration</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('details'); setError(''); }}
                    className="w-full py-2 text-xs text-slate-600 hover:text-slate-900 transition font-semibold"
                  >
                    Edit Registration Details
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer Switcher */}
          <div className="text-center pt-4 border-t border-slate-200 text-xs text-slate-600 mt-5">
            <span>Already registered? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
              className="text-indigo-700 font-semibold hover:text-indigo-900 hover:underline"
            >
              Sign in to account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
