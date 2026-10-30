import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { UserRole } from '../types';
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
  Sparkles,
  LayoutDashboard,
  Globe,
  Menu,
  X,
  Lock,
  Send,
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

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);

  const activeRoleObj = roles.find((r) => r.id === currentRole);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const isNavbarBranded = !!(branding.navbarColor && branding.navbarColor !== 'default' && BRAND_COLORS[branding.navbarColor]);

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
    <header className={`sticky top-0 z-40 ${isNavbarBranded && branding.navbarColor && BRAND_COLORS[branding.navbarColor] ? BRAND_COLORS[branding.navbarColor].header : (theme?.headerBase || 'bg-white border-b border-slate-200')} ${branding.showNavbarShadow ? 'shadow-md' : 'shadow-none'} transition-all duration-300`}>
      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {/* Mobile Hamburger Toggle Button (< lg screens) */}
          {isLoggedIn && (
            <button
              onClick={onToggleMobileMenu}
              className={`lg:hidden p-2 rounded-xl border transition shrink-0 active:scale-95 shadow-2xs ${isNavbarBranded ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'}`}
              aria-label={isMobileMenuOpen ? 'Close navigation panel' : 'Open navigation panel'}
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Brand & Organization Title */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group shrink-0 min-w-0"
            onClick={() => setActiveTab('public_recruitment')}
          >
            {branding.logoType === 'image' && branding.logoImageUrl ? (
              <img
                src={branding.logoImageUrl}
                alt="Portal Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-md group-hover:scale-105 transition-transform shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md ${theme?.headingFont || 'font-bold'} text-lg sm:text-xl group-hover:scale-105 transition-transform shrink-0`}>
                {renderLogoIcon()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className={`text-xs sm:text-base lg:text-lg ${theme?.headingFont || 'font-bold'} tracking-tight leading-tight truncate ${isNavbarBranded ? 'text-white' : ''}`}>
                  {branding.title}
                </h1>
                <span className={`hidden sm:inline-block text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 rounded-full font-mono font-bold shrink-0 border ${isNavbarBranded ? 'bg-white/10 text-emerald-300 border-white/20' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}>
                  Portal
                </span>
              </div>
              <p className={`text-[10px] sm:text-xs ${isNavbarBranded ? 'text-white/60' : 'text-slate-500'} hidden md:block truncate max-w-sm`}>
                {branding.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Navigation Quick Links (Desktop only) */}
        <div className="hidden lg:flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('public_recruitment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'public_recruitment'
                ? (isNavbarBranded ? 'bg-white/10 text-white border border-white/20 shadow-2xs' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs')
                : (isNavbarBranded ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isNavbarBranded ? 'text-white/70' : (theme?.accentColor || 'text-indigo-600')}`} />
            <span>Public Notices</span>
          </button>

          {!isLoggedIn && (
            <button
              onClick={() => setActiveTab('applicant_portal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'applicant_portal'
                  ? (isNavbarBranded ? 'bg-white/10 text-white border border-white/20 shadow-2xs' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs')
                  : (isNavbarBranded ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
              }`}
            >
              <Send className={`w-3.5 h-3.5 ${isNavbarBranded ? 'text-white/70' : (theme?.accentColor || 'text-indigo-600')}`} />
              <span>Apply Online</span>
            </button>
          )}

          {isLoggedIn && (
            <button
              onClick={() => {
                if (currentRole === 'applicant') setActiveTab('applicant_portal');
                else setActiveTab('overview');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab !== 'public_recruitment' && activeTab !== 'applicant_portal'
                  ? (isNavbarBranded ? 'bg-white/10 text-white border border-white/20 shadow-2xs' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs')
                  : (isNavbarBranded ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 ${isNavbarBranded ? 'text-white/70' : (theme?.accentColor || 'text-indigo-600')}`} />
              <span>My Dashboard</span>
            </button>
          )}
        </div>

        {/* Right Action Controls: Login / Register / User Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {!isLoggedIn ? (
            /* Visitor Action Buttons: Login & Register */
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={onOpenLogin}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs transition flex items-center space-x-1 sm:space-x-1.5 shadow-2xs border ${isNavbarBranded ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
              >
                <LogIn className={`w-3.5 h-3.5 ${isNavbarBranded ? 'text-white' : (theme?.accentColor || 'text-indigo-600')}`} />
                <span>Login</span>
              </button>

              <button
                onClick={onOpenRegister}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl ${theme?.primaryButton || 'bg-indigo-600 text-white'} font-bold text-[11px] sm:text-xs shadow-md transition flex items-center space-x-1 sm:space-x-1.5`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Register</span>
                <span className="xs:hidden">Sign Up</span>
              </button>
            </div>
          ) : (
            /* Authenticated User Controls */
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Notifications Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifPopover(!showNotifPopover)}
                  className={`relative p-1.5 sm:p-2 rounded-xl transition shadow-2xs border ${isNavbarBranded ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border-slate-200'}`}
                  title="System Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifPopover && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 text-xs z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900">System Notifications</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold">
                        {notifications.length} Messages
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto my-2">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl cursor-pointer transition ${
                            n.read ? 'opacity-60 hover:opacity-100' : 'bg-indigo-50/50 border border-indigo-100'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-800 mb-0.5">
                            <span>{n.title}</span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>}
                          </div>
                          <p className="text-slate-600 text-[11px] leading-snug">{n.message}</p>
                          <span className="text-[10px] text-indigo-600 block mt-1 font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Badge & Role Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-2xs max-w-[140px] sm:max-w-[180px] border ${isNavbarBranded ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
                >
                  <User className={`w-3.5 h-3.5 ${isNavbarBranded ? 'text-white' : 'text-purple-600'} shrink-0`} />
                  <span className={`font-bold truncate ${isNavbarBranded ? 'text-white' : 'text-slate-900'}`}>
                    {currentUser?.name?.split(' ')[0] || activeRoleObj?.name}
                  </span>
                  <ChevronDown className={`w-3 h-3 ${isNavbarBranded ? 'text-white/70' : 'text-slate-500'} shrink-0`} />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 border-b border-slate-100 mb-1">
                      User Account Session
                    </div>
                    <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 text-xs">
                      <div className="font-bold text-slate-900">{currentUser?.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{currentUser?.email}</div>
                      <span className="mt-1 inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                        {activeRoleObj?.name}
                      </span>
                    </div>

                    <div className="p-1 space-y-1">
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          setIsChangePassOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center space-x-2 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Change Password</span>
                      </button>
                    </div>

                    {/* Role Switcher (Active if Dev Selector Enabled) */}
                    {allowDevRoleSelector && (
                      <div className="p-1 space-y-1 border-t border-slate-100 mt-1">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Switch Active Role
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {roles.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => {
                                switchRole(r.id);
                                setShowRoleDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between transition ${
                                currentRole === r.id
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span>{r.name}</span>
                              {currentRole === r.id && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  setActiveTab('public_recruitment');
                }}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition flex items-center space-x-1"
                title="Log out of session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isChangePassOpen} 
        onClose={() => setIsChangePassOpen(false)} 
      />
    </header>
  );
};
