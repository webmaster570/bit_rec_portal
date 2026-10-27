export type UserRole =
  | 'super_admin'
  | 'recruitment_admin'
  | 'recruitment_officer'
  | 'department_admin'
  | 'screening_committee'
  | 'interview_panel'
  | 'doc_verifier'
  | 'finance_admin'
  | 'applicant';

export interface RoleInfo {
  id: UserRole;
  name: string;
  description: string;
  badgeColor: string;
  permissions: string[];
}

export type PortalTheme = 'classic' | 'modern' | 'crimson' | 'academic' | 'nature' | 'sapphire';

export interface PortalBranding {
  title: string;
  subtitle: string;
  logoType: 'icon' | 'image';
  logoIconName: string;
  logoImageUrl: string;
  theme: PortalTheme;
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  departmentId?: string;
  departmentName?: string;
  mobile?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  regNumber?: string;
  notes?: string;
  password?: string;
}

export type ApplicationStage =
  | 'draft'
  | 'submitted'
  | 'under_screening'
  | 'screened_eligible'
  | 'screened_ineligible'
  | 'doc_verification_pending'
  | 'doc_verified'
  | 'doc_discrepancy'
  | 'test_scheduled'
  | 'interview_scheduled'
  | 'interviewed'
  | 'shortlisted'
  | 'selected'
  | 'offer_issued'
  | 'offer_accepted'
  | 'rejected';

export interface Department {
  id: string;
  code: string;
  name: string;
  headEmail: string;
  activePostsCount: number;
}

export interface PostConfig {
  id: string;
  postCode: string;
  title: string;
  departmentId: string;
  departmentName: string;
  payScale: string;
  vacanciesTotal: number;
  vacanciesBreakdown: {
    UR: number;
    OBC: number;
    SC: number;
    ST: number;
    EWS: number;
    PwD: number;
  };
  minAge: number;
  maxAge: number;
  minQualification: string;
  requiredExperienceYears: number;
  applicationFee: number;
  feeExemptCategories: string[];
}

export type DriveStatus = 'draft' | 'published' | 'applications_open' | 'screening_in_progress' | 'interview_phase' | 'completed' | 'archived';

export interface RecruitmentDrive {
  id: string;
  driveCode: string; // e.g. "RD-2026-UNIV-01"
  advtNumber: string; // e.g. "ADV/2026/FAC-004"
  title: string;
  organization: string;
  description: string;
  startDate: string;
  closingDate: string;
  correctionDate: string;
  feeDeadline: string;
  examDate?: string;
  interviewPeriod?: string;
  resultDate?: string;
  status: DriveStatus;
  posts: PostConfig[];
  advtPdfName?: string;
  notificationPdfName?: string;
  syllabusContent?: string;
  showCategoryRow?: boolean;
  totalApplicationsCount: number;
}

export interface AcademicRecord {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  boardOrUniversity: string;
  passingYear: number;
  gradeOrPercentage: string;
  documentRef?: string;
}

export interface ExperienceRecord {
  organization: string;
  designation: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  jobDescription: string;
  documentRef?: string;
}

export interface DocumentAttachment {
  id: string;
  type: 'photo' | 'signature' | 'id_proof' | 'caste_certificate' | '10th_certificate' | '12th_certificate' | 'ug_degree' | 'pg_degree' | 'phd_degree' | 'exp_certificate' | 'noc_certificate';
  name: string;
  fileSize: string;
  uploadedAt: string;
  url: string;
  status: 'pending' | 'verified' | 'discrepancy' | 'rejected';
  discrepancyReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface ApplicantProfile {
  applicantId: string;
  regNumber: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  category: 'UR' | 'OBC' | 'SC' | 'ST' | 'EWS';
  isPwD: boolean;
  pwdType?: string;
  nationality: string;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  email: string;
  mobile: string;
  alternateMobile?: string;
  address: string;
  state: string;
  district: string;
  pin: string;
  photoUrl: string;
  signatureUrl: string;
  idProofType: string;
  idProofNumber: string;
}

export interface ScreeningRemark {
  committeeMember: string;
  committeeMemberRole: string;
  decision: 'Eligible' | 'Provisionally Eligible' | 'Ineligible';
  remarks: string;
  timestamp: string;
}

export interface InterviewEvaluation {
  panelMemberId: string;
  panelMemberName: string;
  writtenTestScore?: number; // max 100
  academicScore?: number; // max 20
  interviewScore: number; // max 50
  teachingDemoScore?: number; // max 30
  comments: string;
  recommendation: 'Strongly Recommend' | 'Recommend' | 'Marginal' | 'Not Recommended';
  submittedAt: string;
}

export interface Application {
  id: string;
  applicationNo: string;
  driveId: string;
  driveTitle: string;
  advtNumber: string;
  postId: string;
  postTitle: string;
  departmentName: string;
  applicant: ApplicantProfile;
  academics: AcademicRecord[];
  experience: ExperienceRecord[];
  documents: DocumentAttachment[];
  submittedAt?: string;
  stage: ApplicationStage;
  
  // Payment
  feeAmount: number;
  paymentStatus: 'Exempted' | 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  transactionId?: string;
  paymentDate?: string;
  paymentReceiptNo?: string;

  // Screening
  screeningStatus?: 'Pending' | 'Eligible' | 'Provisionally Eligible' | 'Ineligible';
  screeningRemarks?: ScreeningRemark[];

  // Document Verification
  docVerificationStatus?: 'Pending' | 'Verified' | 'Discrepancy' | 'Rejected';
  docVerificationRemarks?: string;

  // Admit Card / Test Details
  examCenter?: string;
  examDateTime?: string;
  rollNumber?: string;
  admitCardIssued?: boolean;

  // Test & Interview Evaluation
  interviewDateTime?: string;
  interviewVenue?: string;
  evaluations?: InterviewEvaluation[];
  aggregateScore?: number;

  // Merit & Selection
  meritRank?: number;
  categoryRank?: number;
  selectionCategory?: string;
  selectedStatus?: 'Selected' | 'Waitlisted' | 'Not Selected';

  // Offer
  offerIssuedAt?: string;
  offerDeadline?: string;
  offerStatus?: 'Pending' | 'Accepted' | 'Declined';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: 'Drive' | 'Application' | 'Screening' | 'Document' | 'Interview' | 'Merit' | 'Finance' | 'Admin' | 'Security';
  details: string;
  ipAddress: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetRole?: UserRole | 'all';
  read: boolean;
}

export interface WeightageConfig {
  writtenTestWeight: number; // e.g. 50%
  interviewWeight: number; // e.g. 30%
  academicWeight: number; // e.g. 20%
  tieBreakerRule: 'Age' | 'AcademicScore' | 'WrittenScore';
}

export type TransactionStatus = 'processing' | 'success' | 'failure';

export interface ServerTransactionToast {
  id: string;
  status: TransactionStatus;
  title: string;
  message: string;
  operationTag?: string;
  timestamp: string;
  durationMs?: number;
  errorDetails?: string;
  autoDismissAfter?: number;
}
