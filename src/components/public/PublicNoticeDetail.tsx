import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { THEME_CONFIGS } from '../../themeStyles';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Info,
  Mail,
  MapPin,
  Printer,
  Send,
  Share2,
  ShieldCheck,
} from 'lucide-react';

interface PublicNoticeDetailProps {
  onRequestLogin?: () => void;
  onRequestRegister?: () => void;
}

const formatDisplayDate = (dateStr?: string) => {
  if (!dateStr) return 'To be notified';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const PublicNoticeDetail: React.FC<PublicNoticeDetailProps> = ({
  onRequestLogin,
}) => {
  const {
    drives,
    applications,
    currentUser,
    selectedDriveId,
    selectedPostId,
    setActiveTab,
    isLoggedIn,
    currentRole,
    branding,
    setEditingAppId,
  } = usePortal();

  const theme = THEME_CONFIGS[branding.theme || 'classic'];
  const [copiedNotice, setCopiedNotice] = useState(false);

  const drive = drives.find((d) => d.id === selectedDriveId);
  const post = drive?.posts.find((p) => p.id === selectedPostId);
  const hasValidNotice = Boolean(drive && post);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedDriveId, selectedPostId]);

  useEffect(() => {
    if (!hasValidNotice) return;
    document.body.classList.add('has-public-notice-detail');
    return () => {
      document.body.classList.remove('has-public-notice-detail');
    };
  }, [hasValidNotice]);

  const handleBack = () => {
    setActiveTab(isLoggedIn && currentRole === 'applicant' ? 'overview' : 'public_recruitment');
  };

  if (!drive || !post) {
    return (
      <div className="max-w-3xl mx-auto my-12 bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4">
        <Info className="w-10 h-10 text-slate-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Recruitment Notice Unavailable</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The requested advertisement or position record could not be located or is no longer active.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isLoggedIn && currentRole === 'applicant' ? 'Return to Dashboard' : 'Return to Public Notices'}</span>
          </button>
        </div>
      </div>
    );
  }

  const displayCampus =
    post.campus || (drive.campus && drive.campus !== 'All Campuses' ? drive.campus : 'BIT Mesra');
  const displayCategory = post.category || drive.category || 'Teaching';
  const organizationName = drive.organization || 'Birla Institute of Technology, Mesra';

  const existingApp =
    isLoggedIn && currentUser
      ? applications.find((app) => {
          const matchesEmail =
            currentUser.email && app.applicant.email.toLowerCase() === currentUser.email.toLowerCase();
          const matchesReg = currentUser.regNumber && app.applicant.regNumber === currentUser.regNumber;
          return (matchesEmail || matchesReg) && app.driveId === drive.id && app.postId === post.id;
        })
      : undefined;

  const closingDateObj = new Date(drive.closingDate);
  const now = new Date();
  const daysRemaining = Number.isNaN(closingDateObj.getTime())
    ? null
    : Math.ceil((closingDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const statusLabel =
    drive.status === 'applications_open' || drive.status === 'published'
      ? 'Applications Open'
      : drive.status === 'screening_in_progress'
      ? 'Screening In Progress'
      : drive.status.replace(/_/g, ' ');

  const handleApply = () => {
    if (isLoggedIn) {
      if (existingApp?.stage === 'draft') {
        setEditingAppId(existingApp.id);
      } else {
        setEditingAppId(null);
      }
      setActiveTab('applicant_portal');
    } else if (onRequestLogin) {
      onRequestLogin();
    }
  };

  const handleShareNotice = () => {
    if (navigator.clipboard && window.location) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const vacancyColumns = [
    { code: 'UR', label: 'Unreserved', count: Number(post.vacanciesBreakdown?.UR) || 0 },
    { code: 'OBC', label: 'OBC (NCL)', count: Number(post.vacanciesBreakdown?.OBC) || 0 },
    { code: 'SC', label: 'SC', count: Number(post.vacanciesBreakdown?.SC) || 0 },
    { code: 'ST', label: 'ST', count: Number(post.vacanciesBreakdown?.ST) || 0 },
    { code: 'EWS', label: 'EWS', count: Number(post.vacanciesBreakdown?.EWS) || 0 },
    { code: 'PwD', label: 'PwD', count: Number(post.vacanciesBreakdown?.PwD) || 0 },
  ];

  const scheduleRows = [
    { label: 'Advertisement Date', value: formatDisplayDate(drive.startDate) },
    { label: 'Closing Date (Online Form)', value: formatDisplayDate(drive.closingDate), emphasize: true },
    { label: 'Fee Payment Deadline', value: formatDisplayDate(drive.feeDeadline) },
    ...(drive.correctionDate ? [{ label: 'Form Correction Window', value: formatDisplayDate(drive.correctionDate) }] : []),
    ...(drive.examDate ? [{ label: 'Written / Skill Test', value: formatDisplayDate(drive.examDate) }] : []),
    ...(drive.interviewPeriod ? [{ label: 'Selection Interview', value: drive.interviewPeriod }] : []),
  ];

  const mastheadSection = (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden print-keep-together">
      <div className="p-6 sm:p-8 print:p-5 space-y-4">
        {/* Unboxed Typographic Metadata Line */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-500">
          <span className="font-semibold text-slate-800">{organizationName}</span>
          <span aria-hidden="true">·</span>
          <span>{displayCategory} Recruitment</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-700">Advt. {drive.advtNumber}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-700">Post Code {post.postCode}</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-700 font-semibold">{statusLabel}</span>
        </div>

        {/* Dominant Headline & Organizational Context */}
        <div className="space-y-2 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] print:text-2xl font-bold tracking-tight text-slate-900 leading-tight text-balance">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              {post.departmentName}
            </span>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              {displayCampus}
            </span>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <span className="text-slate-500">{drive.title}</span>
          </div>
        </div>
      </div>

      {/* 4-Column Key Terms Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 border-t border-slate-200 divide-y sm:divide-y-0 sm:divide-x print:divide-y-0 print:divide-x divide-slate-200 bg-slate-50/70">
        <div className="p-4 sm:px-6 sm:py-4 print:p-3 space-y-1">
          <div className="text-xs font-medium text-slate-500">Pay Matrix & Scale</div>
          <div className="text-sm font-semibold text-slate-900 tabular-nums">{post.payScale}</div>
        </div>

        <div className="p-4 sm:px-6 sm:py-4 print:p-3 space-y-1">
          <div className="text-xs font-medium text-slate-500">Total Sanctioned Posts</div>
          <div className="text-sm font-semibold text-slate-900 tabular-nums">
            {Number(post.vacanciesTotal) || 0} {Number(post.vacanciesTotal) === 1 ? 'Vacancy' : 'Vacancies'}
          </div>
        </div>

        <div className="p-4 sm:px-6 sm:py-4 print:p-3 space-y-1">
          <div className="text-xs font-medium text-slate-500">Application Fee</div>
          <div className="text-sm font-semibold text-slate-900 tabular-nums">
            ₹{Number(post.applicationFee) || 0}
            <span className="text-xs font-normal text-slate-500 ml-1.5">
              ({post.feeExemptCategories?.length ? `${post.feeExemptCategories.join('/')} Exempt` : 'Standard'})
            </span>
          </div>
        </div>

        <div className="p-4 sm:px-6 sm:py-4 print:p-3 space-y-1">
          <div className="text-xs font-medium text-slate-500">Application Deadline</div>
          <div className="text-sm font-semibold text-slate-900 tabular-nums flex items-center gap-2">
            <span>{formatDisplayDate(drive.closingDate)}</span>
            {daysRemaining !== null && daysRemaining >= 0 && (
              <span className="text-xs font-medium text-amber-700">
                ({daysRemaining === 0 ? 'Closes today' : `${daysRemaining}d left`})
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const overviewSection = (
    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 print:p-5 space-y-6 print:space-y-4">
      <div className="space-y-1 border-b border-slate-200 pb-4 print:pb-3">
        <h2 className="text-base font-semibold text-slate-900">Position Overview & Notification Scope</h2>
        <p className="text-xs text-slate-500">Official terms of recruitment issued by {organizationName}</p>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed max-w-prose">
        {drive.description ||
          `Online applications are invited from eligible Indian nationals and qualified professionals for the post of ${post.title} in the Department of ${post.departmentName} at ${displayCampus}. Appointments shall be governed by Institute statutes and UGC / AICTE norms where applicable.`}
      </p>

      {/* Structured Specification Definition List */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 border-t border-slate-200 pt-5 print:pt-4 gap-x-8 gap-y-4 text-sm">
        <div className="flex flex-col space-y-0.5 border-b border-slate-100 pb-3">
          <dt className="text-xs font-medium text-slate-500">Recruitment Drive</dt>
          <dd className="font-medium text-slate-900">{drive.title}</dd>
        </div>
        <div className="flex flex-col space-y-0.5 border-b border-slate-100 pb-3">
          <dt className="text-xs font-medium text-slate-500">Drive & Advertisement Reference</dt>
          <dd className="font-mono text-xs font-medium text-slate-900 tabular-nums">
            {drive.driveCode} / {drive.advtNumber}
          </dd>
        </div>
        <div className="flex flex-col space-y-0.5 border-b border-slate-100 pb-3">
          <dt className="text-xs font-medium text-slate-500">Department / Academic Unit</dt>
          <dd className="font-medium text-slate-900">{post.departmentName}</dd>
        </div>
        <div className="flex flex-col space-y-0.5 border-b border-slate-100 pb-3">
          <dt className="text-xs font-medium text-slate-500">Place of Posting (Campus)</dt>
          <dd className="font-medium text-slate-900">{displayCampus}</dd>
        </div>
        <div className="flex flex-col space-y-0.5 pb-1">
          <dt className="text-xs font-medium text-slate-500">Position Category</dt>
          <dd className="font-medium text-slate-900">{displayCategory}</dd>
        </div>
        <div className="flex flex-col space-y-0.5 pb-1">
          <dt className="text-xs font-medium text-slate-500">Probation & Appointment Terms</dt>
          <dd className="font-medium text-slate-900">Regular / 24 Months Probation</dd>
        </div>
      </dl>
    </section>
  );

  const vacancyTableSection = drive.showCategoryRow !== false ? (
    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 print:p-5 space-y-5 print-keep-together">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-4 print:pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Category-Wise Vacancy Distribution</h2>
          <p className="text-xs text-slate-500">Reservation roster applicable as per Government of India & Institute guidelines</p>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
          Total: {Number(post.vacanciesTotal) || 0} Posts
        </span>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              {vacancyColumns.map((col) => (
                <th key={col.code} className="px-4 py-3 text-center whitespace-nowrap">
                  <div>{col.code}</div>
                  <div className="text-[11px] font-normal text-slate-400">{col.label}</div>
                </th>
              ))}
              <th className="px-4 py-3 text-center bg-slate-100/80 text-slate-900 whitespace-nowrap">
                <div>Total</div>
                <div className="text-[11px] font-normal text-slate-500">Sanctioned</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
              {vacancyColumns.map((col) => (
                <td key={col.code} className="px-4 py-3.5 text-center border-r border-slate-100 last:border-r-0">
                  {col.count}
                </td>
              ))}
              <td className="px-4 py-3.5 text-center bg-slate-50 text-indigo-700 font-bold">
                {Number(post.vacanciesTotal) || 0}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  ) : null;

  const eligibilitySection = (
    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 print:p-5 space-y-6 print:space-y-4 print-keep-together">
      <div className="space-y-1 border-b border-slate-200 pb-4 print:pb-3">
        <h2 className="text-base font-semibold text-slate-900">Eligibility & Qualification Criteria</h2>
        <p className="text-xs text-slate-500">Mandatory academic, professional experience, and age requirements</p>
      </div>

      <div className="space-y-6 print:space-y-4">
        {/* Essential Qualification */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            <span>Essential Educational Qualification</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed">
            {post.minQualification}
          </div>
        </div>

        {/* Experience & Age Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-1">
            <div className="text-xs font-medium text-slate-500">Minimum Experience</div>
            <div className="text-base font-semibold text-slate-900 tabular-nums">
              {post.requiredExperienceYears} {post.requiredExperienceYears === 1 ? 'Year' : 'Years'}
            </div>
            <p className="text-xs text-slate-500">Post-qualification relevant service</p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-1">
            <div className="text-xs font-medium text-slate-500">Minimum Age Limit</div>
            <div className="text-base font-semibold text-slate-900 tabular-nums">
              {post.minAge} Years
            </div>
            <p className="text-xs text-slate-500">As on closing date of notice</p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-1">
            <div className="text-xs font-medium text-slate-500">Maximum Age Limit</div>
            <div className="text-base font-semibold text-slate-900 tabular-nums">
              {post.maxAge} Years
            </div>
            <p className="text-xs text-slate-500">Age relaxation as per GoI norms</p>
          </div>
        </div>

        {/* Syllabus / Additional Notes if present */}
        {drive.syllabusContent && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Syllabus & Assessment Scope</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {drive.syllabusContent}
            </p>
          </div>
        )}
      </div>
    </section>
  );

  const selectionSection = (
    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 print:p-5 space-y-6 print:space-y-4 print-keep-together">
      <div className="space-y-1 border-b border-slate-200 pb-4 print:pb-3">
        <h2 className="text-base font-semibold text-slate-900">Selection Process & Evaluation Pattern</h2>
        <p className="text-xs text-slate-500">Multi-stage merit evaluation and verification workflow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-5 print:gap-3">
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
          <div className="text-xs font-mono font-semibold text-indigo-700">Stage 01</div>
          <h3 className="text-sm font-semibold text-slate-900">Screening & Shortlisting</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Scrutiny of academic credentials, API/research records, and supporting certificates against essential eligibility benchmarks.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
          <div className="text-xs font-mono font-semibold text-indigo-700">Stage 02</div>
          <h3 className="text-sm font-semibold text-slate-900">Written / Skill Assessment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Subject-domain written examination and practical skill/trade proficiency test conducted where prescribed for the cadre.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
          <div className="text-xs font-mono font-semibold text-indigo-700">Stage 03</div>
          <h3 className="text-sm font-semibold text-slate-900">Selection Committee Interview</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Personal interview and seminar/presentation before the duly constituted expert selection committee for final merit ranking.
          </p>
        </div>
      </div>
    </section>
  );

  const importantDatesSection = (
    <div className="bg-white border border-slate-200 rounded-xl p-6 print:p-5 space-y-4 print-keep-together">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Calendar className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-900">Important Dates</h3>
      </div>

      <dl className="divide-y divide-slate-100 text-xs">
        {scheduleRows.map((row) => (
          <div key={row.label} className="py-2.5 flex items-center justify-between gap-4">
            <dt className="text-slate-500">{row.label}</dt>
            <dd
              className={`font-mono tabular-nums text-right ${
                row.emphasize ? 'font-semibold text-rose-700' : 'font-medium text-slate-900'
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );

  const feeAndHelpdeskSection = (
    <div className="bg-white border border-slate-200 rounded-xl p-6 print:p-5 space-y-5 print-keep-together">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span>Fee Exemption & Documents</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Application fee is ₹{Number(post.applicationFee) || 0}.{' '}
          {post.feeExemptCategories?.length
            ? `Candidates belonging to ${post.feeExemptCategories.join(', ')} categories are exempted from fee payment upon uploading valid category certificates.`
            : 'Exemptions apply strictly as per Institute and Government of India norms.'}
        </p>
        <ul className="text-xs text-slate-600 space-y-1.5 pt-1 list-disc pl-4">
          <li>Scanned passport photograph & signature</li>
          <li>Matriculation, UG, PG & Ph.D. degree certificates</li>
          <li>Experience certificates, NOC (if employed) & category proofs</li>
        </ul>
      </div>

      <div className="pt-4 border-t border-slate-200 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
          <Mail className="w-4 h-4 text-slate-500" />
          <span>Recruitment Helpdesk</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          For clarifications regarding advertisement {drive.advtNumber}, write to{' '}
          <span className="font-medium text-slate-900">recruitment@bitmesra.ac.in</span> citing Post Code{' '}
          <span className="font-mono">{post.postCode}</span>.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className={`max-w-6xl mx-auto pb-16 space-y-6 ${theme.rootContainer}`}>
        {/* Top Utility Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isLoggedIn && currentRole === 'applicant' ? 'Back to Applicant Dashboard' : 'Back to All Notices'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareNotice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedNotice ? 'Link Copied' : 'Share Notice'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Advertisement</span>
            </button>
          </div>
        </div>

        {/* Institutional Masthead & Key Terms Strip */}
        {mastheadSection}

      {/* Main 2-Column Specification & Action Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Primary Column: Detailed Specification */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Position Summary & Official Details */}
          {overviewSection}

          {/* 2. Category-wise Vacancy Breakdown Table */}
          {vacancyTableSection}

          {/* 3. Eligibility, Qualification & Age Criteria */}
          {eligibilitySection}

          {/* 4. Selection Methodology */}
          {selectionSection}
        </div>

        {/* Right Sticky Action & Schedule Rail */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Primary Application CTA Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="space-y-1 pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Submission Cutoff</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatDisplayDate(drive.closingDate)}
                </span>
              </div>
              <p className="text-xs text-slate-500">Online portal closes at 11:59 PM IST on the closing date.</p>
            </div>

            {existingApp ? (
              existingApp.stage === 'draft' ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                    Saved draft available ({existingApp.applicationNo}). Continue completing your submission before the deadline.
                  </div>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Continue Saved Draft</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Application Submitted</div>
                      <div className="text-emerald-700 font-mono text-[11px] mt-0.5">{existingApp.applicationNo}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('my_jobs')}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Track Application Status</span>
                  </button>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className={`w-full py-3 px-4 rounded-lg ${theme.primaryButton} text-xs font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap shrink-0`}
              >
                <Send className="w-4 h-4" />
                <span>{isLoggedIn ? 'Apply Online Now' : 'Sign In & Apply Online'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download / Print Notice</span>
            </button>
          </div>

          {/* Key Recruitment Dates */}
          {importantDatesSection}

          {/* Fee Concession & Applicant Checklist */}
          {feeAndHelpdeskSection}
        </aside>
      </div>
    </div>

      {createPortal(
        <div className="notice-detail-print-portal hidden print:block bg-white text-slate-900">
          <div className="max-w-4xl mx-auto space-y-4">
            {mastheadSection}
            {overviewSection}
            {vacancyTableSection}
            {eligibilitySection}
            {selectionSection}
            <div className="grid grid-cols-2 gap-4 items-start">
              {importantDatesSection}
              {feeAndHelpdeskSection}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
