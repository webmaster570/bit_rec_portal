import React, { useState } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { LogIn } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PublicRecruitmentPortal } from './components/public/PublicRecruitmentPortal';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { DriveManagement } from './components/drives/DriveManagement';
import { ApplicationList } from './components/applications/ApplicationList';
import { ApplicantPortal } from './components/applications/ApplicantPortal';
import { MyJobsPortal } from './components/applicant/MyJobsPortal';
import { ScreeningPortal } from './components/screening/ScreeningPortal';
import { DocumentVerificationPortal } from './components/documentVerification/DocumentVerificationPortal';
import { InterviewPortal } from './components/interviews/InterviewPortal';
import { MeritListPortal } from './components/merit/MeritListPortal';
import { FinancePortal } from './components/finance/FinancePortal';
import { AnalyticsPortal } from './components/analytics/AnalyticsPortal';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { AdminPortal } from './components/admin/AdminPortal';
import { ServerTransactionToastContainer } from './components/common/ServerTransactionToastContainer';
import { THEME_CONFIGS } from './themeStyles';

const MainAppContent: React.FC = () => {
  const { currentRole, isLoggedIn, branding, activeTab, setActiveTab } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Auth Modals State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Auto close mobile drawer on tab navigation
  };

  const handleApplyClick = (driveId: string, postId: string, postTitle: string) => {
    if (isLoggedIn) {
      if (currentRole === 'applicant') {
        handleTabChange('applicant_portal');
      } else {
        handleTabChange('overview');
      }
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    // Once applicant/user logs in, land them on their appropriate dashboard
    if (currentRole === 'applicant') {
      handleTabChange('applicant_portal');
    } else {
      handleTabChange('overview');
    }
  };

  const handleRegisterSuccess = () => {
    // Once applicant registers, land them on applicant portal
    handleTabChange('applicant_portal');
  };

  const renderContent = () => {
    // Unauthenticated visitor guard: restrict access to protected admin/dashboard tabs
    if (!isLoggedIn && activeTab !== 'public_recruitment' && activeTab !== 'applicant_portal') {
      return (
        <PublicRecruitmentPortal
          onApplyForPost={handleApplyClick}
          onRequestLogin={() => setIsLoginModalOpen(true)}
          onRequestRegister={() => setIsRegisterModalOpen(true)}
        />
      );
    }

    switch (activeTab) {
      case 'public_recruitment':
        return (
          <PublicRecruitmentPortal
            onApplyForPost={handleApplyClick}
            onRequestLogin={() => setIsLoginModalOpen(true)}
            onRequestRegister={() => setIsRegisterModalOpen(true)}
          />
        );
      case 'overview':
      case 'dashboard':
        return <OverviewDashboard setActiveTab={handleTabChange} onNavigate={(tab) => handleTabChange(tab)} />;
      case 'my_jobs':
        return <MyJobsPortal onNavigate={handleTabChange} />;
      case 'drives':
        return <DriveManagement />;
      case 'applications':
        return <ApplicationList />;
      case 'applicant_portal':
        if (!isLoggedIn) {
          return (
            <div className="text-center p-6 sm:p-12 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4 my-4 sm:my-8 max-w-2xl mx-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
                <LogIn className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Applicant Portal Authentication Required</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Please sign in with your registered applicant credentials or create a new profile to complete your online application.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2.5 pt-2">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                >
                  Sign In / Login
                </button>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
                >
                  New Applicant Registration
                </button>
              </div>
            </div>
          );
        }
        return <ApplicantPortal />;
      case 'screening':
        return <ScreeningPortal />;
      case 'doc_verification':
      case 'verification':
        return <DocumentVerificationPortal />;
      case 'interviews':
        return <InterviewPortal />;
      case 'merit':
        return <MeritListPortal />;
      case 'finance':
        return <FinancePortal />;
      case 'analytics':
        return <AnalyticsPortal />;
      case 'audit':
        return <AuditLogViewer />;
      case 'admin':
        return <AdminPortal />;
      default:
        return (
          <PublicRecruitmentPortal
            onApplyForPost={handleApplyClick}
            onRequestLogin={() => setIsLoginModalOpen(true)}
            onRequestRegister={() => setIsRegisterModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme.rootContainer} text-slate-800 flex flex-col`}>
      {/* Top Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar (Desktop + Mobile Slide-Over Drawer) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
        />

        {/* Dynamic View Panel */}
        <main className={`flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 ${theme.mainBg} min-w-0 max-w-full`}>
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">{renderContent()}</div>
        </main>
      </div>

      {/* Global Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Real-time Server Database Transaction Toasts */}
      <ServerTransactionToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <PortalProvider>
      <MainAppContent />
    </PortalProvider>
  );
}
