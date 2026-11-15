import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { THEME_CONFIGS, BRAND_COLORS, getThemeTitleColor } from '../../themeStyles';
import { UserRole } from '../../types';
import { X, LogIn, Shield, Sparkles, User, Lock, Mail, AlertCircle, RefreshCw, Activity } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: (role: UserRole) => void;
  targetPostTitle?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
  targetPostTitle,
}) => {
  const { roles, allowDevRoleSelector, secureLogin, login, branding } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];
  const titleColorClass = getThemeTitleColor(branding);
  const brandHeader = branding.navbarColor && branding.navbarColor !== 'default' ? BRAND_COLORS[branding.navbarColor] : null;
  const isLightBrandHeader = brandHeader ? !brandHeader.isDark : false;
  const headerBgClass = brandHeader?.header || 'bg-slate-900 border-slate-800';

  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);
  const [error, setError] = useState('');

  const fetchCaptcha = async () => {
    setIsRefreshingCaptcha(true);
    try {
      const res = await fetch('/api/auth/captcha');
      const data = await res.json();
      if (data.success) {
        setCaptchaId(data.captchaId);
        setCaptchaSvg(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch captcha:', e);
    }
    setIsRefreshingCaptcha(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchCaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your credentials.');
      return;
    }
    if (!captchaText.trim()) {
      setError('Please enter the captcha code.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    // Call secureLogin
    const result = await secureLogin(email, password, captchaId, captchaText);
    if (result.success && result.user) {
      onLoginSuccess(result.user.role); 
      onClose();
    } else {
      setError(result.error || 'Invalid email, password, or captcha.');
      fetchCaptcha(); // Refresh captcha on failure
      setCaptchaText('');
    }
    setIsSubmitting(false);
  };

  const handleBypassLogin = () => {
    const roleInfo = roles.find(r => r.id === selectedRole);
    const dummyEmail = email.trim() || `${selectedRole}@univ.edu`;
    const dummyName = roleInfo?.name || 'Administrator';
    
    // Directly call context login (bypass API/Database)
    login(selectedRole, dummyEmail, dummyName);
    onLoginSuccess(selectedRole);
    onClose();
  };

  const inputBaseClass = `w-full bg-white border border-slate-300 ${
    branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'
  } pl-9 pr-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition`;

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn ${theme.rootContainer}`}>
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden relative text-slate-800 my-8 shadow-xl">
        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between border-b ${headerBgClass} ${isLightBrandHeader ? 'text-slate-900' : 'text-white'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${isLightBrandHeader ? 'bg-slate-100 border-slate-200' : 'bg-white/10 border-white/15'}`}>
              <LogIn className={`w-4 h-4 ${isLightBrandHeader ? titleColorClass : 'text-white'}`} />
            </div>
            <div className="min-w-0">
              <h3 className={`text-base font-bold tracking-tight ${isLightBrandHeader ? titleColorClass : 'text-white'}`}>Portal Sign In</h3>
              <p className={`text-xs truncate font-medium ${isLightBrandHeader ? 'text-blue-700' : 'text-blue-200'}`}>{branding.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className={`p-1.5 rounded-lg transition shrink-0 ${isLightBrandHeader ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {targetPostTitle && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs text-slate-700 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                Sign in to continue your application for <strong className="text-slate-900">{targetPostTitle}</strong>.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Registration Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address / Registration ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@domain.edu"
                  className={inputBaseClass}
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={inputBaseClass}
                />
              </div>
            </div>

            {/* Captcha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Security Verification <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg overflow-hidden h-12 flex items-center justify-center relative group"
                  title="Click to refresh captcha"
                >
                  {captchaSvg ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: captchaSvg }}
                      className="w-full h-full flex items-center justify-center cursor-pointer scale-[1.2] brightness-[0.85] contrast-[1.15]"
                      onClick={fetchCaptcha}
                    />
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium">Loading code...</div>
                  )}
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    aria-label="Refresh captcha"
                    className="absolute right-1.5 top-1.5 p-1 bg-white rounded-md opacity-80 group-hover:opacity-100 transition border border-slate-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshingCaptcha ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={captchaText}
                  onChange={(e) => setCaptchaText(e.target.value)}
                  placeholder="CODE"
                  className="w-28 bg-white border border-slate-300 rounded-lg px-3 h-12 text-sm text-center font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 uppercase placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
            </button>
          </form>

          {/* Role Selector (Dev Mode Bypass) */}
          {allowDevRoleSelector && (
            <div className="pt-1">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Quick Role Access (Development Mode)</span>
                </div>

                <div className="relative">
                  <User className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-amber-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 appearance-none"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleBypassLogin}
                  className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition"
                >
                  Continue as {roles.find((r) => r.id === selectedRole)?.name}
                </button>
              </div>
            </div>
          )}

          {/* Footer Switcher */}
          <div className="text-center pt-3 border-t border-slate-200 text-xs text-slate-600">
            <span>New applicant without an account? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="text-indigo-700 font-semibold hover:text-indigo-900 hover:underline"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
