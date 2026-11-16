import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { RecruitmentDrive, RecruitmentCategory, Campus } from '../../types';
import { THEME_CONFIGS } from '../../themeStyles';
import {
  Search,
  Building2,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Download,
  Users,
  Send,
  Info,
  LogIn,
  UserPlus,
  MapPin,
  CreditCard,
  ArrowUpDown,
  Megaphone,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface PublicRecruitmentPortalProps {
  onApplyForPost: (driveId: string, postId: string, postTitle: string) => void;
  onRequestLogin: (postTitle: string) => void;
  onRequestRegister: () => void;
}

export const PublicRecruitmentPortal: React.FC<PublicRecruitmentPortalProps> = ({
  onApplyForPost,
  onRequestLogin,
  onRequestRegister,
}) => {
  const {
    drives,
    departments,
    applications,
    currentUser,
    isLoggedIn,
    branding,
    setSelectedDriveId,
    setSelectedPostId,
    setEditingAppId,
    setActiveTab,
  } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];

  const [categoryTab, setCategoryTab] = useState<RecruitmentCategory>('Teaching');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState<Campus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'campus_asc' | 'campus_desc' | 'closing_date' | 'title_asc'>('campus_asc');
  const [activePdfModalDrive, setActivePdfModalDrive] = useState<RecruitmentDrive | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const publishedDrives = drives.filter(
    (d) => d.status === 'applications_open' || d.status === 'published' || d.status === 'screening_in_progress'
  );
  const sourceDrives = publishedDrives.length > 0 ? publishedDrives : drives;

  const allOpenJobs = sourceDrives.flatMap((drive) =>
    (drive.posts || []).map((post) => ({
      drive,
      post,
      category: (post.category || drive.category || 'Teaching') as RecruitmentCategory,
      campus: (post.campus || (drive.campus && drive.campus !== 'All Campuses' ? drive.campus : 'BIT Mesra')) as string,
    }))
  );

  const totalPostsCount = allOpenJobs.length;
  const totalVacanciesAll = allOpenJobs.reduce(
    (acc, item) => acc + (Number(item.post.vacanciesTotal) || 0),
    0
  );

  const teachingCount = allOpenJobs.filter((j) => j.category === 'Teaching').length;
  const nonTeachingCount = allOpenJobs.filter((j) => j.category === 'Non-Teaching').length;

  const campusOptions = Array.from(
    new Set([
      'BIT Mesra',
      'BIT Noida',
      'BIT Jaipur',
      'BIT Patna',
      'BIT Deoghar',
      ...allOpenJobs.map((j) => j.campus).filter(Boolean),
    ])
  );

  const myUserApps = isLoggedIn
    ? applications.filter((app) => {
        if (!currentUser) return false;
        const matchesEmail = currentUser.email && app.applicant.email.toLowerCase() === currentUser.email.toLowerCase();
        const matchesReg = currentUser.regNumber && app.applicant.regNumber === currentUser.regNumber;
        return !!(matchesEmail || matchesReg);
      })
    : [];

  const term = searchTerm.toLowerCase().trim();
  const filteredJobs = allOpenJobs
    .filter((item) => item.category === categoryTab)
    .filter((item) => selectedCampus === 'All' || item.campus === selectedCampus)
    .filter((item) => selectedDept === 'all' || item.post.departmentId === selectedDept)
    .filter((item) => {
      if (!term) return true;
      return (
        item.post.title.toLowerCase().includes(term) ||
        item.post.postCode.toLowerCase().includes(term) ||
        item.post.departmentName.toLowerCase().includes(term) ||
        item.post.minQualification.toLowerCase().includes(term) ||
        item.post.payScale.toLowerCase().includes(term) ||
        item.drive.title.toLowerCase().includes(term) ||
        item.drive.advtNumber.toLowerCase().includes(term) ||
        item.campus.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'campus_asc') {
        const cmp = a.campus.localeCompare(b.campus);
        return cmp !== 0 ? cmp : a.post.title.localeCompare(b.post.title);
      }
      if (sortBy === 'campus_desc') {
        const cmp = b.campus.localeCompare(a.campus);
        return cmp !== 0 ? cmp : a.post.title.localeCompare(b.post.title);
      }
      if (sortBy === 'closing_date') {
        return new Date(a.drive.closingDate).getTime() - new Date(b.drive.closingDate).getTime();
      }
      return a.post.title.localeCompare(b.post.title);
    });

  return (
    <div className={`space-y-6 sm:space-y-8 animate-fadeIn ${theme.rootContainer}`}>
      {/* Top Hero Banner */}
      <div
        className={`relative overflow-hidden ${
          branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-3xl'
        } bg-gradient-to-r ${theme.heroGradient} text-white p-6 sm:p-8 ${
          branding.showCardShadow ? 'shadow-xl' : 'shadow-none'
        }`}
      >
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white/90 border border-white/15">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{branding.title}</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl ${theme.headingFont} text-white leading-snug`}>
            {branding.subtitle || 'Current Recruitment Advertisements & Job Opportunities'}
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
            Explore official recruitment notices for Faculty, Administrative, and Technical positions. Filter by Teaching or Non-Teaching category, campus, and department to review eligibility and apply online.
          </p>

          {!isLoggedIn && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onRequestLogin('General Recruitment')}
                className={`px-6 py-2.5 ${
                  branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'
                } bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-50 transition flex items-center gap-2`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Login</span>
              </button>
              <button
                type="button"
                onClick={onRequestRegister}
                className={`px-6 py-2.5 ${
                  branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'
                } bg-white/10 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs shadow-md hover:bg-white/20 transition flex items-center gap-2`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Applicant Account</span>
              </button>
            </div>
          )}

          {/* Quick Metrics Banner */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-300" />
              <span>{publishedDrives.length} Active Advertisements</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-300" />
              <span>{totalPostsCount} Configured Positions</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-300" />
              <span>{totalVacanciesAll} Total Sanctioned Vacancies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Current Openings Directory (Matching Image 2 Professional Design) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
        {/* Directory Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              <span>Current Job Openings &amp; Active Advertisements</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select Teaching or Non-Teaching positions below to inspect detailed notifications or submit an online application.
            </p>
          </div>
          {sourceDrives.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setDownloadMessage(null);
                setActivePdfModalDrive(sourceDrives[0]);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1.5 transition shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official Advertisement</span>
            </button>
          )}
        </div>

        {/* 2 Category Tabs: Teaching & Non-Teaching */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto border border-slate-200/80">
            <button
              type="button"
              onClick={() => setCategoryTab('Teaching')}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${
                categoryTab === 'Teaching'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${categoryTab === 'Teaching' ? 'text-white' : 'text-slate-400'}`} />
              <span>Teaching</span>
              <span
                className={`px-2 py-0.5 rounded-full font-mono tabular-nums text-[10px] font-extrabold ${
                  categoryTab === 'Teaching' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {teachingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryTab('Non-Teaching')}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${
                categoryTab === 'Non-Teaching'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${categoryTab === 'Non-Teaching' ? 'text-white' : 'text-slate-400'}`} />
              <span>Non-Teaching</span>
              <span
                className={`px-2 py-0.5 rounded-full font-mono tabular-nums text-[10px] font-extrabold ${
                  categoryTab === 'Non-Teaching' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {nonTeachingCount}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium tabular-nums">
            Showing <strong className="text-slate-900">{filteredJobs.length}</strong> open {categoryTab} position
            {filteredJobs.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Search, Campus, Department & Campus Sort Bar */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${categoryTab} posts, departments, advt no...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                aria-label="Filter by Campus"
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value as Campus | 'All')}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="All">All Campuses</option>
                {campusOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                aria-label="Filter by Department"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                aria-label="Sort positions"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="campus_asc">Campus (A–Z)</option>
                <option value="campus_desc">Campus (Z–A)</option>
                <option value="closing_date">Closing Date</option>
                <option value="title_asc">Title (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Cards (Matching Image 2 Design) */}
        {filteredJobs.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No {categoryTab} positions found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try changing the selected campus, department, or search keyword, or switch between Teaching and Non-Teaching tabs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map(({ drive, post, category, campus }) => {
              const existingApp = myUserApps.find(
                (a) => a.driveId === drive.id && a.postId === post.id
              );

              return (
                <div
                  key={`${drive.id}-${post.id}`}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 sm:p-5 shadow-2xs transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider">
                        {category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {campus}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {drive.advtNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                        Code: {post.postCode}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {drive.title} • <span className="text-slate-700 font-semibold">{post.departmentName}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-600 pt-1 tabular-nums">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        Pay Scale: <strong className="text-slate-800">{post.payScale}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Vacancies: <strong className="text-slate-800">{Number(post.vacanciesTotal) || 0}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        Fee: <strong className="text-slate-800">₹{post.applicationFee}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        Closing Date:{' '}
                        <strong className="text-rose-600">
                          {new Date(drive.closingDate).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-center justify-center gap-2 shrink-0">
                    {existingApp ? (
                      existingApp.stage === 'draft' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAppId(existingApp.id);
                            setActiveTab('applicant_portal');
                          }}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition whitespace-nowrap"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>Continue Draft</span>
                        </button>
                      ) : (
                        <>
                          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold text-center">
                            Applied ({existingApp.applicationNo})
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('my_jobs')}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View My Application</span>
                          </button>
                        </>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => onApplyForPost(drive.id, post.id, post.title)}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-98 whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply Online</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDriveId(drive.id);
                        setSelectedPostId(post.id);
                        setActiveTab('notice_detail');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1 py-0.5 transition whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Detailed Advertisement</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDownloadMessage(null);
                        setActivePdfModalDrive(drive);
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:underline flex items-center justify-center gap-1 transition whitespace-nowrap"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Notice</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activePdfModalDrive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} w-full max-w-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className={`font-bold text-sm ${theme.headingFont}`}>Official Advertisement Gazette Document</h3>
                <p className="text-xs text-slate-500">{activePdfModalDrive.advtNumber} — {activePdfModalDrive.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActivePdfModalDrive(null)}
                className={`${theme.secondaryButton} px-3 py-1.5 text-xs font-bold`}
              >
                Close
              </button>
            </div>

            <div className={`p-6 bg-slate-50 border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} text-center space-y-4 max-h-[60vh] overflow-y-auto`}>
              <FileText className={`w-12 h-12 ${theme.accentColor} mx-auto`} />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">{activePdfModalDrive.title}</h4>
                <p className="text-[11px] font-mono text-slate-500 uppercase">{activePdfModalDrive.advtNumber}</p>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Opening Date: {new Date(activePdfModalDrive.startDate).toLocaleDateString()} · Closing Date:{' '}
                  {new Date(activePdfModalDrive.closingDate).toLocaleDateString()}
                </p>
              </div>

              {downloadMessage && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{downloadMessage}</span>
                </div>
              )}

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (activePdfModalDrive.posts?.[0]) {
                      setSelectedDriveId(activePdfModalDrive.id);
                      setSelectedPostId(activePdfModalDrive.posts[0].id);
                      setActivePdfModalDrive(null);
                      setActiveTab('notice_detail');
                    } else {
                      setDownloadMessage('Gazette summary is ready for review.');
                    }
                  }}
                  className={`${theme.primaryButton} px-4 py-2 font-bold text-xs transition flex items-center space-x-1.5`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Open Detailed Recruitment Notice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Applicant Helpdesk & Registration Guidelines */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>General Applicant Helpdesk &amp; Registration Guidelines</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">Online Account Creation</span>
            <p className="text-slate-600 leading-snug text-[11px]">
              Applicants must register using their active email address and mobile number before submitting an application.
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">Document Formats</span>
            <p className="text-slate-600 leading-snug text-[11px]">
              Upload JPG/PNG photograph (up to 500 KB) and specimen signature (up to 200 KB), plus PDF certificates.
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">Payment &amp; Exemption</span>
            <p className="text-slate-600 leading-snug text-[11px]">
              Integrated SBI Collect portal. Eligible SC/ST/PwD/Female candidates receive automatic fee exemption where applicable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
