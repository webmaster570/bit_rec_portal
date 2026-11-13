import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Application, ApplicationStage } from '../../types';
import { AdmitCardModal } from '../common/AdmitCardModal';
import { OfferLetterModal } from '../common/OfferLetterModal';
import { ApplicationPreviewModal } from '../applications/ApplicationPreviewModal';
import {
  Briefcase,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Award,
  Send,
  Building2,
  Calendar,
  X,
  Printer,
  FileText,
  CreditCard,
  User,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Layers,
  HelpCircle,
  LayoutList,
  LayoutGrid,
  RotateCcw,
  Check,
  MapPin,
  Hash,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface MyJobsPortalProps {
  onNavigate?: (tab: string) => void;
}

export const MyJobsPortal: React.FC<MyJobsPortalProps> = ({ onNavigate }) => {
  const { applications, currentUser, drives, setEditingAppId, setActiveTab } = usePortal();

  // Filter applications strictly for current applicant
  const myApplications = applications.filter((app) => {
    if (!currentUser) return false;
    const matchesEmail = currentUser.email && app.applicant.email.toLowerCase() === currentUser.email.toLowerCase();
    const matchesReg = currentUser.regNumber && app.applicant.regNumber === currentUser.regNumber;
    return !!(matchesEmail || matchesReg);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedDriveFilter, setSelectedDriveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'auto' | 'table' | 'cards'>('auto');

  // Modals
  const [selectedAppDetail, setSelectedAppDetail] = useState<Application | null>(null);
  const [showAdmitCardModal, setShowAdmitCardModal] = useState<Application | null>(null);
  const [showOfferModal, setShowOfferModal] = useState<Application | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'academics' | 'documents' | 'status'>('profile');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewApp, setPreviewApp] = useState<Application | null>(null);

  // Filter logic
  const filteredApps = myApplications.filter((app) => {
    const matchesSearch =
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.advtNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage =
      selectedStageFilter === 'all' ||
      (selectedStageFilter === 'eligible' && (app.screeningStatus === 'Eligible' || app.screeningStatus === 'Provisionally Eligible')) ||
      (selectedStageFilter === 'ineligible' && app.screeningStatus === 'Ineligible') ||
      (selectedStageFilter === 'selected' && (app.stage === 'selected' || app.stage === 'offer_issued' || app.stage === 'offer_accepted')) ||
      app.stage === selectedStageFilter;

    const matchesDrive = selectedDriveFilter === 'all' || app.driveId === selectedDriveFilter;

    return matchesSearch && matchesStage && matchesDrive;
  });

  // Metrics
  const totalApplied = myApplications.length;
  const eligibleCount = myApplications.filter(
    (a) => a.screeningStatus === 'Eligible' || a.screeningStatus === 'Provisionally Eligible'
  ).length;
  const admitCardsReady = myApplications.filter(
    (a) => a.admitCardIssued || (a.screeningStatus === 'Eligible' && a.rollNumber)
  ).length;
  const offersCount = myApplications.filter(
    (a) => a.stage === 'offer_issued' || a.stage === 'offer_accepted' || a.stage === 'selected'
  ).length;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStageFilter('all');
    setSelectedDriveFilter('all');
  };

  const getStageBadge = (stage: ApplicationStage, screeningStatus?: string, compact = false) => {
    if (stage === 'offer_issued' || stage === 'offer_accepted') {
      return (
        <span className={`rounded-full font-extrabold bg-emerald-100 text-emerald-800  inline-flex items-center gap-1 shadow-2xs ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}>
          <Award className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>{stage === 'offer_accepted' ? 'Offer Accepted' : 'Offer Issued'}</span>
        </span>
      );
    }
    if (stage === 'selected') {
      return (
        <span className={`rounded-full font-extrabold bg-purple-100 text-purple-800 border border-purple-300 inline-flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}>
          <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
          <span>Selected in Merit</span>
        </span>
      );
    }
    if (stage === 'interview_scheduled' || stage === 'test_scheduled') {
      return (
        <span className={`rounded-full font-bold bg-indigo-50 text-indigo-700  inline-flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}>
          <Clock className="w-3 h-3 text-indigo-600 shrink-0" />
          <span>Interview / Exam Scheduled</span>
        </span>
      );
    }
    if (screeningStatus === 'Eligible') {
      return (
        <span className={`rounded-full font-bold bg-emerald-50 text-emerald-700  inline-flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Screened Eligible</span>
        </span>
      );
    }
    if (screeningStatus === 'Ineligible') {
      return (
        <span className={`rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}>
          <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
          <span>Ineligible</span>
        </span>
      );
    }
    if (stage === 'draft') {
      return (
        <span className={`rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}>
          <FileText className="w-3 h-3 text-slate-500 shrink-0" />
          <span>Draft / In-Progress</span>
        </span>
      );
    }
    return (
      <span className={`rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}>
        <Clock className="w-3 h-3 text-blue-600 shrink-0" />
        <span>Submitted</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Title & Banner (Responsive Mobile Stack) */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 border border-indigo-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 text-white border border-white/30 text-[11px] sm:text-xs font-bold backdrop-blur-xs">
            <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-200" />
            Applied Vacancies & Tracking
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            My Applied Jobs
          </h2>
          <p className="text-[11px] sm:text-xs md:text-sm text-indigo-100 max-w-2xl leading-relaxed">
            Review all your submitted recruitment applications, verify committee status, inspect detailed profiles, download examination hall tickets, and review appointment offers across all devices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 relative z-10 w-full sm:w-auto">
          {onNavigate && (
            <button
              onClick={() => onNavigate('applicant_portal')}
              className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-indigo-900 font-extrabold text-xs shadow-sm transition flex items-center space-x-2"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>Apply for New Post</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Counters (2-col on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4.5 border-l-4 border-l-indigo-600 flex items-center justify-between shadow-2xs">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block truncate">
              Total Applied
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalApplied}</div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium block truncate">Applications</span>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl  shrink-0 ml-2">
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4.5 border-l-4 border-l-emerald-600 flex items-center justify-between shadow-2xs">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block truncate">
              Eligible / Cleared
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{eligibleCount}</div>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 font-medium block truncate">Cleared Review</span>
          </div>
          <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 shrink-0 ml-2">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4.5 border-l-4 border-l-pink-600 flex items-center justify-between shadow-2xs">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block truncate">
              Admit Cards
            </span>
            <div className="text-xl sm:text-2xl font-black text-pink-600 mt-0.5">{admitCardsReady}</div>
            <span className="text-[9px] sm:text-[10px] text-pink-600 font-medium block truncate">Hall Tickets</span>
          </div>
          <div className="p-2 sm:p-3 bg-pink-50 text-pink-600 rounded-xl border border-pink-200 shrink-0 ml-2">
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4.5 border-l-4 border-l-purple-600 flex items-center justify-between shadow-2xs">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block truncate">
              Offers & Merit
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-600 mt-0.5">{offersCount}</div>
            <span className="text-[9px] sm:text-[10px] text-purple-600 font-medium block truncate">Appointments</span>
          </div>
          <div className="p-2 sm:p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200 shrink-0 ml-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Responsive Filter & Search Bar */}
      <div className="glass-card p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 sm:top-3" />
          <input
            type="text"
            placeholder="Search by Post, App No, Dept, Advt No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="all">All Stages & Statuses</option>
            <option value="draft">Draft / In-Progress</option>
            <option value="submitted">Submitted</option>
            <option value="eligible">Screened Eligible</option>
            <option value="ineligible">Ineligible</option>
            <option value="interview_scheduled">Interview / Exam Scheduled</option>
            <option value="selected">Merit Selected / Offers</option>
          </select>

          <select
            value={selectedDriveFilter}
            onChange={(e) => setSelectedDriveFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 w-full sm:w-auto truncate max-w-full sm:max-w-xs"
          >
            <option value="all">All Recruitment Drives</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.advtNumber})
              </option>
            ))}
          </select>

          {(searchTerm || selectedStageFilter !== 'all' || selectedDriveFilter !== 'all') && (
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="sm:hidden text-xs">Reset Filters</span>
            </button>
          )}

          {/* View Mode Switcher (Desktop & Mobile optional) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table' || viewMode === 'auto'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* No Results Empty State */}
      {filteredApps.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 sm:p-12 text-center text-slate-500 border border-slate-200">
          <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Applied Jobs Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedStageFilter !== 'all' || selectedDriveFilter !== 'all'
              ? 'No applications match your active search filters. Try clearing filters.'
              : "You haven't submitted any recruitment applications yet."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {(searchTerm || selectedStageFilter !== 'all' || selectedDriveFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Clear Filters
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('applicant_portal')}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Apply Online Now
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Responsive Card Stack (< lg screens or when cards mode selected) */}
          <div className={`${viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'block lg:hidden'} space-y-3.5`}>
            {filteredApps.map((app) => {
              const hasAdmitCard =
                app.admitCardIssued || (app.screeningStatus === 'Eligible' && app.rollNumber);
              const hasOffer =
                app.stage === 'offer_issued' || app.stage === 'offer_accepted';

              return (
                <div
                  key={app.id}
                  className="glass-card rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 bg-white hover:border-indigo-300 transition"
                >
                  {/* Top Bar: App No & Stage Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded ">
                        {app.applicationNo}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {getStageBadge(app.stage, app.screeningStatus, true)}
                    </div>
                  </div>

                  {/* Position Title & Department */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {app.postTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mt-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{app.departmentName}</span>
                    </div>
                  </div>

                  {/* Key Metadata Badges */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Advt Code</span>
                      <span className="font-mono font-bold text-slate-700 truncate block">
                        {app.advtNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Category / Fee</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {app.applicant.category} • <strong className="text-emerald-700">{app.paymentStatus}</strong>
                      </span>
                    </div>
                    {app.rollNumber ? (
                      <div className="col-span-2 border-t border-slate-200/60 pt-1.5 mt-0.5 flex items-center justify-between">
                        <span className="text-slate-500 text-[10px]">Exam Roll No:</span>
                        <span className="font-mono font-bold text-indigo-700 text-xs">{app.rollNumber}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Action Buttons Toolbar (Touch Optimized) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {/* View Details Button */}
                    <button
                      onClick={() => {
                        setSelectedAppDetail(app);
                        setActiveModalTab('profile');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    {/* Complete Draft Button */}
                    {app.stage === 'draft' && (
                      <button
                        onClick={() => {
                          setEditingAppId(app.id);
                          if (onNavigate) onNavigate('applicant_portal');
                          else setActiveTab('applicant_portal');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Complete Application</span>
                      </button>
                    )}

                    {/* Download Admit Card */}
                    {hasAdmitCard && (
                      <button
                        onClick={() => setShowAdmitCardModal(app)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-98 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Admit Card</span>
                      </button>
                    )}

                    {/* View Offer Letter */}
                    {hasOffer && (
                      <button
                        onClick={() => setShowOfferModal(app)}
                        className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 active:scale-98 text-purple-700 text-xs font-bold border border-purple-200 flex items-center justify-center gap-1.5 transition"
                      >
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <span>Offer Letter</span>
                      </button>
                    )}

                    {/* Preview Form Button for Submitted Apps */}
                    {app.stage !== 'draft' && (
                      <button
                        onClick={() => {
                          setPreviewApp(app);
                          setIsPreviewOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Preview Form</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP & TABLET VIEW: Interactive Tabular Ledger */}
          <div className={`${viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden lg:block'} glass-card rounded-2xl overflow-hidden shadow-xs border border-slate-200`}>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-4">App No / Reference</th>
                    <th className="p-3.5">Applied Position & Department</th>
                    <th className="p-3.5">Drive & Advertisement</th>
                    <th className="p-3.5">Category / Fee</th>
                    <th className="p-3.5">Recruitment Stage</th>
                    <th className="p-3.5">Exam / Roll No</th>
                    <th className="p-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredApps.map((app) => {
                    const hasAdmitCard =
                      app.admitCardIssued || (app.screeningStatus === 'Eligible' && app.rollNumber);
                    const hasOffer =
                      app.stage === 'offer_issued' || app.stage === 'offer_accepted';

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. App No & Date */}
                        <td className="p-3.5 pl-4 font-mono">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded  text-xs">
                              {app.applicationNo}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* 2. Position & Department */}
                        <td className="p-3.5">
                          <span className="font-extrabold text-slate-900 text-sm block">
                            {app.postTitle}
                          </span>
                          <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                            {app.departmentName}
                          </span>
                        </td>

                        {/* 3. Drive & Advt */}
                        <td className="p-3.5">
                          <span className="font-medium text-slate-800 block truncate max-w-[180px]" title={app.driveTitle}>
                            {app.driveTitle}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 font-semibold block">
                            Advt: {app.advtNumber}
                          </span>
                        </td>

                        {/* 4. Category & Fee */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {app.applicant.category} {app.applicant.isPwD ? '(PwD)' : ''}
                            </span>
                            <span
                              className={`block text-[10px] font-bold ${
                                app.paymentStatus === 'Paid'
                                  ? 'text-emerald-700'
                                  : app.paymentStatus === 'Exempted'
                                  ? 'text-blue-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              Fee: {app.paymentStatus}
                            </span>
                          </div>
                        </td>

                        {/* 5. Stage */}
                        <td className="p-3.5">
                          {getStageBadge(app.stage, app.screeningStatus)}
                          {app.screeningRemarks && app.screeningRemarks.length > 0 && (
                            <span className="text-[10px] text-slate-500 block mt-1 truncate max-w-[160px]" title={app.screeningRemarks[app.screeningRemarks.length - 1].remarks}>
                              Note: {app.screeningRemarks[app.screeningRemarks.length - 1].remarks}
                            </span>
                          )}
                        </td>

                        {/* 6. Roll No & Center */}
                        <td className="p-3.5 font-mono">
                          {app.rollNumber ? (
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">{app.rollNumber}</span>
                              <span className="text-[10px] text-slate-500 block truncate max-w-[130px]" title={app.examCenter || 'Exam Center Assigned'}>
                                {app.examCenter || 'Center Assigned'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic font-sans">
                              {app.screeningStatus === 'Eligible' ? 'Roll No Processing' : 'Pending Review'}
                            </span>
                          )}
                        </td>

                        {/* 7. Action Buttons */}
                        <td className="p-3.5 pr-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* View Details Button */}
                          <button
                            onClick={() => {
                              setSelectedAppDetail(app);
                              setActiveModalTab('profile');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 transition hover:scale-102"
                            title="View Full Application Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>

                          {/* Complete Draft Button */}
                          {app.stage === 'draft' && (
                            <button
                              onClick={() => {
                                setEditingAppId(app.id);
                                if (onNavigate) onNavigate('applicant_portal');
                                else setActiveTab('applicant_portal');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 transition hover:scale-102"
                              title="Resume and Complete Draft Application"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          )}

                          {/* Download Hall Ticket */}
                          {hasAdmitCard && (
                            <button
                              onClick={() => setShowAdmitCardModal(app)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 inline-flex items-center gap-1 transition"
                              title="Download Admit Card / Hall Ticket"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden xl:inline">Admit Card</span>
                            </button>
                          )}

                          {/* View Offer Letter */}
                          {hasOffer && (
                            <button
                              onClick={() => setShowOfferModal(app)}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 inline-flex items-center gap-1 transition"
                              title="View Formal Appointment Offer Letter"
                            >
                              <Award className="w-3.5 h-3.5 text-purple-600" />
                              <span className="hidden xl:inline">Offer Letter</span>
                            </button>
                          )}

                          {/* Preview Form Button for Submitted Apps */}
                          {app.stage !== 'draft' && (
                            <button
                              onClick={() => {
                                setPreviewApp(app);
                                setIsPreviewOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 inline-flex items-center gap-1 transition"
                              title="Preview and Print Full Application Form"
                            >
                              <Printer className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="hidden xl:inline">Preview Form</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* FULLY RESPONSIVE APPLICATION "VIEW DETAILS" MODAL */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 gap-3 shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={selectedAppDetail.applicant.photoUrl}
                  alt={selectedAppDetail.applicant.fullName}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl object-cover border-2 border-indigo-600 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                      {selectedAppDetail.applicant.fullName}
                    </h3>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold ">
                      {selectedAppDetail.applicationNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">
                    Position: <strong className="text-indigo-700 font-bold">{selectedAppDetail.postTitle}</strong> ({selectedAppDetail.departmentName})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => {
                    setPreviewApp(selectedAppDetail);
                    setIsPreviewOpen(true);
                  }}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                  title="Print Full Application Form"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview Form</span>
                </button>
                <button
                  onClick={() => setSelectedAppDetail(null)}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stage Progress Stepper (Horizontally scrollable on mobile) */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-none">
              <div className="flex items-center justify-between min-w-[500px] text-xs">
                {[
                  { step: 'Applied', done: true },
                  {
                    step: 'Screening',
                    done: selectedAppDetail.screeningStatus === 'Eligible' || selectedAppDetail.screeningStatus === 'Ineligible',
                    status: selectedAppDetail.screeningStatus,
                  },
                  {
                    step: 'Doc Verification',
                    done: selectedAppDetail.docVerificationStatus === 'verified',
                    status: selectedAppDetail.docVerificationStatus,
                  },
                  {
                    step: 'Interview / Test',
                    done: selectedAppDetail.interviewDateTime || selectedAppDetail.rollNumber,
                  },
                  {
                    step: 'Merit Selection',
                    done: selectedAppDetail.stage === 'selected' || selectedAppDetail.stage === 'offer_issued' || selectedAppDetail.stage === 'offer_accepted',
                  },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0 ${
                        s.done
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {s.done ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${s.done ? 'text-slate-900' : 'text-slate-400'}`}>
                      {s.step}
                    </span>
                    {idx < 4 && <ChevronRight className="w-3 h-3 text-slate-300 mx-1 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Tabs Inside Modal (Touch Friendly Scrollable) */}
            <div className="flex border-b border-slate-200 px-3 sm:px-6 bg-white gap-1 sm:gap-2 text-xs font-bold text-slate-600 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { id: 'profile', label: 'Profile Details', icon: User },
                { id: 'academics', label: 'Qualifications', icon: GraduationCap },
                { id: 'research', label: 'Research & Misc', icon: FileText },
                { id: 'documents', label: 'Documents & Fee', icon: CreditCard },
                { id: 'status', label: 'Evaluation Status', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveModalTab(tab.id as any)}
                    className={`py-2.5 sm:py-3 px-2 sm:px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition text-xs ${
                      isActive
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto text-xs text-slate-700 space-y-4 sm:space-y-6">
              {/* TAB 1: Profile & Applied Post */}
              {activeModalTab === 'profile' && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Position Details Card */}
                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      Applied Position Summary
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Position Title</span>
                        <span className="font-extrabold text-slate-900">{selectedAppDetail.postTitle}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Department</span>
                        <span className="font-semibold text-slate-900">{selectedAppDetail.departmentName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Recruitment Drive</span>
                        <span className="font-semibold text-slate-900">{selectedAppDetail.driveTitle}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Advt Number</span>
                        <span className="font-mono font-bold text-indigo-600">{selectedAppDetail.advtNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Personal Demographics */}
                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-indigo-600" />
                      Personal Demographics
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Full Name</span>
                        <span className="font-bold text-slate-900">{selectedAppDetail.applicant.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Father's Name</span>
                        <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.fatherName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Mother's Name</span>
                        <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.motherName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Date of Birth</span>
                        <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.dob}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Gender</span>
                        <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.gender}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Reservation Category</span>
                        <span className="font-bold text-indigo-700">{selectedAppDetail.applicant.category} {selectedAppDetail.applicant.isPwD ? '(PwD)' : ''}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Email Address</span>
                        <span className="font-mono font-semibold text-slate-900 break-all">{selectedAppDetail.applicant.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Mobile Number</span>
                        <span className="font-mono font-semibold text-slate-900">{selectedAppDetail.applicant.mobile}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 text-[11px] block">ID Proof Document</span>
                        <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.idProofType}: {selectedAppDetail.applicant.idProofNumber}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 text-[11px] block">Communication Address</span>
                        <span className="font-medium text-slate-900 leading-tight">
                          {selectedAppDetail.applicant.correspondenceLine1 ? (
                            <>
                              {[
                                selectedAppDetail.applicant.correspondenceLine1,
                                selectedAppDetail.applicant.correspondenceLine2,
                                selectedAppDetail.applicant.correspondenceLandmark && `Landmark: ${selectedAppDetail.applicant.correspondenceLandmark}`,
                                selectedAppDetail.applicant.correspondenceCity,
                                selectedAppDetail.applicant.correspondenceDistrict,
                                selectedAppDetail.applicant.correspondenceState,
                              ].filter(Boolean).join(', ')}
                              {selectedAppDetail.applicant.correspondencePin && ` - ${selectedAppDetail.applicant.correspondencePin}`}
                            </>
                          ) : (
                            `${selectedAppDetail.applicant.address}, ${selectedAppDetail.applicant.district}, ${selectedAppDetail.applicant.state} - ${selectedAppDetail.applicant.pin}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Academics & Experience */}
              {activeModalTab === 'academics' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      Academic Qualifications
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[480px]">
                        <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2">Degree</th>
                            <th className="py-2">Specialization</th>
                            <th className="py-2">University / Board</th>
                            <th className="py-2">Year</th>
                            <th className="py-2">Marks / CGPA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedAppDetail.academics.map((acad, idx) => (
                            <tr key={idx}>
                              <td className="py-2 font-bold text-slate-900">{acad.degree}</td>
                              <td className="py-2 text-slate-700">{acad.fieldOfStudy}</td>
                              <td className="py-2 text-slate-600">{acad.boardOrUniversity}</td>
                              <td className="py-2 text-slate-700 font-mono">{acad.passingYear}</td>
                              <td className="py-2 font-bold text-emerald-600">{acad.gradeOrPercentage}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedAppDetail.otherQualifications && selectedAppDetail.otherQualifications.some(o => o.examName?.trim()) && (
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        Other Exams Passed (ITI / Diploma / Certificate)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[480px]">
                          <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="py-2">Exam / Course / Subject</th>
                              <th className="py-2">Roll No.</th>
                              <th className="py-2">Passing Year</th>
                              <th className="py-2 text-center">Proof Sl No</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {selectedAppDetail.otherQualifications.filter(o => o.examName?.trim()).map((other, idx) => (
                              <tr key={idx}>
                                <td className="py-2 font-bold text-slate-900">{other.examName}</td>
                                <td className="py-2 text-slate-700 font-mono">{other.rollNo || '-'}</td>
                                <td className="py-2 text-slate-700 font-mono">{other.year || '-'}</td>
                                <td className="py-2 text-center font-mono text-slate-600">{other.proofSlNo || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedAppDetail.presentEmploymentDetails &&
                    Object.values(selectedAppDetail.presentEmploymentDetails).some(v => Boolean(v && String(v).trim())) && (
                      <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                          Present Employment Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                          {[
                            { label: 'Name of the Post', val: selectedAppDetail.presentEmploymentDetails.postName },
                            { label: 'Type of appointment', val: selectedAppDetail.presentEmploymentDetails.appointmentType },
                            { label: 'Date of Appointment', val: selectedAppDetail.presentEmploymentDetails.dateOfAppointment },
                            { label: "Employer's Name", val: selectedAppDetail.presentEmploymentDetails.employerName },
                            { label: 'Pay Band and Grade Pay(6th CPC)/Equivalent', val: selectedAppDetail.presentEmploymentDetails.payBandAndGradePay },
                            { label: 'Pay Level/Equivalent', val: selectedAppDetail.presentEmploymentDetails.payLevel },
                            { label: 'Gross Emoluments', val: selectedAppDetail.presentEmploymentDetails.grossEmoluments },
                            { label: 'Age of retirement in the Present Post', val: selectedAppDetail.presentEmploymentDetails.retirementAge },
                            { label: 'Date of retirement in the Present Post', val: selectedAppDetail.presentEmploymentDetails.retirementDate },
                            { label: 'Whether you are receiving any pension', val: selectedAppDetail.presentEmploymentDetails.receivingPension },
                          ].map((item, idx) => (
                            <div key={idx} className="p-2 bg-white border border-slate-200 rounded-lg">
                              <span className="text-[10px] text-slate-500 block">{item.label}</span>
                              <span className="font-bold text-slate-900">{item.val || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedAppDetail.experience && selectedAppDetail.experience.length > 0 && (
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        Professional & Teaching Experience
                      </h4>
                      <div className="space-y-2">
                        {selectedAppDetail.experience.map((exp, idx) => (
                          <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl">
                            <div className="flex flex-col sm:flex-row sm:justify-between font-bold text-slate-900 gap-1">
                              <span>{exp.designation}</span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                {exp.startDate} to {exp.isCurrent ? 'Present' : exp.endDate}
                              </span>
                            </div>
                            <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">{exp.organization}</span>
                            <p className="text-slate-500 text-[11px] mt-1">{exp.jobDescription}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Research & Misc */}
              {activeModalTab === 'research' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Research Publications &amp; Projects
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-700 block mb-1.5">
                          Research Papers/Review Articles/Conference Proceedings (In Related Areas Only) if any (Optional)
                        </span>
                        {selectedAppDetail.researchPaperItems && selectedAppDetail.researchPaperItems.some(r => r.title?.trim() || r.publicationType?.trim() || r.journalNameAndPage?.trim()) ? (
                          <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-[10px] border-collapse min-w-[600px]">
                              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                  <th className="p-2 border-r border-slate-200 text-center">S.No</th>
                                  <th className="p-2 border-r border-slate-200">Publication type</th>
                                  <th className="p-2 border-r border-slate-200">Title of the paper</th>
                                  <th className="p-2 border-r border-slate-200">Journal Name /page number</th>
                                  <th className="p-2 border-r border-slate-200">ISSN/ISBN NO.</th>
                                  <th className="p-2 border-r border-slate-200">Refereed</th>
                                  <th className="p-2 border-r border-slate-200">Author</th>
                                  <th className="p-2 text-center">Year</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {selectedAppDetail.researchPaperItems
                                  .filter(r => r.title?.trim() || r.publicationType?.trim() || r.journalNameAndPage?.trim())
                                  .map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="p-2 border-r border-slate-100 text-center font-semibold">{idx + 1}</td>
                                      <td className="p-2 border-r border-slate-100">{item.publicationType || '-'}</td>
                                      <td className="p-2 border-r border-slate-100 font-semibold">{item.title || '-'}</td>
                                      <td className="p-2 border-r border-slate-100">{item.journalNameAndPage || '-'}</td>
                                      <td className="p-2 border-r border-slate-100 font-mono">{item.issnIsbnNo || '-'}</td>
                                      <td className="p-2 border-r border-slate-100">{item.refereed || '-'}</td>
                                      <td className="p-2 border-r border-slate-100">{item.author || '-'}</td>
                                      <td className="p-2 text-center font-mono">{item.year || '-'}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="p-2 bg-white border border-slate-200 rounded-lg text-[11px] whitespace-pre-wrap">
                            {selectedAppDetail.researchPapers || 'Not Provided'}
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-700 block mb-1.5">
                          Research Publication – Books, Chapters, Edited Works, Articles (In Related Areas Only) if any
                        </span>
                        {selectedAppDetail.researchBookItems && selectedAppDetail.researchBookItems.some(r => r.title?.trim() || r.publicationType?.trim() || r.journalNameAndPage?.trim()) ? (
                          <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-[10px] border-collapse min-w-[600px]">
                              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                  <th className="p-2 border-r border-slate-200 text-center">S.No</th>
                                  <th className="p-2 border-r border-slate-200">Publication type</th>
                                  <th className="p-2 border-r border-slate-200">Title of the paper</th>
                                  <th className="p-2 border-r border-slate-200">Journal Name /page number</th>
                                  <th className="p-2 border-r border-slate-200">ISSN/ISBN NO.</th>
                                  <th className="p-2 border-r border-slate-200">Refereed</th>
                                  <th className="p-2 border-r border-slate-200">Author</th>
                                  <th className="p-2 text-center">Year</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {selectedAppDetail.researchBookItems
                                  .filter(r => r.title?.trim() || r.publicationType?.trim() || r.journalNameAndPage?.trim())
                                  .map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="p-2 border-r border-slate-100 text-center font-semibold">{idx + 1}</td>
                                      <td className="p-2 border-r border-slate-100">{item.publicationType || '-'}</td>
                                      <td className="p-2 border-r border-slate-100 font-semibold">{item.title || '-'}</td>
                                      <td className="p-2 border-r border-slate-100">{item.journalNameAndPage || '-'}</td>
                                      <td className="p-2 border-r border-slate-100 font-mono">{item.issnIsbnNo || '-'}</td>
                                      <td className="p-2 border-r border-slate-100">{item.refereed || '-'}</td>
                                      <td className="p-2 border-r border-slate-100">{item.author || '-'}</td>
                                      <td className="p-2 text-center font-mono">{item.year || '-'}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="p-2 bg-white border border-slate-200 rounded-lg text-[11px] whitespace-pre-wrap">
                            {selectedAppDetail.researchPublications || 'Not Provided'}
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-700 block mb-1.5">
                          Research Project, if any optional
                        </span>
                        {selectedAppDetail.researchProjectItems && selectedAppDetail.researchProjectItems.some(p => p.majorMinor?.trim() || p.sponsoringBody?.trim() || p.outcome?.trim() || p.totalGrants?.trim()) ? (
                          <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-[10px] border-collapse min-w-[540px]">
                              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                  <th className="p-2 border-r border-slate-200 text-center">S.No</th>
                                  <th className="p-2 border-r border-slate-200">Major/Minor</th>
                                  <th className="p-2 border-r border-slate-200">Period</th>
                                  <th className="p-2 border-r border-slate-200">Total grants</th>
                                  <th className="p-2 border-r border-slate-200">Name of sponsoring Body/Funding Agency</th>
                                  <th className="p-2">Outcome of the Project</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {selectedAppDetail.researchProjectItems
                                  .filter(p => p.majorMinor?.trim() || p.sponsoringBody?.trim() || p.outcome?.trim() || p.totalGrants?.trim())
                                  .map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="p-2 border-r border-slate-100 text-center font-semibold">{idx + 1}</td>
                                      <td className="p-2 border-r border-slate-100 font-semibold">{item.majorMinor || '-'}</td>
                                      <td className="p-2 border-r border-slate-100">{item.period || '-'}</td>
                                      <td className="p-2 border-r border-slate-100 font-mono">{item.totalGrants || '-'}</td>
                                      <td className="p-2 border-r border-slate-100">{item.sponsoringBody || '-'}</td>
                                      <td className="p-2">{item.outcome || '-'}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="p-2 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-500">
                            Not Provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-indigo-600" />
                      Miscellaneous Details & Suitability
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-500 block uppercase">Joining Time Required</span>
                        <span className="font-bold text-[11px]">{selectedAppDetail.joiningTimeRequired || 'Not Specified'}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-500 block uppercase">Computer Proficiency</span>
                        <span className="font-bold text-[11px]">{selectedAppDetail.hasComputerProficiency ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Institutional Contribution</span>
                      <p className="mt-1 p-2 bg-white border border-slate-200 rounded-lg text-[11px] whitespace-pre-wrap">
                        {selectedAppDetail.institutionalContribution || 'None'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Suitability Statement</span>
                      <p className="mt-1 p-2 bg-white border border-slate-200 rounded-lg text-[11px] whitespace-pre-wrap">
                        {selectedAppDetail.suitabilityStatement || 'None'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Honours & Awards</span>
                      <p className="mt-1 p-2 bg-white border border-slate-200 rounded-lg text-[11px] whitespace-pre-wrap">
                        {selectedAppDetail.honoursAndAwards || 'None'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Legal & Disciplinary History
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { label: 'Punished during service', val: selectedAppDetail.punishedDuringService },
                        { label: 'Medically unfit/asked to resign', val: selectedAppDetail.medicallyUnfitResignation || selectedAppDetail.medicallyUnfit },
                        { label: 'Case pending in court', val: selectedAppDetail.casePending },
                        { label: 'Debarred for unfair means', val: selectedAppDetail.debarredForUnfairMeans },
                        { label: 'Administrative malpractice', val: selectedAppDetail.administrativeMalpractice },
                        { label: 'Financial irregularity', val: selectedAppDetail.financialIrregularity },
                        { label: 'Discharged or dismissed', val: selectedAppDetail.dischargedOrDismissed },
                        { label: 'Pending disciplinary proceeding', val: selectedAppDetail.pendingDisciplinaryProceeding },
                        { label: 'NOC Available', val: selectedAppDetail.nocAvailable },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between p-2 bg-white border border-slate-200 rounded-lg items-center">
                          <span className="text-[10px] text-slate-700">{item.label}</span>
                          <span className="font-bold text-[10px]">{item.val ? 'YES' : 'NO'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedAppDetail.referees && selectedAppDetail.referees.length > 0 && (
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-600" />
                        Professional Referees
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedAppDetail.referees.map((ref, idx) => (
                          <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                            <span className="font-bold text-slate-900 block">{ref.name}</span>
                            <span className="text-[10px] text-indigo-600 font-bold block">{ref.designation}</span>
                            <span className="text-[10px] text-slate-500 block">{ref.address}</span>
                            <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                              <span>{ref.email}</span>
                              <span>{ref.mobile}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Documents & Fee */}
              {activeModalTab === 'documents' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Uploaded Documents & Verification Audit
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedAppDetail.documents.map((doc) => (
                        <div key={doc.id} className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{doc.name}</span>
                            <span className="text-[10px] text-slate-500 uppercase block truncate">{doc.type.replace(/_/g, ' ')} • {doc.fileSize}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              doc.status === 'verified'
                                ? 'bg-emerald-50 text-emerald-700 '
                                : doc.status === 'discrepancy'
                                ? 'bg-amber-50 text-amber-700 '
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      Payment & Fee Settlement Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase">Payment Status</span>
                        <span className="font-bold text-emerald-600 text-xs">{selectedAppDetail.paymentStatus}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase">Transaction Reference</span>
                        <span className="font-mono font-semibold text-slate-800 text-xs truncate block">
                          {selectedAppDetail.paymentRef || 'TXN-2026-UNIV-9981'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase">Category</span>
                        <span className="font-medium text-slate-800 text-xs">
                          {selectedAppDetail.applicant.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Evaluation & Next Steps */}
              {activeModalTab === 'status' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Official Screening & Examination Status
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase">Screening Decision</span>
                        <span className={`font-bold ${selectedAppDetail.screeningStatus === 'Eligible' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {selectedAppDetail.screeningStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase">Examination Roll No</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {selectedAppDetail.rollNumber || 'Under Generation'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase">Examination Center</span>
                        <span className="font-semibold text-slate-800">
                          {selectedAppDetail.examCenter || 'To be communicated'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedAppDetail.screeningRemarks && selectedAppDetail.screeningRemarks.length > 0 && (
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Committee Audit Trail & Comments
                      </h4>
                      {selectedAppDetail.screeningRemarks.map((rem, idx) => (
                        <div key={idx} className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200">
                          <div className="flex flex-col sm:flex-row sm:justify-between font-bold text-slate-900 gap-0.5">
                            <span>{rem.committeeMember} ({rem.committeeMemberRole})</span>
                            <span className="text-emerald-600 text-xs">{rem.decision}</span>
                          </div>
                          <p className="text-slate-600 text-xs mt-1">{rem.remarks}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">{rem.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions (Mobile responsive wrap) */}
            <div className="p-3 sm:p-4 px-4 sm:px-6 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition text-center"
              >
                Close Window
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {(selectedAppDetail.admitCardIssued || (selectedAppDetail.screeningStatus === 'Eligible' && selectedAppDetail.rollNumber)) && (
                  <button
                    onClick={() => {
                      setShowAdmitCardModal(selectedAppDetail);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Hall Ticket</span>
                  </button>
                )}

                {(selectedAppDetail.stage === 'offer_issued' || selectedAppDetail.stage === 'offer_accepted') && (
                  <button
                    onClick={() => {
                      setShowOfferModal(selectedAppDetail);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Offer Letter</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hall Ticket & Offer Letter Modals */}
      {showAdmitCardModal && (
        <AdmitCardModal
          application={showAdmitCardModal}
          onClose={() => setShowAdmitCardModal(null)}
        />
      )}

      {showOfferModal && (
        <OfferLetterModal
          application={showOfferModal}
          onClose={() => setShowOfferModal(null)}
        />
      )}

      {isPreviewOpen && previewApp && (
        <ApplicationPreviewModal
          application={previewApp}
          drive={drives.find(d => d.id === previewApp.driveId)}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewApp(null);
          }}
        />
      )}
    </div>
  );
};
