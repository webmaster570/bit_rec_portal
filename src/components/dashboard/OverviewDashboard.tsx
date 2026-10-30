import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Application } from '../../types';
import { THEME_CONFIGS } from '../../themeStyles';
import { AdmitCardModal } from '../common/AdmitCardModal';
import {
  Megaphone,
  Users,
  CheckCircle2,
  Clock,
  Award,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Download,
  Send,
  Building2,
  FileText,
} from 'lucide-react';

export const OverviewDashboard: React.FC<{
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
}> = ({ setActiveTab, onNavigate }) => {
  const navigate = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else if (onNavigate) {
      onNavigate(tab);
    }
  };

  const { currentRole, currentUser, drives, applications, auditLogs, roles, branding } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];

  const [selectedAdmitCardApp, setSelectedAdmitCardApp] = useState<Application | null>(null);

  // Applicant-tailored Dashboard Overview View
  if (currentRole === 'applicant') {
    const myApplications = applications.filter((app) => {
      if (!currentUser) return false;
      const matchesEmail = currentUser.email && app.applicant.email.toLowerCase() === currentUser.email.toLowerCase();
      const matchesReg = currentUser.regNumber && app.applicant.regNumber === currentUser.regNumber;
      return !!(matchesEmail || matchesReg);
    });

    const totalVacanciesPosted = drives.reduce(
      (sum, drive) => sum + drive.posts.reduce((pSum, post) => pSum + post.vacanciesTotal, 0),
      0
    );

    const eligibleCount = myApplications.filter(
      (a) => a.screeningStatus === 'Eligible' || a.screeningStatus === 'Provisionally Eligible'
    ).length;

    const admitCardsReadyCount = myApplications.filter(
      (a) => a.admitCardIssued || (a.screeningStatus === 'Eligible' && a.rollNumber)
    ).length;

    const isBitTheme = branding.theme === 'bit_mesra';

    return (
      <div className="space-y-6">
        {/* Welcome Banner for Applicant */}
        <div className={`${isBitTheme ? 'bg-white border-2 border-stone-200 ' + (branding.showCardShadow ? 'shadow-sm' : 'shadow-none') : 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-800 border border-indigo-500/30 ' + (branding.showCardShadow ? 'shadow-sm' : 'shadow-none')} rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
          {!isBitTheme && <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />}
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-none ${isBitTheme ? 'bg-stone-50 border border-stone-200 text-[#800000]' : 'bg-white/20 border border-white/30 text-white'} text-[10px] font-black uppercase tracking-[0.2em] mb-3 shadow-xs backdrop-blur-xs`}>
              <Sparkles className={`w-3.5 h-3.5 ${isBitTheme ? 'text-[#800000]' : 'text-pink-200'}`} />
              Candidate Dashboard & Application Hub
            </div>
            <h2 className={`text-2xl sm:text-4xl ${theme.headingFont} ${isBitTheme ? 'text-stone-900' : 'text-white'}`}>
              Welcome, {currentUser?.name || 'Dr. Rohan Deshmukh'}
            </h2>
            <p className={`text-sm ${isBitTheme ? 'text-stone-500' : 'text-indigo-100'} mt-1 max-w-2xl leading-relaxed font-serif italic`}>
              Track your submitted recruitment applications, download examination admit cards, check document verification status, and apply for newly advertised vacancies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => navigate('applicant_portal')}
              className={`${theme.primaryButton} px-6 py-3 flex items-center space-x-2`}
            >
              <Send className="w-4 h-4" />
              <span>Submit New Application</span>
            </button>
            <button
              onClick={() => navigate('public_recruitment')}
              className={`${theme.secondaryButton} px-6 py-3 border-2 flex items-center space-x-2 shadow-sm`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Browse Job Notices</span>
            </button>
          </div>
        </div>

        {/* Applicant Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 flex items-center justify-between border-b-4 border-b-[#800000]`}>
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
                Vacancies Posted
              </span>
              <div className={`text-2xl font-black ${isBitTheme ? 'text-stone-900' : 'text-slate-900'}`}>{totalVacanciesPosted} Positions</div>
              <span className={`text-[10px] ${isBitTheme ? 'text-[#800000]' : 'text-indigo-600'} font-bold uppercase mt-1 flex items-center gap-1`}>
                <Building2 className="w-3 h-3" /> Across {drives.length} Active Drives
              </span>
            </div>
            <div className={`p-3 ${isBitTheme ? 'bg-stone-50 text-[#800000]' : 'bg-indigo-50 text-indigo-600'} border border-stone-100 rounded-none shadow-sm`}>
              <Megaphone className="w-6 h-6" />
            </div>
          </div>

              {myApplications.length > 0 && (
                <div
                  onClick={() => navigate('my_jobs')}
                  className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 flex items-center justify-between border-b-4 border-b-[#800000] cursor-pointer hover:bg-stone-50 transition-colors`}
                >
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
                      My Applied Jobs
                    </span>
                    <div className={`text-2xl font-black ${isBitTheme ? 'text-stone-900' : 'text-slate-900'}`}>{myApplications.length} Positions</div>
                    <span className={`text-[10px] ${isBitTheme ? 'text-[#800000]' : 'text-purple-600'} font-bold uppercase mt-1 flex items-center gap-1`}>
                      <Briefcase className="w-3.5 h-3.5" /> View Status &rarr;
                    </span>
                  </div>
                  <div className={`p-3 ${isBitTheme ? 'bg-stone-50 text-[#800000]' : 'bg-purple-50 text-purple-600'} border border-stone-100 rounded-none shadow-sm`}>
                    <Briefcase className="w-6 h-6" />
                  </div>
                </div>
              )}

              <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 flex items-center justify-between border-b-4 border-b-[#800000]`}>
                <div>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
                    Screened / Shortlisted
                  </span>
                  <div className={`text-2xl font-black ${isBitTheme ? 'text-emerald-700' : 'text-emerald-600'}`}>{eligibleCount}</div>
                  <span className={`text-[10px] ${isBitTheme ? 'text-[#800000]' : 'text-emerald-600'} font-bold uppercase mt-1 flex items-center gap-1`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Eligible Candidates
                  </span>
                </div>
                <div className={`p-3 ${isBitTheme ? 'bg-stone-50 text-[#800000]' : 'bg-emerald-50 text-emerald-600'} border border-stone-100 rounded-none shadow-sm`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 flex items-center justify-between border-b-4 border-b-[#800000]`}>
                <div>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
                    Admit Cards Ready
                  </span>
                  <div className={`text-2xl font-black ${isBitTheme ? 'text-stone-900' : 'text-pink-600'}`}>{admitCardsReadyCount}</div>
                  <span className={`text-[10px] ${isBitTheme ? 'text-[#800000]' : 'text-pink-600'} font-bold uppercase mt-1 flex items-center gap-1`}>
                    <Download className="w-3.5 h-3.5" /> Hall Tickets
                  </span>
                </div>
                <div className={`p-3 ${isBitTheme ? 'bg-stone-50 text-[#800000]' : 'bg-pink-50 text-pink-600'} border border-stone-100 rounded-none shadow-sm`}>
                  <Download className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* My Jobs & Application Status Panel */}
            <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-8 border-t-4 border-t-[#800000]`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-6 mb-8">
                <div className="space-y-1">
                  <h3 className={`text-xl ${theme.headingFont} flex items-center gap-3`}>
                    <Briefcase className="w-6 h-6" />
                    My Job Applications
                  </h3>
                  <p className="text-sm text-stone-500 font-serif italic">
                    Real-time tracking of your submitted recruitment applications.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('my_jobs')}
                    className={`${theme.secondaryButton} px-4 py-2 text-[10px] flex items-center gap-2`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>View Full Ledger</span>
                  </button>
                </div>
              </div>

              {myApplications.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Job Applications Submitted Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Browse current recruitment drives and submit your online application to view status tracking here.
                  </p>
                  <button
                    onClick={() => navigate('applicant_portal')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                  >
                    Apply Online Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition shadow-2xs space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                          {app.applicationNo}
                        </span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                          {app.advtNumber}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">{app.postTitle}</h4>
                      <p className="text-xs text-slate-500 font-medium">{app.departmentName}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-3 py-1 rounded-full font-extrabold border shadow-2xs ${
                        app.screeningStatus === 'Eligible'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : app.screeningStatus === 'Ineligible'
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        Screening: {app.screeningStatus}
                      </span>

                      <span className={`text-xs px-3 py-1 rounded-full font-extrabold border shadow-2xs ${
                        app.paymentStatus === 'Paid' || app.paymentStatus === 'Exempted'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}>
                        Payment: {app.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Submission Date</span>
                      <span className="font-extrabold text-slate-800">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Doc Verification</span>
                      <span className="font-bold text-slate-800">{app.docVerificationStatus}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Exam Roll No</span>
                      <span className="font-mono font-bold text-indigo-600">{app.rollNumber || 'Under Generation'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Interview Status</span>
                      <span className="font-bold text-purple-600">{app.interviewDateTime ? 'Scheduled' : 'Awaiting Schedule'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="text-[11px] text-slate-500 font-medium">
                      {app.screeningRemarks && app.screeningRemarks.length > 0 && (
                        <span><span className="font-bold text-slate-700">Remarks:</span> {app.screeningRemarks[app.screeningRemarks.length - 1].remarks}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {(app.admitCardIssued || (app.screeningStatus === 'Eligible' && app.rollNumber)) && (
                        <button
                          onClick={() => setSelectedAdmitCardApp(app)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Hall Ticket</span>
                        </button>
                      )}

                      <button
                        onClick={() => navigate('my_jobs')}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition flex items-center space-x-1"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>View Details in My Jobs</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vacancies Posted Section */}
        <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                Active Advertised Vacancies Posted
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore sanctioned faculty and staff positions currently open across university departments.
              </p>
            </div>
            <button
              onClick={() => navigate('public_recruitment')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition-colors"
            >
              View Public Advertisements <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.flatMap((d) =>
              d.posts.map((p) => (
                <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 transition shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                        {d.advtNumber}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {p.vacanciesTotal} Sanctioned Vacancies
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 mb-1">{p.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold mb-3">{p.departmentName}</p>

                    <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-bold bg-white p-2 rounded-xl border border-slate-200 my-2">
                      <div className="bg-slate-50 p-1 rounded">UR: {p.vacanciesBreakdown.UR}</div>
                      <div className="bg-slate-50 p-1 rounded">OBC: {p.vacanciesBreakdown.OBC}</div>
                      <div className="bg-slate-50 p-1 rounded">SC: {p.vacanciesBreakdown.SC}</div>
                      <div className="bg-slate-50 p-1 rounded">ST: {p.vacanciesBreakdown.ST}</div>
                      <div className="bg-slate-50 p-1 rounded">EWS: {p.vacanciesBreakdown.EWS}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
                    <span className="text-[11px] font-mono font-bold text-slate-700">{p.payScale}</span>
                    <button
                      onClick={() => navigate('applicant_portal')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admit Card Modal */}
        {selectedAdmitCardApp && (
          <AdmitCardModal
            application={selectedAdmitCardApp}
            onClose={() => setSelectedAdmitCardApp(null)}
          />
        )}
      </div>
    );
  }

  const totalDrives = drives.length;
  const activeDrives = drives.filter((d) => d.status === 'applications_open' || d.status === 'screening_in_progress');
  const totalApps = applications.length;
  const pendingScreening = applications.filter((a) => a.screeningStatus === 'Pending').length;
  const eligibleApps = applications.filter((a) => a.screeningStatus === 'Eligible').length;
  const pendingDocCheck = applications.filter((a) => a.docVerificationStatus === 'Pending').length;
  const selectedCount = applications.filter((a) => a.selectedStatus === 'Selected').length;
  const totalFeeCollected = applications.reduce((sum, a) => sum + (a.paymentStatus === 'Paid' ? a.feeAmount : 0), 0);

  const activeRoleObj = roles.find((r) => r.id === currentRole);

  const lifecycleStages = [
    { title: 'Recruitment Planning', desc: 'Define drives, departments, and posts', tab: 'drives', count: totalDrives },
    { title: 'Advertisement', desc: 'Publish notifications & criteria', tab: 'drives', count: activeDrives.length },
    { title: 'Online Application', desc: 'Candidate registration & forms', tab: 'applicant_portal', count: totalApps },
    { title: 'Applicant Screening', desc: 'Check eligibility & age limits', tab: 'screening', count: pendingScreening, alert: pendingScreening > 0 },
    { title: 'Document Verification', desc: 'Audit uploaded degree certs', tab: 'doc_verification', count: pendingDocCheck },
    { title: 'Test / Interview', desc: 'Schedule hall tickets & grade candidates', tab: 'interviews', count: eligibleApps },
    { title: 'Merit & Selection', desc: 'Weighted rank & reservation quota', tab: 'merit', count: selectedCount },
    { title: 'Offer / Appointment', desc: 'Issue formal offer letters', tab: 'merit', count: selectedCount },
  ];

  const isBitTheme = branding.theme === 'bit_mesra';

  return (
    <div className="space-y-6">
      {/* Welcome & Role Banner */}
      <div className={`${isBitTheme ? 'bg-white border-2 border-stone-200 ' + (branding.showCardShadow ? 'shadow-sm' : 'shadow-none') : 'bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 border border-indigo-400/30 ' + (branding.showCardShadow ? 'shadow-sm' : 'shadow-none')} rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
        {!isBitTheme && <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />}
        <div className="relative z-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-none ${isBitTheme ? 'bg-stone-50 border border-stone-200 text-[#800000]' : 'bg-white/20 border border-white/30 text-white'} text-[10px] font-black uppercase tracking-[0.2em] mb-3 shadow-xs backdrop-blur-xs`}>
            <Sparkles className={`w-3.5 h-3.5 ${isBitTheme ? 'text-[#800000]' : 'text-pink-200'}`} />
            Centralized Recruitment Command Center
          </div>
          <h2 className={`text-2xl sm:text-4xl ${theme.headingFont} ${isBitTheme ? 'text-stone-900' : 'text-white'}`}>
            Welcome, {activeRoleObj?.name}
          </h2>
          <p className={`text-sm ${isBitTheme ? 'text-stone-500' : 'text-indigo-100'} mt-1 max-w-2xl leading-relaxed font-serif italic`}>
            You are operating with <span className={`font-bold ${isBitTheme ? 'text-[#800000]' : 'text-white underline decoration-pink-300'} underline-offset-2`}>{activeRoleObj?.name}</span> privileges. Select any workflow module from the left menu.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 relative z-10">
          <button
            onClick={() => navigate('drives')}
            className={`${theme.primaryButton} px-6 py-3 flex items-center space-x-2`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Manage Drives</span>
          </button>
          <button
            onClick={() => navigate('applicant_portal')}
            className={`${theme.secondaryButton} px-6 py-3 border-2 flex items-center space-x-2 shadow-sm`}
          >
            <Users className="w-4 h-4" />
            <span>Submit Application</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 flex items-center justify-between border-b-4 border-b-[#800000]`}>
          <div>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
              Active Drives
            </span>
            <div className={`text-2xl font-black ${isBitTheme ? 'text-stone-900' : 'text-slate-900'}`}>{activeDrives.length} / {totalDrives}</div>
            <span className={`text-[10px] ${isBitTheme ? 'text-[#800000]' : 'text-emerald-600'} font-bold uppercase mt-1 flex items-center gap-1`}>
              <TrendingUp className="w-3 h-3" /> Live Notifications
            </span>
          </div>
          <div className={`p-3.5 ${isBitTheme ? 'bg-stone-50 text-[#800000]' : 'bg-indigo-50 text-indigo-600'} border border-stone-100 rounded-none shadow-sm`}>
            <Megaphone className="w-6 h-6" />
          </div>
        </div>

        <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 flex items-center justify-between border-b-4 border-b-[#800000]`}>
          <div>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
              Applications Received
            </span>
            <div className={`text-2xl font-black ${isBitTheme ? 'text-stone-900' : 'text-slate-900'}`}>{totalApps}</div>
            <span className={`text-[10px] ${isBitTheme ? 'text-[#800000]' : 'text-purple-600'} font-bold uppercase mt-1`}> Total Responses</span>
          </div>
          <div className={`p-3.5 ${isBitTheme ? 'bg-stone-50 text-[#800000]' : 'bg-purple-50 text-purple-600'} border border-stone-100 rounded-none shadow-sm`}>
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 flex items-center justify-between border-b-4 border-b-[#800000]`}>
          <div>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
              Pending Screening
            </span>
            <div className={`text-2xl font-black ${isBitTheme ? 'text-amber-700' : 'text-amber-600'}`}>{pendingScreening}</div>
            <span className={`text-[10px] ${isBitTheme ? 'text-[#800000]' : 'text-slate-500'} font-bold uppercase mt-1`}>Awaiting Review</span>
          </div>
          <div className={`p-3.5 ${isBitTheme ? 'bg-stone-50 text-[#800000]' : 'bg-amber-50 text-amber-600'} border border-stone-100 rounded-none shadow-sm`}>
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 flex items-center justify-between border-b-4 border-b-[#800000]`}>
          <div>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
              Fee Collections
            </span>
            <div className={`text-2xl font-black ${isBitTheme ? 'text-emerald-700' : 'text-emerald-600'}`}>₹{totalFeeCollected.toLocaleString('en-IN')}</div>
            <span className={`text-[10px] ${isBitTheme ? 'text-[#800000]' : 'text-teal-600'} font-bold uppercase mt-1`}>Reconciled gateway</span>
          </div>
          <div className={`p-3.5 ${isBitTheme ? 'bg-stone-50 text-[#800000]' : 'bg-emerald-50 text-emerald-600'} border border-stone-100 rounded-none shadow-sm`}>
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recruitment Lifecycle Phase Navigation Grid */}
      <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-8 border-t-4 border-t-[#800000]`}>
        <div className="flex items-center justify-between pb-6 border-b border-stone-100 mb-8">
          <div>
            <h3 className={`text-xl ${theme.headingFont}`}>Complete Recruitment Lifecycle Workflow</h3>
            <p className="text-sm text-stone-500 font-serif italic mt-1">
              Select an operational phase to manage the specific recruitment stage.
            </p>
          </div>
          <span className={`text-[10px] font-black px-4 py-1.5 ${isBitTheme ? 'bg-stone-50 text-[#800000] border border-stone-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'} rounded-none uppercase tracking-widest shadow-sm`}>
            8 Integrated Stages
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {lifecycleStages.map((stage, idx) => (
            <div
              key={idx}
              onClick={() => navigate(stage.tab)}
              className={`group ${isBitTheme ? 'bg-[#FBF9F5] border-stone-200 hover:border-[#800000]' : 'bg-slate-50 border-slate-200 hover:border-indigo-400'} border rounded-none p-5 cursor-pointer transition-all duration-300 relative ${branding.showCardShadow ? 'shadow-sm hover:shadow-lg' : 'shadow-none'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-8 h-8 rounded-none ${isBitTheme ? 'bg-[#800000]' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} text-white font-black text-sm flex items-center justify-center shadow-sm`}>
                  {idx + 1}
                </span>
                {stage.alert && (
                  <span className="px-2 py-0.5 rounded-none text-[9px] font-black bg-rose-600 text-white uppercase tracking-widest shadow-sm animate-pulse">
                    Action Required
                  </span>
                )}
              </div>
              <h4 className={`text-sm font-black uppercase tracking-tight ${isBitTheme ? 'text-stone-900 group-hover:text-[#800000]' : 'text-slate-900 group-hover:text-indigo-600'} transition-colors`}>
                {stage.title}
              </h4>
              <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed font-serif italic">{stage.desc}</p>
              <div className={`mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${isBitTheme ? 'text-[#800000]' : 'text-indigo-600'} pt-3 border-t border-stone-100`}>
                <span>{stage.count} Records</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Active Drives & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Recruitment Drives Summary */}
        <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} lg:col-span-2 p-6`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              Active Recruitment Drives & Positions
            </h3>
            <button
              onClick={() => navigate('drives')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition-colors"
            >
              View All Drives <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {drives.map((drive) => (
              <div
                key={drive.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 transition shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold mr-2 shadow-2xs">
                      {drive.advtNumber}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 inline">{drive.title}</h4>
                  </div>
                  <span className="text-xs px-3 py-0.5 rounded-full font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 self-start sm:self-auto shadow-2xs">
                    {drive.status.toUpperCase().replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 my-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Closing Date</span>
                    <span className="font-extrabold text-slate-900">{drive.closingDate}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Exam Date</span>
                    <span className="font-extrabold text-slate-900">{drive.examDate || 'TBD'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Configured Posts</span>
                    <span className="font-extrabold text-slate-900">{drive.posts.length} Posts</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Applications</span>
                    <span className="font-extrabold text-pink-600">{drive.totalApplicationsCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center space-x-2">
                    {drive.posts.slice(0, 2).map((p) => (
                      <span key={p.id} className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg border border-indigo-200 font-medium">
                        {p.title} ({p.vacanciesTotal} posts)
                      </span>
                    ))}
                    {drive.posts.length > 2 && (
                      <span className="text-[10px] text-slate-500">+{drive.posts.length - 2} more</span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('drives')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Audit Trail Panel */}
        <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Live Audit Logs
              </h3>
              {currentRole === 'super_admin' && (
                <button
                  onClick={() => navigate('audit')}
                  className="text-xs text-purple-600 hover:text-purple-800 font-bold transition-colors"
                >
                  View Full Audit
                </button>
              )}
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-bold text-indigo-700">{log.userName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-900 font-bold leading-snug">{log.action}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              System Audit Logging is 100% Active. All actions recorded with IP & Timestamp.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
