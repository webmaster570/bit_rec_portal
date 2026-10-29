import React, { useEffect } from 'react';
import { usePortal } from '../context/PortalContext';
import {
  Globe,
  LayoutDashboard,
  Megaphone,
  FileText,
  UserCheck,
  CheckSquare,
  FileSearch,
  Award,
  Trophy,
  CreditCard,
  Settings,
  ShieldAlert,
  BarChart2,
  Send,
  Briefcase,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  Building2,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Database,
  Activity,
} from 'lucide-react';
import { THEME_CONFIGS, BRAND_COLORS } from '../themeStyles';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
  onOpenLogin,
  onOpenRegister,
}) => {
  const { currentRole, roles, isLoggedIn, currentUser, branding, logout, mongoStatus } = usePortal();

  const theme = THEME_CONFIGS[branding.theme || 'classic'];
  const currentRoleInfo = roles.find((r) => r.id === currentRole);

  const isSidebarBranded = !!(branding.sidebarColor && branding.sidebarColor !== 'default' && BRAND_COLORS[branding.sidebarColor]);

  // Close mobile side panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen && setIsMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      roles: [
        'super_admin',
        'recruitment_admin',
        'recruitment_officer',
        'department_admin',
        'screening_committee',
        'interview_panel',
        'doc_verifier',
        'finance_admin',
        'applicant',
      ],
    },
    {
      id: 'my_jobs',
      label: 'My Jobs',
      icon: Briefcase,
      roles: ['applicant'],
    },
    {
      id: 'public_recruitment',
      label: 'Public Job Notices',
      icon: Globe,
      roles: [
        'super_admin',
        'recruitment_admin',
        'recruitment_officer',
        'department_admin',
        'screening_committee',
        'interview_panel',
        'doc_verifier',
        'finance_admin',
        'applicant',
      ],
    },
    {
      id: 'drives',
      label: 'Recruitment Drives',
      icon: Megaphone,
      roles: ['super_admin', 'recruitment_admin', 'recruitment_officer', 'department_admin'],
    },
    {
      id: 'applicant_portal',
      label: 'Online Apply Portal',
      icon: Send,
      roles: ['super_admin', 'recruitment_admin', 'recruitment_officer', 'applicant'],
    },
    {
      id: 'applications',
      label: 'Application Master List',
      icon: FileText,
      roles: ['super_admin', 'recruitment_admin', 'recruitment_officer', 'department_admin', 'finance_admin'],
    },
    {
      id: 'screening',
      label: 'Applicant Screening',
      icon: CheckSquare,
      roles: ['super_admin', 'recruitment_admin', 'screening_committee', 'department_admin'],
    },
    {
      id: 'doc_verification',
      label: 'Document Verification',
      icon: FileSearch,
      roles: ['super_admin', 'recruitment_admin', 'doc_verifier'],
    },
    {
      id: 'interviews',
      label: 'Test & Interview Grading',
      icon: Award,
      roles: ['super_admin', 'recruitment_admin', 'interview_panel', 'department_admin'],
    },
    {
      id: 'merit',
      label: 'Merit List & Offer Letters',
      icon: Trophy,
      roles: ['super_admin', 'recruitment_admin', 'recruitment_officer'],
    },
    {
      id: 'finance',
      label: 'Payment & Reconciliation',
      icon: CreditCard,
      roles: ['super_admin', 'recruitment_admin', 'finance_admin'],
    },
    {
      id: 'analytics',
      label: 'Recruitment Analytics',
      icon: BarChart2,
      roles: ['super_admin', 'recruitment_admin', 'department_admin'],
    },
    {
      id: 'admin',
      label: 'RBAC & Master Settings',
      icon: Settings,
      roles: ['super_admin'],
    },
    {
      id: 'audit',
      label: 'System Audit Logs',
      icon: ShieldAlert,
      roles: ['super_admin'],
    },
    {
      id: 'system_status',
      label: 'System API Health',
      icon: Activity,
      roles: ['super_admin'],
    },
  ];

  // Filter items visible to current active role
  const visibleNavItems = navItems.filter((item) => {
    if (!isLoggedIn) {
      // Unauthenticated visitor on public page: display public notices and apply portal
      return item.id === 'public_recruitment' || item.id === 'applicant_portal';
    }
    return item.roles.includes(currentRole);
  });

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderLogoIcon = () => {
    switch (branding.logoIconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-white" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-white" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-white" />;
      case 'Award':
        return <Award className="w-5 h-5 text-white" />;
      case 'Building2':
      default:
        return <Building2 className="w-5 h-5 text-white" />;
    }
  };

  const renderLogoBadge = (sizeClasses = 'w-9 h-9') => {
    if (branding.logoType === 'image' && branding.logoImageUrl) {
      return (
        <img
          src={branding.logoImageUrl}
          alt={branding.title}
          className={`${sizeClasses} rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-md shrink-0`}
          onError={(e) => {
            // If image fails to load, fallback gracefully to icon view
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0`}>
        {renderLogoIcon()}
      </div>
    );
  };

  const navContent = (
    <>
      <div className="p-3">
        <div className={`px-3 py-2 mb-2 text-[10px] font-extrabold uppercase tracking-widest ${isSidebarBranded ? 'text-white/50 border-white/10' : 'text-indigo-600 border-slate-200'} border-b`}>
          {isLoggedIn ? 'Navigation Modules' : 'Public Menu'}
        </div>

        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'overview' && activeTab === 'dashboard');
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? `${theme.primaryButton} shadow-md`
                    : `${isSidebarBranded ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} active:bg-slate-200`
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : (isSidebarBranded ? 'text-white/60' : theme.accentColor)}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white/80' : (isSidebarBranded ? 'text-white/30' : 'text-slate-300')}`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Scope Card Footer */}
      {isLoggedIn ? (
        <div className={`p-3.5 border ${isSidebarBranded ? 'border-white/10 bg-white/5' : 'border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-purple-50/40'} m-2.5 rounded-2xl text-xs shadow-xs shrink-0 space-y-2.5`}>
          <div>
            <div className={`flex items-center space-x-2 mb-1 ${isSidebarBranded ? 'text-white' : 'text-slate-900'} font-bold`}>
              <UserCheck className={`w-4 h-4 ${isSidebarBranded ? 'text-emerald-400' : 'text-emerald-600'} shrink-0`} />
              <span className="truncate">{currentRoleInfo?.name}</span>
            </div>
            <p className={`text-[11px] ${isSidebarBranded ? 'text-white/60' : 'text-slate-500'} leading-snug`}>
              {currentRoleInfo?.description}
            </p>
          </div>

          {currentRole === 'super_admin' && (
            <div 
              className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition hover:scale-101 ${
                mongoStatus.connected 
                  ? 'bg-emerald-50/50 border-emerald-200' 
                  : mongoStatus.missingUri 
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-amber-50/50 border-amber-200'
              }`}
              onClick={() => setActiveTab('system_status')}
              title={mongoStatus.missingUri ? "System Critical: Config Missing" : "View Detailed System Health"}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  mongoStatus.connected 
                    ? 'bg-emerald-500 animate-pulse' 
                    : mongoStatus.missingUri 
                      ? 'bg-rose-500 animate-bounce' 
                      : 'bg-amber-500 animate-pulse'
                }`} />
                <span className={`text-[10px] font-black uppercase tracking-tight ${
                  mongoStatus.connected 
                    ? (isSidebarBranded ? 'text-emerald-300' : 'text-emerald-800')
                    : mongoStatus.missingUri 
                      ? (isSidebarBranded ? 'text-rose-300' : 'text-rose-800')
                      : (isSidebarBranded ? 'text-amber-300' : 'text-amber-800')
                }`}>
                  System: {mongoStatus.connected ? 'Healthy' : mongoStatus.missingUri ? 'Config Error' : 'Connecting'}
                </span>
              </div>
              <Activity className={`w-3 h-3 ${
                mongoStatus.connected 
                  ? 'text-emerald-500' 
                  : mongoStatus.missingUri 
                    ? 'text-rose-500' 
                    : 'text-amber-500'
              }`} />
            </div>
          )}

          <div className={`text-[10px] ${isSidebarBranded ? 'text-white/40 border-white/10' : 'text-slate-500 border-indigo-100/80'} flex items-center justify-between border-t pt-2`}>
            <span>Permissions:</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded-full border shadow-2xs ${isSidebarBranded ? 'text-emerald-300 bg-white/10 border-white/20' : 'text-indigo-700 bg-white border-indigo-200'}`}>
              {currentRoleInfo?.permissions.length} Active
            </span>
          </div>
        </div>
      ) : (
        <div className={`p-3.5 border ${isSidebarBranded ? 'border-white/10 bg-white/5' : 'border-indigo-100 bg-slate-50'} m-2.5 rounded-2xl text-xs shadow-xs space-y-2 shrink-0`}>
          <div className={`flex items-center space-x-2 ${isSidebarBranded ? 'text-white' : 'text-slate-900'} font-bold`}>
            <Globe className={`w-4 h-4 ${isSidebarBranded ? 'text-indigo-400' : 'text-indigo-600'} shrink-0`} />
            <span>Public Visitor View</span>
          </div>
          <p className={`text-[11px] ${isSidebarBranded ? 'text-white/60' : 'text-slate-500'} leading-snug`}>
            Sign in or Register to access administrative workflows or track your submitted applications.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {onOpenLogin && (
              <button
                onClick={() => {
                  if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
            {onOpenRegister && (
              <button
                onClick={() => {
                  if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full py-2 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR (Large screens: lg and above) */}
      <aside className={`hidden lg:flex w-64 ${isSidebarBranded && BRAND_COLORS[branding.sidebarColor as any] ? BRAND_COLORS[branding.sidebarColor as any].sidebar : theme.sidebarBase} min-h-[calc(100vh-65px)] flex-col justify-between shrink-0 shadow-2xs transition-colors duration-300`}>
        {navContent}
      </aside>

      {/* MOBILE SLIDE-OVER SIDE PANEL (Screens below lg) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-Over Drawer Container */}
          <div
            className={`fixed top-0 bottom-0 left-0 w-[85vw] max-w-xs ${isSidebarBranded && BRAND_COLORS[branding.sidebarColor as any] ? BRAND_COLORS[branding.sidebarColor as any].sidebar : 'bg-white'} shadow-2xl flex flex-col justify-between z-50 overflow-y-auto animate-in slide-in-from-left duration-250 ease-out border-r border-slate-200`}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Mobile Drawer Header with the EXACT Custom/Uploaded Logo */}
            <div className={`p-4 border-b ${isSidebarBranded ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50'} flex items-center justify-between shrink-0`}>
              <div className="flex items-center space-x-2.5 min-w-0">
                {renderLogoBadge('w-10 h-10')}
                <div className="min-w-0">
                  <h2 className={`text-xs font-extrabold tracking-tight leading-snug truncate ${isSidebarBranded ? 'text-white' : 'text-slate-900'}`}>
                    {branding.title}
                  </h2>
                  <span className={`text-[10px] font-bold block uppercase tracking-wider ${isSidebarBranded ? 'text-emerald-400' : 'text-indigo-700'}`}>
                    Recruitment Portal
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                className={`p-2 rounded-xl transition shrink-0 ${isSidebarBranded ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                aria-label="Close navigation panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Header / Quick Actions */}
            {isLoggedIn && currentUser && (
              <div className={`p-3 border-b shrink-0 flex items-center justify-between gap-2 ${isSidebarBranded ? 'bg-white/5 border-white/10' : 'bg-indigo-50/70 border-indigo-100/80'}`}>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isSidebarBranded ? 'text-white' : 'text-slate-900'}`}>
                    {currentUser.name}
                  </div>
                  <div className={`text-[10px] truncate ${isSidebarBranded ? 'text-white/50' : 'text-slate-500'}`}>
                    {currentUser.email}
                  </div>
                  <span className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold ${isSidebarBranded ? 'bg-white/10 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                    {currentRoleInfo?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                    setActiveTab('public_recruitment');
                  }}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold flex items-center gap-1 transition shadow-2xs shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Scrollable Navigation items */}
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
