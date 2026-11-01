import {
  Department,
  RecruitmentDrive,
  Application,
  AuditLog,
  SystemNotification,
  RoleInfo,
  UserRole,
  PortalUser,
} from './types.js';

export const INITIAL_ROLES: RoleInfo[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Complete system control, user management, audit logs, backup, master data.',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    permissions: ['all_access', 'manage_users', 'manage_system', 'view_audit_logs', 'master_data'],
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'General administration with restricted access to system branding and status.',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    permissions: ['manage_users', 'manage_drives', 'manage_posts', 'process_applications'],
  },
  {
    id: 'recruitment_admin',
    name: 'Recruitment Admin',
    description: 'Manages drives, defines post eligibility, schedules tests, publishes merit lists.',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
    permissions: ['manage_drives', 'manage_posts', 'generate_merit', 'publish_results', 'issue_offers'],
  },
  {
    id: 'recruitment_officer',
    name: 'Recruitment Officer',
    description: 'Operational processing, candidate communication, test scheduling, status updates.',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    permissions: ['process_applications', 'schedule_candidates', 'send_notifications', 'issue_admit_cards'],
  },
  {
    id: 'department_admin',
    name: 'Department Admin',
    description: 'Departmental review, candidate recommendations, post vacancy inputs.',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    permissions: ['view_dept_applications', 'recommend_candidates', 'dept_reports'],
  },
  {
    id: 'screening_committee',
    name: 'Screening Committee',
    description: 'Evaluates applicant age, qualifications, caste certs, marks eligible/ineligible.',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    permissions: ['screen_applications', 'mark_eligibility', 'add_screening_remarks'],
  },
  {
    id: 'interview_panel',
    name: 'Interview Panel',
    description: 'Evaluates candidate performance in test/interview, inputs scores and rubrics.',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
    permissions: ['view_assigned_candidates', 'enter_interview_scores', 'submit_evaluations'],
  },
  {
    id: 'doc_verifier',
    name: 'Doc Verification Officer',
    description: 'Verifies uploaded degree certs, caste/id proofs, flags discrepancies.',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300',
    permissions: ['verify_documents', 'flag_discrepancies', 'request_reuploads'],
  },
  {
    id: 'finance_admin',
    name: 'Finance / Admin',
    description: 'Monitors payment reconciliation, processes refunds, views transaction reports.',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-300',
    permissions: ['reconcile_payments', 'process_refunds', 'view_finance_reports'],
  },
  {
    id: 'applicant',
    name: 'Applicant Dashboard',
    description: 'Candidate view to register, apply, pay fee, download admit card, track status.',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300',
    permissions: ['submit_application', 'pay_fee', 'download_admit_card', 'view_my_status'],
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [];

export const INITIAL_DRIVES: RecruitmentDrive[] = [];

export const INITIAL_APPLICATIONS: Application[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

export const INITIAL_USERS: PortalUser[] = [
  {
    id: 'usr-super-01',
    name: 'Super Admin',
    email: 'superadmin@bitmesra.ac.in',
    role: 'super_admin',
    designation: 'Portal Administrator',
    departmentId: 'ADMIN',
    departmentName: 'General Administration',
    mobile: '+91 00000 00000',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    notes: 'Primary System Root SuperAdmin',
    password: 'pass123',
  },
];

