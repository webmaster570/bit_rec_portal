import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import {
  ShieldCheck,
  Bell,
  User,
  CheckCircle,
  ChevronDown,
  Building2,
  GraduationCap,
  Award,
  LogIn,
  UserPlus,
  LogOut,
  Globe,
  Menu,
  X,
  Lock,
  Mail,
  Phone,
  LayoutDashboard,
  Search,
  Sparkles,
} from 'lucide-react';
import { THEME_CONFIGS, BRAND_COLORS } from '../themeStyles';
import { ChangePasswordModal } from './auth/ChangePasswordModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenRegister,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const {
    isLoggedIn,
    currentUser,
    currentRole,
    roles,
    switchRole,
    notifications,
    markNotificationRead,
    branding,
    logout,
    allowDevRoleSelector,
  } = usePortal();

  const theme = THEME_CONFIGS[branding.theme || 'classic'];
  const isHeaderBranded = !!(branding.navbarColor && branding.navbarColor !== 'default' && BRAND_COLORS[branding.navbarColor]);
  const headerColors = isHeaderBranded ? BRAND_COLORS[branding.navbarColor as any] : null;

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);

  const currentRoleInfo = roles.find((r) => r.id === currentRole);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderLogoIcon = () => {
    switch (branding.logoIconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Globe':
        return <Globe className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Award':
        return <Award className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Building2':
      default:
        return <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 ${isHeaderBranded ? headerColors?.header : 'bg-white'} border-b ${isHeaderBranded ? 'border-white/10' : 'border-slate-200'} ${branding.showNavbarShadow ? 'shadow-md' : 'shadow-none'} transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity Section */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <button
              onClick={onToggleMobileMenu}
              className={`lg:hidden p-2 rounded-xl transition ${isHeaderBranded ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setActiveTab('public_recruitment')}
            >
              {branding.logoType === 'image' && branding.logoImageUrl ? (
                <img
                  src={branding.logoImageUrl}
                  alt={branding.title}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-sm shrink-0"
                />
              ) : (
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0`}>
                  {renderLogoIcon()}
                </div>
              )}

              <div className="hidden sm:block overflow-hidden">
                <h1 className={`text-sm sm:text-base font-black tracking-tight leading-tight truncate ${isHeaderBranded ? 'text-white' : 'text-slate-900'}`}>
                  {branding.title}
                </h1>
                <p className={`text-[10px] sm:text-[11px] font-bold truncate ${isHeaderBranded ? 'text-white/60' : 'text-slate-500'}`}>
                  {branding.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Search & Actions Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${isHeaderBranded ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  onClick={onOpenRegister}
                  className={`px-4 py-2 rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5 ${theme.primaryButton}`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifPopover(!showNotifPopover)}
                    className={`p-2 rounded-xl transition relative ${isHeaderBranded ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifPopover && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                       <div className={`p-4 ${theme.heroGradient || 'bg-slate-900'} text-white flex items-center justify-between`}>
                         <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">Alert Center</span>
                         </div>
                         <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{notifications.length} Messages</span>
                       </div>
                       <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                         {notifications.length === 0 ? (
                           <div className="p-8 text-center space-y-2">
                              <Sparkles className="w-8 h-8 text-slate-200 mx-auto" />
                              <p className="text-xs text-slate-400 font-bold">No new notifications</p>
                           </div>
                         ) : (
                           notifications.map(n => (
                             <div 
                               key={n.id} 
                               className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}
                               onClick={() => {
                                 markNotificationRead(n.id);
                                 setShowNotifPopover(false);
                               }}
                             >
                               <div className="flex justify-between gap-2">
                                 <h4 className="text-xs font-black text-slate-900 leading-tight">{n.title}</h4>
                                 {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>}
                               </div>
                               <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                               <span className="text-[9px] text-slate-400 font-bold uppercase mt-2 block">Just Now</span>
                             </div>
                           ))
                         )}
                       </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className={`flex items-center gap-2.5 p-1 pr-3 rounded-full transition border ${isHeaderBranded ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white/20">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="hidden md:block text-left">
                      <div className={`text-xs font-black leading-tight ${isHeaderBranded ? 'text-white' : 'text-slate-900'}`}>
                        {currentUser?.name?.split(' ')[0]}
                      </div>
                      <div className={`text-[10px] font-bold ${isHeaderBranded ? 'text-white/50' : 'text-slate-500'}`}>
                        {currentRoleInfo?.name || 'Account'}
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''} ${isHeaderBranded ? 'text-white/40' : 'text-slate-400'}`} />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                       <div className="px-5 py-3 border-b border-slate-50 mb-2">
                         <div className="text-xs font-black text-slate-900 truncate">{currentUser?.name}</div>
                         <div className="text-[10px] font-bold text-slate-400 truncate">{currentUser?.email}</div>
                         <span className={`inline-block mt-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${theme.accentColor} bg-indigo-50`}>
                            {currentRoleInfo?.name}
                         </span>
                       </div>
                       
                       <div className="px-2 space-y-1">
                          <button
                            onClick={() => { setShowRoleDropdown(false); setIsChangePassOpen(true); }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-3 transition-colors"
                          >
                            <Lock className="w-4 h-4 text-slate-400" />
                            <span>Security & Password</span>
                          </button>

                          {allowDevRoleSelector && (
                            <div className="pt-2 pb-1">
                              <div className="px-4 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Developer: Switch Role</div>
                              {roles.map(r => (
                                <button
                                  key={r.id}
                                  onClick={() => { switchRole(r.id); setShowRoleDropdown(false); }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold flex items-center justify-between ${currentRole === r.id ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                  <span>{r.name}</span>
                                  {currentRole === r.id && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                                </button>
                              ))}
                            </div>
                          )}
                       </div>

                       <div className="mt-3 pt-3 border-t border-slate-50 px-2">
                         <button
                           onClick={() => { logout(); setActiveTab('public_recruitment'); }}
                           className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                         >
                           <LogOut className="w-4 h-4" />
                           <span>Sign Out Session</span>
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isChangePassOpen} 
        onClose={() => setIsChangePassOpen(false)} 
      />
    </header>
  );
};
