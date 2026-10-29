import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
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
  const { roles, allowDevRoleSelector, secureLogin, login, setActiveTab } = usePortal();

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
    if (result.success) {
      onLoginSuccess(selectedRole); 
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative text-slate-800 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <LogIn className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <h3 className="text-base font-bold">Portal Sign In</h3>
              <p className="text-xs text-indigo-100">National University Recruitment Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {targetPostTitle && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Log in to continue your application for <strong>{targetPostTitle}</strong>.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Registration Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address / Registration ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@univ.edu"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Captcha */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Human Verification
              </label>
              <div className="flex items-center gap-3">
                <div 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden h-10 flex items-center justify-center relative group"
                  title="Click to refresh captcha"
                >
                  {captchaSvg ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: captchaSvg }} 
                      className="w-full h-full flex items-center justify-center cursor-pointer"
                      onClick={fetchCaptcha}
                    />
                  ) : (
                    <div className="text-[10px] text-slate-400">Loading...</div>
                  )}
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="absolute right-1 top-1 p-1 bg-white/80 rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs"
                  >
                    <RefreshCw className={`w-3 h-3 text-slate-600 ${isRefreshingCaptcha ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaText}
                  onChange={(e) => setCaptchaText(e.target.value)}
                  placeholder="Enter code"
                  className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-center font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{isSubmitting ? 'Verifying...' : 'Secure Database Login'}</span>
            </button>
          </form>

          {/* Role Selector (Dev Mode Bypass) */}
          {allowDevRoleSelector && (
            <div className="pt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-[10px] uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Temporary Bypass (No Database Required)</span>
                </div>
                
                <div className="relative">
                  <User className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-amber-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
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
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm transition transform active:scale-98"
                >
                  Quick Bypass Login as {roles.find(r => r.id === selectedRole)?.name}
                </button>
              </div>
            </div>
          )}

          {/* Footer Switcher */}
          <div className="text-center pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-2">
            <div>
              <span>Don't have an applicant account? </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToRegister();
                }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Register here
              </button>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('system_status');
                }}
                className="text-[10px] text-slate-400 hover:text-indigo-500 transition flex items-center justify-center gap-1 mx-auto font-medium"
              >
                <Activity className="w-3 h-3" />
                <span>Unable to log in? Check System API Health</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
