import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { PostConfig, RecruitmentDrive } from '../../types';
import { THEME_CONFIGS } from '../../themeStyles';
import {
  Search,
  Building2,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Clock,
  ArrowRight,
  Download,
  Users,
  CheckCircle2,
  BookOpen,
  Info,
  DollarSign,
  Send,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
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
  const { drives, departments, isLoggedIn, currentRole, branding } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [expandedSyllabusPostId, setExpandedSyllabusPostId] = useState<string | null>(null);
  const [activePdfModalDrive, setActivePdfModalDrive] = useState<RecruitmentDrive | null>(null);

  // Filter drives and posts
  const publishedDrives = drives.filter(
    (d) => d.status === 'applications_open' || d.status === 'published' || d.status === 'screening_in_progress'
  );

  const totalVacanciesAll = publishedDrives.reduce(
    (acc, drive) => acc + drive.posts.reduce((pAcc, post) => pAcc + post.vacanciesTotal, 0),
    0
  );

  const totalPostsCount = publishedDrives.reduce((acc, drive) => acc + drive.posts.length, 0);

  const filterPostMatches = (post: PostConfig) => {
    const matchesDept = selectedDept === 'all' || post.departmentId === selectedDept;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      post.title.toLowerCase().includes(term) ||
      post.departmentName.toLowerCase().includes(term) ||
      post.minQualification.toLowerCase().includes(term) ||
      post.payScale.toLowerCase().includes(term);
    return matchesDept && matchesSearch;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/50">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{branding.title}</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl ${theme.headingFont} text-white leading-snug`}>
            Current Recruitment Advertisements & Job Opportunities
          </h1>

          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-2xl">
            Explore official recruitment notices for Faculty, Administrative, and Technical positions. Review category-wise vacancy breakdowns, eligibility criteria, and submit your online application.
          </p>

          {/* Quick Metrics Banner */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
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

      {/* Filter & Search Bar */}
      <div className="glass-card p-5 rounded-2xl shadow-2xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by post title, department name, qualification or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-64">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Drive Listings */}
      <div className="space-y-6">
        {publishedDrives.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-2xs text-slate-500">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No active recruitment advertisements found matching your filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search keyword or selecting "All Departments".</p>
          </div>
        ) : (
          publishedDrives.map((drive) => {
            const matchingPosts = drive.posts.filter(filterPostMatches);
            if (matchingPosts.length === 0 && (searchTerm || selectedDept !== 'all')) {
              return null;
            }

            return (
              <div
                key={drive.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition hover:shadow-md"
              >
                {/* Drive Header Bar */}
                <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-bold">
                        Advt No: {drive.advtNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                        {drive.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white tracking-tight">{drive.title}</h2>
                    <p className="text-xs text-slate-300">{drive.organization} — Official Recruitment Notification</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setActivePdfModalDrive(drive)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Gazette PDF</span>
                    </button>
                  </div>
                </div>

                {/* Drive Important Dates Matrix */}
                <div className="bg-indigo-50/60 border-b border-indigo-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Opening Date</span>
                      <span className="font-semibold text-slate-900">{new Date(drive.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Closing Date</span>
                      <span className="font-semibold text-rose-700">{new Date(drive.closingDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Fee Deadline</span>
                      <span className="font-semibold text-slate-900">{new Date(drive.feeDeadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Tentative Exam</span>
                      <span className="font-semibold text-purple-800">{drive.examDate || 'Q3 2026'}</span>
                    </div>
                  </div>
                </div>

                {/* Posts Breakdown List */}
                <div className="p-5 space-y-4 divide-y divide-slate-100">
                  {matchingPosts.map((post) => {
                    const isSyllabusExpanded = expandedSyllabusPostId === post.id;

                    return (
                      <div key={post.id} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Post Details Info */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                Post Code: {post.postCode}
                              </span>
                              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                {post.departmentName}
                              </span>
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                Pay Scale: {post.payScale}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900">{post.title}</h3>

                            {/* Vacancies Matrix Pills */}
                            {drive.showCategoryRow !== false && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] font-bold text-slate-600 mr-1">Sanctioned Vacancies:</span>
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200">
                                  UR: {post.vacanciesBreakdown.UR}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                                  OBC: {post.vacanciesBreakdown.OBC}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">
                                  SC: {post.vacanciesBreakdown.SC}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                  ST: {post.vacanciesBreakdown.ST}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                                  EWS: {post.vacanciesBreakdown.EWS}
                                </span>
                                {post.vacanciesBreakdown.PwD > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                                    PwD: {post.vacanciesBreakdown.PwD}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold shadow-2xs">
                                  Total: {post.vacanciesTotal} Posts
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Specs & Apply Action Button */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 lg:self-center">
                            <div className="text-right text-xs hidden sm:block">
                              <div className="font-bold text-slate-800">
                                Fee: ₹{post.applicationFee}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                (Exempt: {post.feeExemptCategories.join(', ')})
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                              <button
                                onClick={() =>
                                  setExpandedSyllabusPostId(isSyllabusExpanded ? null : post.id)
                                }
                                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center space-x-1"
                              >
                                <span>Syllabus</span>
                                {isSyllabusExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  if (isLoggedIn && currentRole === 'applicant') {
                                    onApplyForPost(drive.id, post.id, post.title);
                                  } else if (isLoggedIn) {
                                    onApplyForPost(drive.id, post.id, post.title);
                                  } else {
                                    onRequestLogin(post.title);
                                  }
                                }}
                                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold shadow-md transition flex items-center justify-center space-x-1.5"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Apply Online</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Qualifications & Age Limits Box */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider mb-0.5">
                              Essential Qualifications & Experience:
                            </span>
                            <p className="text-slate-600 leading-relaxed font-medium">
                              {post.minQualification} | Minimum {post.requiredExperienceYears} years relevant academic or administrative experience.
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider mb-0.5">
                              Age Criteria & Category Relaxations:
                            </span>
                            <p className="text-slate-600 leading-relaxed font-medium">
                              Age Limit: {post.minAge} to {post.maxAge} Years as on closing date. Standard relaxations apply for OBC (+3 yrs), SC/ST (+5 yrs), PwD (+10 yrs).
                            </p>
                          </div>
                        </div>

                        {/* Collapsible Syllabus & Weightage Breakdown */}
                        {isSyllabusExpanded && (
                          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-2 animate-fadeIn">
                            <div className="flex items-center space-x-2 text-indigo-900 font-bold mb-1">
                              <BookOpen className="w-4 h-4 text-indigo-700" />
                              <span>Syllabus & Examination Pattern</span>
                            </div>
                            
                            {drive.syllabusContent ? (
                              <div className="text-slate-700 text-[11px] whitespace-pre-wrap font-mono leading-relaxed bg-white/50 p-4 rounded-lg border border-indigo-100/50 shadow-inner">
                                {drive.syllabusContent}
                              </div>
                            ) : (
                              <>
                                <p className="text-slate-700 text-[11px]">
                                  Selection will be conducted based on normalized merit ranking computed from:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] pl-1 font-medium">
                                  <li>Stage 1: Written Examination / Screening Test (Weightage: 50%)</li>
                                  <li>Stage 2: Personal Interview & Teaching/Domain Demo (Weightage: 30%)</li>
                                  <li>Stage 3: Academic API Score & Publication History (Weightage: 20%)</li>
                                </ul>
                                <div className="text-[10px] text-indigo-800 font-semibold pt-1">
                                  * Document verification will be performed prior to final interview panel scoring.
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Official Gazette PDF Preview Modal */}
      {activePdfModalDrive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Official Advertisement Gazette Document</h3>
                <p className="text-xs text-slate-500">{activePdfModalDrive.advtNumber} — {activePdfModalDrive.title}</p>
              </div>
              <button
                onClick={() => setActivePdfModalDrive(null)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4 max-h-[60vh] overflow-y-auto">
              <FileText className="w-12 h-12 text-indigo-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">{activePdfModalDrive.title}</h4>
                <p className="text-[10px] font-mono text-slate-500 uppercase">{activePdfModalDrive.advtNumber}</p>
              </div>

              {activePdfModalDrive.syllabusContent && (
                <div className="text-left bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h5 className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Syllabus & Exam Pattern
                  </h5>
                  <div className="text-[11px] text-slate-700 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                    {activePdfModalDrive.syllabusContent}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => alert('Simulated PDF Download initiated.')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Guidelines & FAQs */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>General Applicant Helpdesk & Registration Guidelines</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">1. Online Account Creation</span>
            <p className="text-slate-600 leading-snug text-[11px]">
              Applicants must register using their active email address and mobile number. A unique Registration Number will be generated.
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">2. Document Formats & Photo</span>
            <p className="text-slate-600 leading-snug text-[11px]">
              Upload passport photo (max 200KB) and signature (max 100KB) in JPG/PNG format. Certificates should be uploaded in PDF format.
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">3. Payment & Exemption</span>
            <p className="text-slate-600 leading-snug text-[11px]">
              Fee payment is integrated via payment gateway. Women candidates, SC, ST, and PwD applicants are exempted from payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
