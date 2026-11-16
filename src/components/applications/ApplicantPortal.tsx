import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { THEME_CONFIGS, getThemeTitleColor } from '../../themeStyles';
import { Application, OtherExamRecord, PresentEmploymentDetails, ResearchPaperItem, ResearchProjectItem, RecruitmentCategory, Campus } from '../../types';
import { AdmitCardModal } from '../common/AdmitCardModal';
import {
  Send,
  User,
  GraduationCap,
  Briefcase,
  Upload,
  CreditCard,
  CheckCircle2,
  FileText,
  Download,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Building2,
  ArrowRight,
  ArrowLeft,
  Eye,
  Loader2,
  ExternalLink,
  Printer,
  RotateCcw,
  MapPin,
  Search,
  Users,
  ArrowUpDown,
  UserCheck,
  ShieldCheck,
  Phone,
  Home,
  Award,
  Clock,
  BookOpen,
  Library,
  FlaskConical,
  Globe,
  Scale,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import { ApplicationPreviewModal } from './ApplicationPreviewModal';

export const ApplicantPortal: React.FC = () => {
  const { 
    drives, 
    submitApplication, 
    applications, 
    selectedDriveId: ctxDriveId, 
    selectedPostId: ctxPostId,
    setSelectedDriveId: setCtxDriveId,
    setSelectedPostId: setCtxPostId,
    setActiveTab,
    currentUser, 
    users, 
    updateApplication,
    editingAppId,
    setEditingAppId,
    branding,
  } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];
  const titleColorClass = getThemeTitleColor(branding);
  const dbUser = users.find(u => u.email === currentUser?.email);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedDriveId, setSelectedDriveId] = useState<string>(ctxDriveId || drives[0]?.id || 'drive-2026-01');
  const [selectedPostId, setSelectedPostId] = useState<string>(ctxPostId || drives[0]?.posts[0]?.id || 'post-101');
  const [hasSelectedJob, setHasSelectedJob] = useState<boolean>(() => Boolean(editingAppId || ctxPostId));
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [showAdmitCard, setShowAdmitCard] = useState<Application | null>(null);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [stepValidationError, setStepValidationError] = useState<string | null>(null);
  const RequiredMark = () => <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>;

  const formLabelClass = 'block text-xs font-semibold text-slate-700 mb-1.5';
  const formInputClass =
    'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition';
  const formReadonlyClass =
    'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 font-medium cursor-not-allowed focus:outline-none';
  const tableInputClass =
    'w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition';

  // 2-Tab Apply Online Job Directory state
  const [jobCategoryTab, setJobCategoryTab] = useState<RecruitmentCategory>('Teaching');
  const [jobCampusFilter, setJobCampusFilter] = useState<Campus | 'All'>('All');
  const [jobSortBy, setJobSortBy] = useState<'campus_asc' | 'campus_desc' | 'closing_date' | 'title_asc'>('campus_asc');
  const [jobSearchTerm, setJobSearchTerm] = useState<string>('');

  // Sync view mode with external navigation (e.g. clicking Apply Online in Sidebar vs Complete Draft vs clicking a specific post)
  React.useEffect(() => {
    if (editingAppId) {
      setHasSelectedJob(true);
    } else if (ctxPostId) {
      if (ctxDriveId) setSelectedDriveId(ctxDriveId);
      setSelectedPostId(ctxPostId);
      setHasSelectedJob(true);
    } else {
      setHasSelectedJob(false);
      setCurrentAppId(null);
      setSubmittedApp(null);
      setActiveStep(1);
    }
  }, [ctxPostId, ctxDriveId, editingAppId]);

  const activeDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];
  const activePost = activeDrive?.posts.find((p) => p.id === selectedPostId) || activeDrive?.posts[0];

  // Form State
  const [profile, setProfile] = useState({
    applicantId: currentUser?.id || `usr-${Date.now()}`,
    regNumber: currentUser?.regNumber || `REG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    fullName: dbUser?.name || currentUser?.name || 'Rohan Deshmukh',
    fatherName: '',
    motherName: '',
    dob: dbUser?.dob || '1995-06-12',
    ageOnLastDate: '',
    gender: 'Male' as const,
    category: dbUser?.category || 'UR' as const,
    isPwD: false,
    pwdType: '',
    nationality: 'Indian',
    religion: '',
    maritalStatus: 'Single' as const,
    spouseName: '',
    email: currentUser?.email || 'rohan.deshmukh@example.com',
    mobile: dbUser?.mobile || '+91 98234 56789',
    correspondenceAddress: '',
    permanentAddress: '',
    placeOfBirth: '',
    isInstituteEmployee: false,
    isGovtEmployee: false,
    isExServiceMan: false,
    campusUnit: 'Main Campus',
    photoUrl: '',
    signatureUrl: '',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    district: '',
    pin: '',
    firstName: (dbUser?.name || currentUser?.name || '').split(' ')[0] || '',
    middleName: '',
    lastName: (dbUser?.name || currentUser?.name || '').split(' ').slice(1).join(' ') || '',
    subCategory: '',
    categoryCertificateNo: '',
    categoryCertificateDate: '',
    categoryIssuingAuthority: '',
    disabilityPercentage: 0,
    aadhaarNumber: '',
    correspondenceLine1: '',
    correspondenceLine2: '',
    correspondenceLandmark: '',
    correspondenceCity: '',
    correspondenceDistrict: '',
    correspondenceState: 'Jharkhand',
    correspondencePin: '',
    correspondenceCountry: 'India',
    permanentLine1: '',
    permanentLine2: '',
    permanentLandmark: '',
    permanentCity: '',
    permanentDistrict: '',
    permanentState: 'Jharkhand',
    permanentPin: '',
    permanentCountry: 'India',
  });

  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isSigUploading, setIsSigUploading] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const sigInputRef = React.useRef<HTMLInputElement>(null);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'photoUrl') setIsPhotoUploading(true);
    else setIsSigUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64
          }),
        });

        const data = await res.json();
        if (data.success) {
          setUploadError(null);
          setProfile(prev => ({ ...prev, [field]: data.url }));
        } else {
          setUploadError(data.error || 'Image upload failed. Please check file format and size.');
        }
        if (field === 'photoUrl') setIsPhotoUploading(false);
        else setIsSigUploading(false);
      };
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Unable to read image file for upload.');
      if (field === 'photoUrl') setIsPhotoUploading(false);
      else setIsSigUploading(false);
    }
  };


  // Auto-fill from DB User profile
  React.useEffect(() => {
    if (dbUser) {
      setProfile(prev => ({
        ...prev,
        fullName: dbUser.name,
        email: dbUser.email,
        mobile: dbUser.mobile || prev.mobile,
        dob: dbUser.dob || prev.dob,
        category: dbUser.category || prev.category,
        firstName: dbUser.name.split(' ')[0] || '',
        lastName: dbUser.name.split(' ').slice(1).join(' ') || '',
      }));
    }
  }, [dbUser]);

  const calculateAge = (dob: string, targetDate: string) => {
    if (!dob || !targetDate) return '';
    const birth = new Date(dob);
    const target = new Date(targetDate);
    
    if (isNaN(birth.getTime()) || isNaN(target.getTime())) return '';
    
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years < 0) return 'Invalid Date';
    
    return `${years} Years, ${months} Months, ${days} Days`;
  };

  // Auto-calculate age when DOB or active drive closing date changes
  // Auto-calculate age when DOB or active drive closing date changes
  React.useEffect(() => {
    if (profile.dob && activeDrive?.closingDate) {
      const calculatedAge = calculateAge(profile.dob, activeDrive.closingDate);
      if (calculatedAge !== profile.ageOnLastDate) {
        setProfile(prev => ({ ...prev, ageOnLastDate: calculatedAge }));
      }
    } else if (!profile.dob) {
      setProfile(prev => ({ ...prev, ageOnLastDate: '' }));
    }
  }, [profile.dob, activeDrive?.closingDate, profile.ageOnLastDate]);
  
  // Sync campus unit with active post
  React.useEffect(() => {
    if (activePost?.campus) {
      setProfile(prev => ({ ...prev, campusUnit: activePost.campus }));
    }
  }, [activePost?.campus]);
  
  

  const [academics, setAcademics] = useState([
    {
      degree: '10th Class / equivalent',
      fieldOfStudy: 'General',
      institution: 'State Board',
      boardOrUniversity: 'MSBSHSE',
      passingYear: 2011,
      division: 'First',
      cgpa: '',
      gradeOrPercentage: '88%',
      subjects: 'Science, Maths, English',
      proofSlNo: '01'
    },
    {
      degree: '10+2/Higher Secondary/ equivalent',
      fieldOfStudy: 'Science',
      institution: 'Junior College',
      boardOrUniversity: 'MSBSHSE',
      passingYear: 2013,
      division: 'First',
      cgpa: '',
      gradeOrPercentage: '82%',
      subjects: 'Physics, Chemistry, Maths',
      proofSlNo: '02'
    }
  ]);

  const [otherQualifications, setOtherQualifications] = useState<OtherExamRecord[]>([
    {
      examName: '',
      rollNo: '',
      year: '',
      proofSlNo: ''
    }
  ]);

  const [experience, setExperience] = useState([
    {
      organization: 'Pune Institute of Computer Technology',
      designation: 'Assistant Professor (Ad-hoc)',
      startDate: '2022-07-01',
      endDate: '2026-01-30',
      isCurrent: true,
      jobDescription: 'Teaching Data Structures, Operating Systems, and Deep Learning.',
      durationYearsMonths: '3 Years 6 Months',
      proofSlNo: '05'
    },
  ]);

  const [natureOfExperience, setNatureOfExperience] = useState<Application['natureOfExperience']>({
    teaching: { years: 3, months: 6, days: 0, proofSlNo: '05' },
    administrative: { years: 0, months: 0, days: 0 },
    research: { years: 1, months: 0, days: 0, proofSlNo: '06' },
    other: { years: 0, months: 0, days: 0 }
  });

  const [researchPapers, setResearchPapers] = useState('');
  const [researchPublications, setResearchPublications] = useState('');
  const [researchPaperItems, setResearchPaperItems] = useState<ResearchPaperItem[]>([
    { publicationType: '', title: '', journalNameAndPage: '', issnIsbnNo: '', refereed: '', author: '', year: '' }
  ]);
  const [researchBookItems, setResearchBookItems] = useState<ResearchPaperItem[]>([
    { publicationType: '', title: '', journalNameAndPage: '', issnIsbnNo: '', refereed: '', author: '', year: '' }
  ]);
  const [researchProjectItems, setResearchProjectItems] = useState<ResearchProjectItem[]>([
    { majorMinor: '', period: '', totalGrants: '', sponsoringBody: '', outcome: '' }
  ]);
  const [miscInfo, setMiscInfo] = useState({
    punishedDuringService: false,
    medicallyUnfit: false,
    casePending: false,
    additionalInfo: ''
  });

  const [documents, setDocuments] = useState<Application['documents']>([]);

  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    orderId: '',
    transactionId: '',
    paymentMode: 'SBI Collect / Online Payment',
    paymentDate: new Date().toLocaleDateString('en-GB'),
  });

  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const simulatePaymentVerification = () => {
    if (paymentVerified) return;
    setIsVerifyingPayment(true);
    
    // Simulating API latency
    setTimeout(() => {
      const mockTransactionId = `SBI${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const mockOrderId = `ORD-${profile.regNumber.split('-').pop()}-${Date.now().toString().slice(-4)}`;
      
      setPaymentDetails(prev => ({
        ...prev,
        orderId: mockOrderId,
        transactionId: mockTransactionId,
        paymentDate: new Date().toLocaleDateString('en-GB'),
        paymentMode: 'SBI Collect (Net Banking)'
      }));
      
      setIsVerifyingPayment(false);
      setPaymentVerified(true);
      setShowPaymentError(false);
    }, 2000);
  };

  const [pdfExtraFields, setPdfExtraFields] = useState({
    totalExperienceYearsMonths: '3 Years 6 Months',
    relevantExperience: '3 Years in Higher Education',
    presentEmployer: 'Pune Institute of Computer Technology',
    presentDesignation: 'Assistant Professor',
    presentPayLevel: 'Level 10',
    presentBasicPay: '57700',
    presentJoiningDate: '2022-07-01',
    isWorkingInGovtPSU: false,
    isProbationCompleted: true,
    isVigilanceClearanceAvailable: true,
    adminExperienceDetails: '',
    recruitmentMattersExperience: '',
    academicAdminExperience: 'Member of Exam Committee',
    goiRulesKnowledge: 'Familiar with UGC 2018 Regulations',
    financialServiceMattersExperience: '',
    eGovErpSamarthExperience: 'Worked with ERP for attendance',
    awardsRecognitions: 'Best Teacher Award 2024',
    relevantAchievements: 'Published 5 papers in Q1 journals',
    fulfillsQualifications: true,
    fulfillsExperience: true,
    fulfillsAgeCriteria: true,
    isRelaxationClaimed: false,
    isCurrentlyEmployed: true,
    isNocRequired: true,
    disciplinaryPending: false,
    criminalDisclosed: false,
    previouslyAppliedSamePost: false,
    debarredFromExams: false,
    place: 'Pune',
    date: new Date().toISOString().split('T')[0]
  });

  const [extraMisc, setExtraMisc] = useState({
    joiningTimeRequired: '',
    hasComputerProficiency: false,
    institutionalContribution: '',
    suitabilityStatement: '',
    honoursAndAwards: '',
    debarredForUnfairMeans: false,
    administrativeMalpractice: false,
    financialIrregularity: false,
    dischargedOrDismissed: false,
    medicallyUnfitResignation: false,
    nocAvailable: false,
  });

  const [referees, setReferees] = useState([
    { name: '', designation: '', address: '', email: '', mobile: '' },
    { name: '', designation: '', address: '', email: '', mobile: '' }
  ]);

  const [languages, setLanguages] = useState<Application['languages']>([
    { language: 'English', read: true, write: true, speak: true },
    { language: 'Hindi', read: true, write: true, speak: true },
  ]);

  const [presentEmploymentDetails, setPresentEmploymentDetails] = useState<PresentEmploymentDetails>({
    postName: '',
    appointmentType: '',
    dateOfAppointment: '',
    employerName: '',
    payBandAndGradePay: '',
    payLevel: '',
    grossEmoluments: '',
    retirementAge: '',
    retirementDate: '',
    receivingPension: '',
  });

  // Fee Exemption Logic
  const isFeeExempt = activePost?.feeExemptCategories.includes(profile.category) || profile.isPwD || profile.gender === 'Female';
  const feeToPay = isFeeExempt ? 0 : activePost?.applicationFee || 1000;

  // We already have updateApplication from context destructuring at the top

  // Resume from draft logic
  React.useEffect(() => {
    if (editingAppId && currentAppId !== editingAppId && applications.length > 0) {
      const draftApp = applications.find(a => a.id === editingAppId);
      if (draftApp) {
        if (draftApp.stage !== 'draft') {
          // If already submitted, just show the summary/receipt
          setSubmittedApp(draftApp);
          setCurrentAppId(draftApp.id);
          setActiveStep(7);
          setEditingAppId(null);
          return;
        }
        setCurrentAppId(draftApp.id);
        setSelectedDriveId(draftApp.driveId);
        setSelectedPostId(draftApp.postId);
        
        // Map fields using functional updates to ensure consistency
        if (draftApp.applicant) setProfile(prev => ({ ...prev, ...draftApp.applicant }));
        if (draftApp.academics) setAcademics(draftApp.academics);
        if (draftApp.otherQualifications && draftApp.otherQualifications.length > 0) {
          setOtherQualifications(draftApp.otherQualifications);
        }
        if (draftApp.experience) setExperience(draftApp.experience);
        if (draftApp.natureOfExperience) setNatureOfExperience(draftApp.natureOfExperience);
        if (draftApp.researchPapers !== undefined) setResearchPapers(draftApp.researchPapers);
        if (draftApp.researchPublications !== undefined) setResearchPublications(draftApp.researchPublications);
        if (draftApp.researchPaperItems && draftApp.researchPaperItems.length > 0) {
          setResearchPaperItems(draftApp.researchPaperItems);
        }
        if (draftApp.researchBookItems && draftApp.researchBookItems.length > 0) {
          setResearchBookItems(draftApp.researchBookItems);
        }
        if (draftApp.researchProjectItems && draftApp.researchProjectItems.length > 0) {
          setResearchProjectItems(draftApp.researchProjectItems);
        }
        
        setMiscInfo({
          punishedDuringService: draftApp.punishedDuringService || false,
          medicallyUnfit: draftApp.medicallyUnfit || false,
          casePending: draftApp.casePending || false,
          additionalInfo: draftApp.additionalInfo || ''
        });
        
        if (draftApp.documents) setDocuments(draftApp.documents);
        if (draftApp.declarationAccepted !== undefined) setDeclarationAccepted(draftApp.declarationAccepted);
        
        setPaymentDetails({
          orderId: draftApp.orderId || '',
          transactionId: draftApp.transactionId || '',
          paymentMode: draftApp.paymentMode || 'Online Payment Gateway',
          paymentDate: draftApp.paymentDate || new Date().toLocaleDateString('en-GB'),
        });
        
        // Map extra PDF fields
        const extraFields: any = {};
        Object.keys(pdfExtraFields).forEach(key => {
          if ((draftApp as any)[key] !== undefined) {
            extraFields[key] = (draftApp as any)[key];
          }
        });
        if (Object.keys(extraFields).length > 0) {
          setPdfExtraFields(prev => ({ ...prev, ...extraFields }));
        }

        // Map new Misc fields
        const miscUpdates: any = {};
        Object.keys(extraMisc).forEach(key => {
          if ((draftApp as any)[key] !== undefined) {
            miscUpdates[key] = (draftApp as any)[key];
          }
        });
        if (Object.keys(miscUpdates).length > 0) {
          setExtraMisc(prev => ({ ...prev, ...miscUpdates }));
        }
        if (draftApp.referees) setReferees(draftApp.referees);
        if (draftApp.languages) setLanguages(draftApp.languages);
        if (draftApp.presentEmploymentDetails) {
          setPresentEmploymentDetails(prev => ({
            ...prev,
            ...draftApp.presentEmploymentDetails,
          }));
        }
        
        // Only reset to step 1 when first loading the draft
        setActiveStep(1);
      }
    }
  }, [editingAppId, applications, currentAppId]);

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      const missing: string[] = [];
      if (!profile.campusUnit.trim()) missing.push('Campus / Organizational Unit');
      if (!profile.fullName.trim()) missing.push('Full Name');
      if (!profile.fatherName.trim()) missing.push("Father's Name");
      if (!profile.motherName.trim()) missing.push("Mother's Name");
      if (!profile.dob.trim()) missing.push('Date of Birth');
      if (!profile.nationality.trim()) missing.push('Nationality');
      if (!profile.idProofNumber.trim()) missing.push('PAN / Passport / Aadhaar Number');
      if (!profile.email.trim()) missing.push('Email Address');
      if (!profile.mobile.trim()) missing.push('Phone / Mobile Number');
      if (!profile.correspondenceLine1.trim()) missing.push('Correspondence Address Line 1');
      if (!profile.correspondenceCity.trim()) missing.push('Correspondence City');
      if (!profile.correspondenceState.trim()) missing.push('Correspondence State');
      if (!profile.correspondencePin.trim()) missing.push('Correspondence PIN');
      if (!profile.permanentLine1.trim()) missing.push('Permanent Address Line 1');
      if (!profile.permanentCity.trim()) missing.push('Permanent City');
      if (!profile.permanentState.trim()) missing.push('Permanent State');
      if (!profile.permanentPin.trim()) missing.push('Permanent PIN');
      if (missing.length > 0) {
        return `Please complete all mandatory fields (*) before continuing: ${missing.join(', ')}.`;
      }
    }
    if (step === 2) {
      const hasValidAcademic = academics.some(
        (a) => a.degree.trim() && a.boardOrUniversity.trim() && a.passingYear && a.gradeOrPercentage.trim()
      );
      if (!hasValidAcademic) {
        return 'Please complete at least one Educational Qualification entry (Course/Exam, Board/University, Year, and % Marks) before continuing.';
      }
    }
    if (step === 4) {
      const missing: string[] = [];
      if (!extraMisc.joiningTimeRequired.trim()) missing.push('Time Required for Joining');
      if (!extraMisc.suitabilityStatement.trim()) missing.push('Suitability Statement');
      const primaryRef = referees[0];
      const secondaryRef = referees[1];
      if (
        !primaryRef?.name.trim() ||
        !primaryRef?.designation.trim() ||
        !primaryRef?.mobile.trim() ||
        !primaryRef?.email.trim() ||
        !primaryRef?.address.trim()
      ) {
        missing.push('Primary Referee (all fields)');
      }
      if (
        !secondaryRef?.name.trim() ||
        !secondaryRef?.designation.trim() ||
        !secondaryRef?.mobile.trim() ||
        !secondaryRef?.email.trim() ||
        !secondaryRef?.address.trim()
      ) {
        missing.push('Secondary Referee (all fields)');
      }
      if (missing.length > 0) {
        return `Please complete all mandatory fields (*) before continuing: ${missing.join(', ')}.`;
      }
    }
    return null;
  };

  const saveStepData = (nextStep: number) => {
    const validationMsg = nextStep > activeStep ? validateStep(activeStep) : null;
    if (validationMsg) {
      setStepValidationError(validationMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStepValidationError(null);

    const additionalData = {
      natureOfExperience,
      researchPapers,
      researchPublications,
      researchPaperItems,
      researchBookItems,
      researchProjectItems,
      otherQualifications,
      ...miscInfo,
      ...extraMisc,
      referees,
      languages,
      presentEmploymentDetails,
      declarationAccepted,
      orderId: paymentDetails.orderId,
      transactionId: paymentDetails.transactionId,
      paymentMode: paymentDetails.paymentMode,
      paymentDate: paymentDetails.paymentDate,
      stage: 'draft' as const,
      paymentStatus: 'Pending' as const,
      ...pdfExtraFields
    };

    if (!currentAppId) {
      const created = submitApplication(
        selectedDriveId,
        selectedPostId,
        profile,
        academics,
        experience,
        documents,
        isFeeExempt,
        additionalData
      );
      setCurrentAppId(created.id);
    } else {
      updateApplication(currentAppId, {
        applicant: profile,
        academics,
        otherQualifications,
        experience,
        documents,
        ...additionalData
      });
    }
    setActiveStep(nextStep);
  };

  const handleFinalSubmit = () => {
    const finalData = {
      natureOfExperience,
      researchPapers,
      researchPublications,
      researchPaperItems,
      researchBookItems,
      researchProjectItems,
      otherQualifications,
      ...miscInfo,
      ...extraMisc,
      referees,
      languages,
      presentEmploymentDetails,
      declarationAccepted,
      orderId: paymentDetails.orderId,
      transactionId: paymentDetails.transactionId,
      paymentMode: paymentDetails.paymentMode,
      paymentDate: paymentDetails.paymentDate,
      stage: 'submitted' as const,
      paymentStatus: 'Paid' as const,
      ...pdfExtraFields
    };

    if (currentAppId) {
      updateApplication(currentAppId, finalData);
      setSubmittedApp(applications.find(a => a.id === currentAppId) || null);
    } else {
      const createdApp = submitApplication(
        selectedDriveId,
        selectedPostId,
        profile,
        academics,
        experience,
        documents,
        isFeeExempt,
        finalData
      );
      setSubmittedApp(createdApp);
    }
    setEditingAppId(null);
    setActiveStep(7);
  };

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string = 'other') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64
          }),
        });

        const data = await res.json();
        if (data.success) {
          setUploadError(null);
          const newDoc = {
            id: `doc-${Date.now()}`,
            type: type,
            name: data.name,
            fileSize: data.size,
            uploadedAt: new Date().toISOString().split('T')[0],
            url: data.url,
            status: 'pending' as const
          };
          setDocuments(prev => [...prev, newDoc]);
        } else {
          console.error('Upload failed:', data.error);
          setUploadError(data.error || 'Document upload failed.');
        }
        setIsUploading(false);
      };
    } catch (err) {
      console.error('File reading error:', err);
      setUploadError('Unable to read selected document.');
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Institutional Portal Masthead */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 border border-indigo-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 text-white border border-white/30 text-[11px] sm:text-xs font-bold backdrop-blur-xs">
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-200" />
            <span>Recruitment Application Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Online Applicant Registration &amp; Application Entry
          </h2>
          <p className="text-[11px] sm:text-xs md:text-sm text-indigo-100 max-w-2xl leading-relaxed">
            Select an open Teaching or Non-Teaching vacancy and complete your official candidate application dossier.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2.5 shrink-0 relative z-10 border-t md:border-t-0 md:border-l border-white/20 pt-3 md:pt-0 md:pl-6">
          <div className="sm:text-right">
            <span className="text-[11px] font-semibold text-indigo-200 block">Registration Reference</span>
            <span className="font-mono font-extrabold text-white text-sm sm:text-base tabular-nums">{profile.regNumber}</span>
          </div>
          {editingAppId && (
            <button
              type="button"
              onClick={() => {
                setEditingAppId(null);
                setCurrentAppId(null);
                setActiveStep(1);
              }}
              className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-indigo-900 font-extrabold text-xs shadow-sm transition inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Start New Application</span>
            </button>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {stepValidationError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{stepValidationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setStepValidationError(null)}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {!hasSelectedJob ? (
        /* APPLY ONLINE: 2-TAB JOB SELECTION PAGE (TEACHING & NON-TEACHING) */
        (() => {
          const openDrives = drives.filter(
            (d) => d.status === 'applications_open' || d.status === 'published' || d.status === 'screening_in_progress'
          );
          const sourceDrives = openDrives.length > 0 ? openDrives : drives;

          const allOpenJobs = sourceDrives.flatMap((drive) =>
            (drive.posts || []).map((post) => ({
              drive,
              post,
              category: (post.category || drive.category || 'Teaching') as RecruitmentCategory,
              campus: (post.campus || (drive.campus && drive.campus !== 'All Campuses' ? drive.campus : 'BIT Mesra')) as string,
            }))
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

          const myUserApps = applications.filter((app) => {
            if (!currentUser) return false;
            const matchesEmail = currentUser.email && app.applicant.email.toLowerCase() === currentUser.email.toLowerCase();
            const matchesReg = currentUser.regNumber && app.applicant.regNumber === currentUser.regNumber;
            return !!(matchesEmail || matchesReg);
          });

          const term = jobSearchTerm.toLowerCase().trim();
          const filteredJobs = allOpenJobs
            .filter((item) => item.category === jobCategoryTab)
            .filter((item) => jobCampusFilter === 'All' || item.campus === jobCampusFilter)
            .filter((item) => {
              if (!term) return true;
              return (
                item.post.title.toLowerCase().includes(term) ||
                item.post.postCode.toLowerCase().includes(term) ||
                item.post.departmentName.toLowerCase().includes(term) ||
                item.drive.title.toLowerCase().includes(term) ||
                item.drive.advtNumber.toLowerCase().includes(term) ||
                item.campus.toLowerCase().includes(term)
              );
            })
            .sort((a, b) => {
              if (jobSortBy === 'campus_asc') {
                const cmp = a.campus.localeCompare(b.campus);
                return cmp !== 0 ? cmp : a.post.title.localeCompare(b.post.title);
              }
              if (jobSortBy === 'campus_desc') {
                const cmp = b.campus.localeCompare(a.campus);
                return cmp !== 0 ? cmp : a.post.title.localeCompare(b.post.title);
              }
              if (jobSortBy === 'closing_date') {
                return new Date(a.drive.closingDate).getTime() - new Date(b.drive.closingDate).getTime();
              }
              return a.post.title.localeCompare(b.post.title);
            });

          const handleSelectJobToApply = (driveId: string, postId: string, campusVal: string) => {
            setEditingAppId(null);
            setCurrentAppId(null);
            setSubmittedApp(null);
            setSelectedDriveId(driveId);
            setSelectedPostId(postId);
            setCtxDriveId(driveId);
            setCtxPostId(postId);
            setProfile((prev) => ({ ...prev, campusUnit: campusVal }));
            setActiveStep(1);
            setHasSelectedJob(true);
          };

          return (
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
              {/* 2 Tabs: Teaching & Non-Teaching */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setJobCategoryTab('Teaching')}
                    className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${
                      jobCategoryTab === 'Teaching'
                        ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    <GraduationCap className={`w-4 h-4 ${jobCategoryTab === 'Teaching' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Teaching</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono tabular-nums text-[10px] font-extrabold ${
                        jobCategoryTab === 'Teaching' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {teachingCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setJobCategoryTab('Non-Teaching')}
                    className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${
                      jobCategoryTab === 'Non-Teaching'
                        ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    <Briefcase className={`w-4 h-4 ${jobCategoryTab === 'Non-Teaching' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Non-Teaching</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono tabular-nums text-[10px] font-extrabold ${
                        jobCategoryTab === 'Non-Teaching' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {nonTeachingCount}
                    </span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium tabular-nums">
                  Showing <strong className="text-slate-900">{filteredJobs.length}</strong> open {jobCategoryTab} position{filteredJobs.length === 1 ? '' : 's'}
                </div>
              </div>

              {/* Search, Campus Filter & Sort by Campus Bar */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={`Search ${jobCategoryTab} posts, departments, advt no...`}
                    value={jobSearchTerm}
                    onChange={(e) => setJobSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>

                <div className="md:col-span-4">
                  <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Campus:</span>
                    <select
                      value={jobCampusFilter}
                      onChange={(e) => setJobCampusFilter(e.target.value as Campus | 'All')}
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
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
                  <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <select
                      value={jobSortBy}
                      onChange={(e) => setJobSortBy(e.target.value as any)}
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="campus_asc">Sort: Campus (A–Z)</option>
                      <option value="campus_desc">Sort: Campus (Z–A)</option>
                      <option value="closing_date">Sort: Closing Date</option>
                      <option value="title_asc">Sort: Post Title (A–Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Jobs Listing */}
              {filteredJobs.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className={`text-sm font-semibold ${titleColorClass}`}>
                    No {jobCategoryTab} positions found
                  </h4>
                  <p className="text-xs text-blue-700 max-w-md mx-auto">
                    Try changing the selected campus filter or search keyword, or switch between Teaching and Non-Teaching tabs.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {filteredJobs.map(({ drive, post, category, campus }) => {
                    const existingApp = myUserApps.find(
                      (a) => a.driveId === drive.id && a.postId === post.id
                    );

                    return (
                      <div
                        key={`${drive.id}-${post.id}`}
                        className="p-5 hover:bg-slate-50/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                            <span className={`font-semibold ${theme.accentColor}`}>{category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-emerald-700 inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {campus}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-slate-700">{drive.advtNumber}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-slate-600">Code: {post.postCode}</span>
                          </div>

                          <div>
                            <h4 className={`text-base font-bold leading-snug ${titleColorClass}`}>
                              {post.title}
                            </h4>
                            <p className="text-xs text-blue-700 mt-0.5 font-medium">
                              {drive.title} · <span className="font-semibold">{post.departmentName}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 pt-1 tabular-nums">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              Pay Scale: <strong className="text-slate-900 font-semibold">{post.payScale}</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              Vacancies: <strong className="text-slate-900 font-semibold">{Number(post.vacanciesTotal) || 0}</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              Fee: <strong className="text-slate-900 font-semibold">₹{post.applicationFee}</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-rose-500" />
                              Closing Date: <strong className="text-rose-700 font-semibold">{new Date(drive.closingDate).toLocaleDateString()}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-center justify-center gap-2 shrink-0 min-w-[175px]">
                          {existingApp ? (
                            existingApp.stage === 'draft' ? (
                              <button
                                type="button"
                                onClick={() => setEditingAppId(existingApp.id)}
                                className="w-full px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition whitespace-nowrap"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>Continue Draft</span>
                              </button>
                            ) : (
                              <>
                                <span className="text-[11px] font-mono font-semibold text-emerald-700 text-center">
                                  Applied ({existingApp.applicationNo})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('my_jobs')}
                                  className="w-full px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View My Application</span>
                                </button>
                              </>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectJobToApply(drive.id, post.id, campus)}
                              className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition whitespace-nowrap"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Apply Online</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setCtxDriveId(drive.id);
                              setCtxPostId(post.id);
                              setActiveTab('notice_detail');
                            }}
                            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center justify-center gap-1 py-0.5 transition whitespace-nowrap"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Detailed Advertisement</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <>
          {/* Enterprise Segmented Step Navigation Rail */}
          <nav aria-label="Application Steps" className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[780px] divide-x divide-slate-200">
              {[
                { num: 1, label: 'Personal Details', icon: User },
                { num: 2, label: 'Education & Experience', icon: GraduationCap },
                { num: 3, label: 'Research Publications', icon: FileText },
                { num: 4, label: 'Miscellaneous Info', icon: AlertCircle },
                { num: 5, label: 'Document Uploads', icon: Upload },
                { num: 6, label: 'Fee & Declaration', icon: CreditCard },
                { num: 7, label: 'Summary & Receipt', icon: CheckCircle2 },
              ].map((s) => {
                const Icon = s.icon;
                const isDone = activeStep > s.num;
                const isCurrent = activeStep === s.num;

                return (
                  <button
                    key={s.num}
                    type="button"
                    disabled={!isDone}
                    onClick={() => isDone && setActiveStep(s.num)}
                    className={`px-3 py-3.5 flex items-center justify-center gap-2 text-xs transition border-b-2 ${
                      isCurrent
                        ? `border-current bg-slate-50 ${titleColorClass} font-semibold`
                        : isDone
                        ? 'border-emerald-500 bg-white text-emerald-700 font-medium hover:bg-slate-50 cursor-pointer'
                        : 'border-transparent bg-slate-50/40 text-slate-400 font-medium cursor-default'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? theme.accentColor : 'text-slate-400'}`} />
                    )}
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Step Content Area */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            {/* Selected Position Specification Bar */}
            {activeStep < 7 && activePost && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-600">
                  <span className={`font-semibold ${titleColorClass}`}>{activePost.title}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`font-medium ${theme.accentColor}`}>{activePost.campus || profile.campusUnit}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activePost.departmentName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-700">{activeDrive?.advtNumber}</span>
                </div>
                {!editingAppId && (
                  <button
                    type="button"
                    onClick={() => {
                      setCtxPostId(null);
                      setEditingAppId(null);
                      setHasSelectedJob(false);
                    }}
                    className={`${titleColorClass} hover:opacity-80 font-semibold inline-flex items-center gap-1 shrink-0 whitespace-nowrap transition`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Position</span>
                  </button>
                )}
              </div>
            )}

            {/* STEP 1: Personal Profile */}
            {activeStep === 1 && (
              <div className="space-y-8">
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${titleColorClass}`}>
                      <User className={`w-4 h-4 ${theme.accentColor}`} />
                      <span>Applicant Personal Information</span>
                    </h3>
                    <p className="text-xs text-blue-700 mt-0.5 font-medium">
                      Enter candidate identity, reservation category, contact details, and residential addresses as per official records.
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    <span className="text-rose-500 font-bold">*</span> Mandatory fields
                  </span>
                </div>

                {/* Photo & Signature Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200 overflow-hidden">
                  <div className="space-y-2.5 min-w-0">
                    <label className={formLabelClass}>Candidate Recent Photograph (Passport Size)</label>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
                      <div className="w-24 h-32 bg-white border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center relative shrink-0">
                        {profile.photoUrl ? (
                          <img src={profile.photoUrl} alt="Candidate photograph" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-400 flex flex-col items-center gap-1">
                            <User className="w-7 h-7" />
                            <span className="text-[11px]">No Photo</span>
                          </div>
                        )}
                        {isPhotoUploading && (
                          <div className="absolute inset-0 bg-white/85 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 min-w-0 flex-1">
                        <input
                          type="file"
                          ref={photoInputRef}
                          className="hidden"
                          accept="image/png, image/jpeg"
                          onChange={(e) => handleProfileImageUpload(e, 'photoUrl')}
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={isPhotoUploading}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{profile.photoUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                        </button>
                        <p className="text-xs text-slate-500">JPG or PNG format, maximum 500 KB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 min-w-0">
                    <label className={formLabelClass}>Candidate Specimen Signature</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="w-full max-w-[12rem] sm:w-48 h-24 bg-white border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center relative shrink-0">
                        {profile.signatureUrl ? (
                          <img src={profile.signatureUrl} alt="Candidate signature" className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="text-slate-400 flex flex-col items-center gap-1">
                            <FileText className="w-6 h-6" />
                            <span className="text-[11px]">No Signature</span>
                          </div>
                        )}
                        {isSigUploading && (
                          <div className="absolute inset-0 bg-white/85 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 min-w-0 w-full sm:w-auto sm:flex-1">
                        <input
                          type="file"
                          ref={sigInputRef}
                          className="hidden"
                          accept="image/png, image/jpeg"
                          onChange={(e) => handleProfileImageUpload(e, 'signatureUrl')}
                        />
                        <button
                          type="button"
                          onClick={() => sigInputRef.current?.click()}
                          disabled={isSigUploading}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{profile.signatureUrl ? 'Replace Signature' : 'Upload Signature'}</span>
                        </button>
                        <p className="text-xs text-slate-500">JPG or PNG format, maximum 200 KB.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identity & Personal Particulars */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-blue-100 pb-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-blue-700">Identity &amp; Personal Particulars</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                    <div>
                      <label className={formLabelClass}>
                        Campus / Organizational Unit <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BIT Mesra / Main Campus"
                        value={profile.campusUnit}
                        onChange={(e) => setProfile({ ...profile, campusUnit: e.target.value })}
                        className={formInputClass}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>
                        Full Name (In Capital Letters) <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DR. RAJESH KUMAR SHARMA"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value.toUpperCase() })}
                        className={`${formInputClass} font-semibold`}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>
                        Father&apos;s Name <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter father's full name"
                        value={profile.fatherName}
                        onChange={(e) => setProfile({ ...profile, fatherName: e.target.value })}
                        className={formInputClass}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>
                        Mother&apos;s Name <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter mother's full name"
                        value={profile.motherName}
                        onChange={(e) => setProfile({ ...profile, motherName: e.target.value })}
                        className={formInputClass}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>
                        Date of Birth <RequiredMark />
                      </label>
                      <input
                        type="date"
                        required
                        title="Select your date of birth"
                        value={profile.dob}
                        onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                        className={`${formInputClass} font-mono tabular-nums`}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>Age (As on Last Date of Advertisement)</label>
                      <input
                        type="text"
                        value={profile.ageOnLastDate}
                        readOnly
                        placeholder="Auto-calculated from DOB"
                        className={`${formReadonlyClass} tabular-nums`}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>Place of Birth</label>
                      <input
                        type="text"
                        value={profile.placeOfBirth}
                        placeholder="City, State, Country"
                        onChange={(e) => setProfile({ ...profile, placeOfBirth: e.target.value })}
                        className={formInputClass}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>
                        Gender <RequiredMark />
                      </label>
                      <select
                        required
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                        className={formInputClass}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Transgender</option>
                      </select>
                    </div>

                    <div>
                      <label className={formLabelClass}>Marital Status</label>
                      <select
                        value={profile.maritalStatus}
                        onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value as any })}
                        className={formInputClass}
                      >
                        <option value="Single">Unmarried</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>

                    {profile.maritalStatus === 'Married' && (
                      <div>
                        <label className={formLabelClass}>Name of Spouse</label>
                        <input
                          type="text"
                          placeholder="Enter spouse's full name"
                          value={profile.spouseName}
                          onChange={(e) => setProfile({ ...profile, spouseName: e.target.value })}
                          className={formInputClass}
                        />
                      </div>
                    )}

                    <div>
                      <label className={formLabelClass}>
                        Nationality <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Indian"
                        value={profile.nationality}
                        onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                        className={formInputClass}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>Religion</label>
                      <input
                        type="text"
                        placeholder="e.g. Hindu / Muslim / Christian / Sikh"
                        value={profile.religion}
                        onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Category, Reservation & Service Status */}
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2.5 border-b border-blue-100 pb-2.5 pt-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-blue-700">Category, Identification &amp; Employment Status</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                    <div>
                      <label className={formLabelClass}>
                        Reservation Category <RequiredMark />
                      </label>
                      <select
                        required
                        value={profile.category}
                        onChange={(e) => setProfile({ ...profile, category: e.target.value as any })}
                        className={formInputClass}
                      >
                        <option value="UR">UR (General)</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>

                    <div>
                      <label className={formLabelClass}>Person with Disability (PwD)</label>
                      <select
                        value={profile.isPwD ? 'Yes' : 'No'}
                        onChange={(e) => setProfile({ ...profile, isPwD: e.target.value === 'Yes' })}
                        className={formInputClass}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className={formLabelClass}>
                        PAN / Passport / Aadhaar Number <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Aadhaar, PAN, or Passport No."
                        value={profile.idProofNumber}
                        onChange={(e) => setProfile({ ...profile, idProofNumber: e.target.value })}
                        className={`${formInputClass} font-mono tabular-nums`}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>Institute Employee?</label>
                      <select
                        value={profile.isInstituteEmployee ? 'Yes' : 'No'}
                        onChange={(e) => setProfile({ ...profile, isInstituteEmployee: e.target.value === 'Yes' })}
                        className={formInputClass}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className={formLabelClass}>Government Employee?</label>
                      <select
                        value={profile.isGovtEmployee ? 'Yes' : 'No'}
                        onChange={(e) => setProfile({ ...profile, isGovtEmployee: e.target.value === 'Yes' })}
                        className={formInputClass}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className={formLabelClass}>Ex-Serviceman?</label>
                      <select
                        value={profile.isExServiceMan ? 'Yes' : 'No'}
                        onChange={(e) => setProfile({ ...profile, isExServiceMan: e.target.value === 'Yes' })}
                        className={formInputClass}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2.5 border-b border-blue-100 pb-2.5 pt-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-blue-700">Contact Information</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                    <div>
                      <label className={formLabelClass}>
                        Email Address <RequiredMark />
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. applicant@domain.edu"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className={`${formInputClass} font-mono`}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>
                        Phone / Mobile Number <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +91 9876543210"
                        value={profile.mobile}
                        onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                        className={`${formInputClass} font-mono tabular-nums`}
                      />
                    </div>
                  </div>
                </div>

                {/* Correspondence Address */}
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2.5 border-b border-blue-100 pb-2.5 pt-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-blue-700">Correspondence Address</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                    <div>
                      <label className={formLabelClass}>
                        Address line 1 <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="House / Flat No., Street, Locality"
                        value={profile.correspondenceLine1}
                        onChange={(e) => setProfile({ ...profile, correspondenceLine1: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>Address line 2</label>
                      <input
                        type="text"
                        placeholder="Area, Sector, Post Office"
                        value={profile.correspondenceLine2}
                        onChange={(e) => setProfile({ ...profile, correspondenceLine2: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Central Library"
                        value={profile.correspondenceLandmark}
                        onChange={(e) => setProfile({ ...profile, correspondenceLandmark: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>
                        City <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ranchi"
                        value={profile.correspondenceCity}
                        onChange={(e) => setProfile({ ...profile, correspondenceCity: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>
                        State <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jharkhand"
                        value={profile.correspondenceState}
                        onChange={(e) => setProfile({ ...profile, correspondenceState: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>
                        PIN <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="6-digit PIN code (e.g. 835215)"
                        value={profile.correspondencePin}
                        onChange={(e) => setProfile({ ...profile, correspondencePin: e.target.value })}
                        className={`${formInputClass} font-mono tabular-nums`}
                      />
                    </div>
                  </div>
                </div>

                {/* Permanent Address */}
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5 pt-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-blue-700">Permanent Address</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfile({
                          ...profile,
                          permanentLine1: profile.correspondenceLine1,
                          permanentLine2: profile.correspondenceLine2,
                          permanentLandmark: profile.correspondenceLandmark,
                          permanentCity: profile.correspondenceCity,
                          permanentState: profile.correspondenceState,
                          permanentPin: profile.correspondencePin,
                          permanentDistrict: profile.correspondenceDistrict,
                        });
                      }}
                      className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline whitespace-nowrap"
                    >
                      Copy from Correspondence Address
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                    <div>
                      <label className={formLabelClass}>
                        Address line 1 <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="House / Flat No., Street, Locality"
                        value={profile.permanentLine1}
                        onChange={(e) => setProfile({ ...profile, permanentLine1: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>Address line 2</label>
                      <input
                        type="text"
                        placeholder="Area, Sector, Post Office"
                        value={profile.permanentLine2}
                        onChange={(e) => setProfile({ ...profile, permanentLine2: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Railway Station"
                        value={profile.permanentLandmark}
                        onChange={(e) => setProfile({ ...profile, permanentLandmark: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>
                        City <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ranchi"
                        value={profile.permanentCity}
                        onChange={(e) => setProfile({ ...profile, permanentCity: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>
                        State <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jharkhand"
                        value={profile.permanentState}
                        onChange={(e) => setProfile({ ...profile, permanentState: e.target.value })}
                        className={formInputClass}
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>
                        PIN <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="6-digit PIN code (e.g. 835215)"
                        value={profile.permanentPin}
                        onChange={(e) => setProfile({ ...profile, permanentPin: e.target.value })}
                        className={`${formInputClass} font-mono tabular-nums`}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 1 Footer Actions */}
                <div className="flex flex-col items-end gap-2 pt-5 border-t border-slate-200">
                  {stepValidationError && (
                    <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{stepValidationError}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => saveStepData(2)}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition whitespace-nowrap"
                  >
                    <span>Save & Continue to Education</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Education & Experience */}
            {activeStep === 2 && (
              <div className="space-y-8">
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${titleColorClass}`}>
                      <GraduationCap className={`w-4 h-4 ${theme.accentColor}`} />
                      <span>Educational Qualifications &amp; Professional Experience</span>
                    </h3>
                    <p className="text-xs text-blue-700 mt-0.5 font-medium">
                      Provide your academic qualifications, additional technical certifications, present employment details, and chronological service record.
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    <span className="text-rose-500 font-bold">*</span> Mandatory fields
                  </span>
                </div>

                {/* Academic Qualifications Table */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-blue-700">
                          Educational Qualifications <RequiredMark />
                        </h4>
                        <p className="text-xs text-blue-700 font-medium">List degrees and board examinations in chronological order with supporting proof serial numbers.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAcademics([
                          ...academics,
                          {
                            degree: '',
                            fieldOfStudy: '',
                            institution: '',
                            boardOrUniversity: '',
                            passingYear: 2020,
                            division: '',
                            cgpa: '',
                            gradeOrPercentage: '',
                            subjects: '',
                            proofSlNo: '',
                          },
                        ])
                      }
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Qualification</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-xs text-left border-collapse min-w-[820px]">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5 border-r border-slate-200">Name of Course / Exam</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Board / University</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-24">Year</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-24">Division</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-24">CGPA</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-24">% Marks</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Subjects</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-24 text-center">Proof Sl. No.</th>
                          <th className="px-2 py-2.5 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {academics.map((acad, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="e.g. M.Tech / Ph.D."
                                value={acad.degree}
                                onChange={(e) => {
                                  const copy = [...academics];
                                  copy[idx].degree = e.target.value;
                                  setAcademics(copy);
                                }}
                                className={`${tableInputClass} font-semibold`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="University / Board"
                                value={acad.boardOrUniversity}
                                onChange={(e) => {
                                  const copy = [...academics];
                                  copy[idx].boardOrUniversity = e.target.value;
                                  setAcademics(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="number"
                                placeholder="YYYY"
                                value={acad.passingYear}
                                onChange={(e) => {
                                  const copy = [...academics];
                                  copy[idx].passingYear = Number(e.target.value);
                                  setAcademics(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="First"
                                value={acad.division || ''}
                                onChange={(e) => {
                                  const copy = [...academics];
                                  copy[idx].division = e.target.value;
                                  setAcademics(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="9.0"
                                value={acad.cgpa || ''}
                                onChange={(e) => {
                                  const copy = [...academics];
                                  copy[idx].cgpa = e.target.value;
                                  setAcademics(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="85%"
                                value={acad.gradeOrPercentage}
                                onChange={(e) => {
                                  const copy = [...academics];
                                  copy[idx].gradeOrPercentage = e.target.value;
                                  setAcademics(copy);
                                }}
                                className={`${tableInputClass} font-semibold font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Core subjects"
                                value={acad.subjects || ''}
                                onChange={(e) => {
                                  const copy = [...academics];
                                  copy[idx].subjects = e.target.value;
                                  setAcademics(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="01"
                                value={acad.proofSlNo || ''}
                                onChange={(e) => {
                                  const copy = [...academics];
                                  copy[idx].proofSlNo = e.target.value;
                                  setAcademics(copy);
                                }}
                                className={`${tableInputClass} text-center font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setAcademics(academics.filter((_, i) => i !== idx))}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Remove row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Other Qualifications Table */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-blue-700">
                          Any Other Exams Passed (ITI / Diploma / Certificate)
                        </h4>
                        <p className="text-xs text-blue-700 font-medium">Include NET, GATE, SLET, ITI, polytechnic diplomas, or technical certifications.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setOtherQualifications([
                          ...otherQualifications,
                          { examName: '', rollNo: '', year: '', proofSlNo: '' },
                        ])
                      }
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add More</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-xs text-left border-collapse min-w-[640px]">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5 border-r border-slate-200">Name of Exam / Course / Subject</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-40">Roll No.</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-28">Year</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 text-center w-28">Proof Sl. No.</th>
                          <th className="px-2 py-2.5 text-center w-14">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {otherQualifications.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-5 text-center text-slate-500 text-xs">
                              No other exams added. Click &quot;Add More&quot; above to add ITI, Diploma, or Certificate credentials.
                            </td>
                          </tr>
                        ) : (
                          otherQualifications.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="p-2 border-r border-slate-200">
                                <input
                                  type="text"
                                  placeholder="e.g. ITI Electrician / Polytechnic Diploma / Certificate in GIS"
                                  value={item.examName}
                                  onChange={(e) => {
                                    const copy = [...otherQualifications];
                                    copy[idx].examName = e.target.value;
                                    setOtherQualifications(copy);
                                  }}
                                  className={tableInputClass}
                                />
                              </td>
                              <td className="p-2 border-r border-slate-200">
                                <input
                                  type="text"
                                  placeholder="Roll Number"
                                  value={item.rollNo || ''}
                                  onChange={(e) => {
                                    const copy = [...otherQualifications];
                                    copy[idx].rollNo = e.target.value;
                                    setOtherQualifications(copy);
                                  }}
                                  className={`${tableInputClass} font-mono tabular-nums`}
                                />
                              </td>
                              <td className="p-2 border-r border-slate-200">
                                <input
                                  type="number"
                                  placeholder="YYYY"
                                  value={item.year || ''}
                                  onChange={(e) => {
                                    const copy = [...otherQualifications];
                                    copy[idx].year = e.target.value;
                                    setOtherQualifications(copy);
                                  }}
                                  className={`${tableInputClass} font-mono tabular-nums`}
                                />
                              </td>
                              <td className="p-2 border-r border-slate-200 text-center">
                                <input
                                  type="text"
                                  placeholder="e.g. 03"
                                  value={item.proofSlNo || ''}
                                  onChange={(e) => {
                                    const copy = [...otherQualifications];
                                    copy[idx].proofSlNo = e.target.value;
                                    setOtherQualifications(copy);
                                  }}
                                  className={`${tableInputClass} text-center font-mono tabular-nums`}
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (otherQualifications.length === 1) {
                                      setOtherQualifications([{ examName: '', rollNo: '', year: '', proofSlNo: '' }]);
                                    } else {
                                      setOtherQualifications(otherQualifications.filter((_, i) => i !== idx));
                                    }
                                  }}
                                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                  title="Delete entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Present Employment Details */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-blue-700">Present Employment Details</h4>
                        <p className="text-xs text-blue-700 font-medium">Complete these particulars if you are currently holding an appointment.</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
                    <datalist id="appointment-type-options">
                      <option value="Regular" />
                      <option value="Permanent" />
                      <option value="Temporarily" />
                      <option value="Temporary" />
                      <option value="Contractual" />
                      <option value="Ad-hoc" />
                      <option value="Guest Faculty" />
                      <option value="Visiting" />
                      <option value="Deputation" />
                    </datalist>
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Name of the Post
                          </td>
                          <td className="w-1/2 p-2.5">
                            <input
                              type="text"
                              placeholder="e.g. Guest faculty / Assistant Professor"
                              value={presentEmploymentDetails.postName}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({ ...prev, postName: e.target.value }))
                              }
                              className={formInputClass}
                            />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Type of appointment
                          </td>
                          <td className="w-1/2 p-2.5">
                            <input
                              type="text"
                              list="appointment-type-options"
                              placeholder="e.g. Regular / Temporarily / Contractual"
                              value={presentEmploymentDetails.appointmentType}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({ ...prev, appointmentType: e.target.value }))
                              }
                              className={formInputClass}
                            />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Date of Appointment
                          </td>
                          <td className="w-1/2 p-2.5">
                            <input
                              type="date"
                              value={presentEmploymentDetails.dateOfAppointment}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({ ...prev, dateOfAppointment: e.target.value }))
                              }
                              className={`${formInputClass} font-mono tabular-nums`}
                            />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Employer&apos;s Name
                          </td>
                          <td className="w-1/2 p-2.5">
                            <input
                              type="text"
                              placeholder="e.g. Gossner College"
                              value={presentEmploymentDetails.employerName}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({ ...prev, employerName: e.target.value }))
                              }
                              className={formInputClass}
                            />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Pay Band and Grade Pay (6th CPC) / Equivalent
                          </td>
                          <td className="w-1/2 p-2.5">
                            <input
                              type="text"
                              placeholder="e.g. PB-3 (15600-39100) + GP 6000"
                              value={presentEmploymentDetails.payBandAndGradePay}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({ ...prev, payBandAndGradePay: e.target.value }))
                              }
                              className={formInputClass}
                            />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Pay Level / Equivalent
                          </td>
                          <td className="w-1/2 p-2.5">
                            <input
                              type="text"
                              placeholder="e.g. Level 10"
                              value={presentEmploymentDetails.payLevel}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({ ...prev, payLevel: e.target.value }))
                              }
                              className={formInputClass}
                            />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Gross Emoluments
                          </td>
                          <td className="w-1/2 p-2.5">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="e.g. 200000"
                              value={presentEmploymentDetails.grossEmoluments}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({ ...prev, grossEmoluments: e.target.value }))
                              }
                              className={`${formInputClass} font-mono tabular-nums`}
                            />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Age of retirement in the Present Post
                          </td>
                          <td className="w-1/2 p-2.5">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="e.g. 65.00"
                              value={presentEmploymentDetails.retirementAge}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({ ...prev, retirementAge: e.target.value }))
                              }
                              className={`${formInputClass} font-mono tabular-nums`}
                            />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Date of retirement in the Present Post
                          </td>
                          <td className="w-1/2 p-2.5">
                            <input
                              type="date"
                              value={presentEmploymentDetails.retirementDate}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({ ...prev, retirementDate: e.target.value }))
                              }
                              className={`${formInputClass} font-mono tabular-nums`}
                            />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/40">
                          <td className="w-1/2 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/70">
                            Whether you are receiving any pension
                          </td>
                          <td className="w-1/2 p-2.5">
                            <select
                              value={presentEmploymentDetails.receivingPension}
                              onChange={(e) =>
                                setPresentEmploymentDetails((prev) => ({
                                  ...prev,
                                  receivingPension: e.target.value as 'Yes' | 'No' | '',
                                }))
                              }
                              className={formInputClass}
                            >
                              <option value="">Select</option>
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Experience Table */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-blue-700">Chronological List of Experience</h4>
                        <p className="text-xs text-blue-700 font-medium">Record past and current positions in chronological order with service duration.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setExperience([
                          ...experience,
                          {
                            organization: '',
                            designation: '',
                            startDate: '',
                            endDate: '',
                            isCurrent: false,
                            jobDescription: '',
                            durationYearsMonths: '',
                            proofSlNo: '',
                          },
                        ])
                      }
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Experience</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-xs text-left border-collapse min-w-[820px]">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5 border-r border-slate-200">Designation</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Employer Name &amp; Address</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-32">From</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-32">To</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-28">Duration</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Duties</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-24 text-center">Proof Sl. No.</th>
                          <th className="px-2 py-2.5 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {experience.map((exp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Designation"
                                value={exp.designation}
                                onChange={(e) => {
                                  const copy = [...experience];
                                  copy[idx].designation = e.target.value;
                                  setExperience(copy);
                                }}
                                className={`${tableInputClass} font-semibold`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Institution / Organization"
                                value={exp.organization}
                                onChange={(e) => {
                                  const copy = [...experience];
                                  copy[idx].organization = e.target.value;
                                  setExperience(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="date"
                                value={exp.startDate}
                                onChange={(e) => {
                                  const copy = [...experience];
                                  copy[idx].startDate = e.target.value;
                                  setExperience(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="date"
                                value={exp.endDate}
                                onChange={(e) => {
                                  const copy = [...experience];
                                  copy[idx].endDate = e.target.value;
                                  setExperience(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                value={exp.durationYearsMonths || ''}
                                placeholder="Yrs / Mos"
                                onChange={(e) => {
                                  const copy = [...experience];
                                  copy[idx].durationYearsMonths = e.target.value;
                                  setExperience(copy);
                                }}
                                className={`${tableInputClass} tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Key responsibilities"
                                value={exp.jobDescription}
                                onChange={(e) => {
                                  const copy = [...experience];
                                  copy[idx].jobDescription = e.target.value;
                                  setExperience(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="01"
                                value={exp.proofSlNo || ''}
                                onChange={(e) => {
                                  const copy = [...experience];
                                  copy[idx].proofSlNo = e.target.value;
                                  setExperience(copy);
                                }}
                                className={`${tableInputClass} text-center font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Remove row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Nature of Experience Section */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-start gap-2.5 border-b border-blue-100 pb-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-blue-700">Nature of Experience</h4>
                      <p className="text-xs text-blue-700 font-medium">Summarize cumulative duration across teaching, administrative, and research service.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-xs text-left border-collapse min-w-[540px]">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5 border-r border-slate-200">Category</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 text-center w-32">No. of Years</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 text-center w-32">No. of Months</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 text-center w-32">No. of Days</th>
                          <th className="px-3 py-2.5 text-center w-32">Proof Sl. No.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(['teaching', 'administrative', 'research', 'other'] as const).map((key) => (
                          <tr key={key} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 border-r border-slate-200 capitalize font-semibold text-slate-800 bg-slate-50/50">
                              {key}
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="number"
                                placeholder="0"
                                value={natureOfExperience?.[key]?.years || 0}
                                onChange={(e) =>
                                  setNatureOfExperience({
                                    ...natureOfExperience,
                                    [key]: { ...natureOfExperience?.[key], years: Number(e.target.value) },
                                  })
                                }
                                className={`${tableInputClass} text-center font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="number"
                                placeholder="0"
                                value={natureOfExperience?.[key]?.months || 0}
                                onChange={(e) =>
                                  setNatureOfExperience({
                                    ...natureOfExperience,
                                    [key]: { ...natureOfExperience?.[key], months: Number(e.target.value) },
                                  })
                                }
                                className={`${tableInputClass} text-center font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="number"
                                placeholder="0"
                                value={natureOfExperience?.[key]?.days || 0}
                                onChange={(e) =>
                                  setNatureOfExperience({
                                    ...natureOfExperience,
                                    [key]: { ...natureOfExperience?.[key], days: Number(e.target.value) },
                                  })
                                }
                                className={`${tableInputClass} text-center font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                placeholder="e.g. 04"
                                value={natureOfExperience?.[key]?.proofSlNo || ''}
                                onChange={(e) =>
                                  setNatureOfExperience({
                                    ...natureOfExperience,
                                    [key]: { ...natureOfExperience?.[key], proofSlNo: e.target.value },
                                  })
                                }
                                className={`${tableInputClass} text-center font-mono tabular-nums`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 2 Footer Actions */}
                <div className="space-y-3 pt-5 border-t border-slate-200">
                  {stepValidationError && (
                    <div className="flex items-center justify-end gap-1.5 text-rose-700 font-semibold text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{stepValidationError}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStepValidationError(null);
                        setActiveStep(1);
                      }}
                      className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 inline-flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Personal Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => saveStepData(3)}
                      className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 transition whitespace-nowrap"
                    >
                      <span>Save &amp; Continue to Research</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Research Publications */}
            {activeStep === 3 && (
              <div className="space-y-8">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className={`text-base font-bold flex items-center gap-2 ${titleColorClass}`}>
                    <FileText className={`w-4 h-4 ${theme.accentColor}`} />
                    <span>Research Publications</span>
                  </h3>
                  <p className="text-xs text-blue-700 mt-0.5 font-medium">
                    Enter peer-reviewed journal papers, conference proceedings, authored books/chapters, and sponsored research projects relevant to your discipline.
                  </p>
                </div>

                <datalist id="research-paper-pub-types">
                  <option value="Research Paper" />
                  <option value="Review Article" />
                  <option value="Conference Proceeding" />
                </datalist>
                <datalist id="research-book-pub-types">
                  <option value="Book" />
                  <option value="Chapter" />
                  <option value="Edited Work" />
                  <option value="Article" />
                </datalist>

                {/* Table 1: Research Papers/Review Articles/Conference Proceedings */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-blue-700">
                        Research Papers / Review Articles / Conference Proceedings (In Related Areas Only) if any (Optional)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setResearchPaperItems([
                          ...researchPaperItems,
                          { publicationType: '', title: '', journalNameAndPage: '', issnIsbnNo: '', refereed: '', author: '', year: '' },
                        ])
                      }
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-xs text-left border-collapse min-w-[840px]">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-14 text-center">S.No</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-36">Publication type</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Title of the paper</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Journal Name / page number</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-36">ISSN / ISBN NO.</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-28">Refereed</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-36">Author</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-24">Year</th>
                          <th className="px-2 py-2.5 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {researchPaperItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2 border-r border-slate-200 text-center font-mono tabular-nums font-semibold text-slate-600">
                              {idx + 1}
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                list="research-paper-pub-types"
                                placeholder="Type"
                                value={item.publicationType}
                                onChange={(e) => {
                                  const copy = [...researchPaperItems];
                                  copy[idx] = { ...copy[idx], publicationType: e.target.value };
                                  setResearchPaperItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Title of the paper"
                                value={item.title}
                                onChange={(e) => {
                                  const copy = [...researchPaperItems];
                                  copy[idx] = { ...copy[idx], title: e.target.value };
                                  setResearchPaperItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Journal Name / page no."
                                value={item.journalNameAndPage}
                                onChange={(e) => {
                                  const copy = [...researchPaperItems];
                                  copy[idx] = { ...copy[idx], journalNameAndPage: e.target.value };
                                  setResearchPaperItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="ISSN/ISBN"
                                value={item.issnIsbnNo}
                                onChange={(e) => {
                                  const copy = [...researchPaperItems];
                                  copy[idx] = { ...copy[idx], issnIsbnNo: e.target.value };
                                  setResearchPaperItems(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <select
                                value={item.refereed}
                                onChange={(e) => {
                                  const copy = [...researchPaperItems];
                                  copy[idx] = { ...copy[idx], refereed: e.target.value };
                                  setResearchPaperItems(copy);
                                }}
                                className={tableInputClass}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Author"
                                value={item.author}
                                onChange={(e) => {
                                  const copy = [...researchPaperItems];
                                  copy[idx] = { ...copy[idx], author: e.target.value };
                                  setResearchPaperItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="YYYY"
                                value={item.year}
                                onChange={(e) => {
                                  const copy = [...researchPaperItems];
                                  copy[idx] = { ...copy[idx], year: e.target.value };
                                  setResearchPaperItems(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums text-center`}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (researchPaperItems.length === 1) {
                                    setResearchPaperItems([{ publicationType: '', title: '', journalNameAndPage: '', issnIsbnNo: '', refereed: '', author: '', year: '' }]);
                                  } else {
                                    setResearchPaperItems(researchPaperItems.filter((_, i) => i !== idx));
                                  }
                                }}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table 2: Research Publication – Books, Chapters, Edited Works, Articles */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Library className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-blue-700">
                        Research Publication – Books, Chapters, Edited Works, Articles (In Related Areas Only) if any
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setResearchBookItems([
                          ...researchBookItems,
                          { publicationType: '', title: '', journalNameAndPage: '', issnIsbnNo: '', refereed: '', author: '', year: '' },
                        ])
                      }
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-xs text-left border-collapse min-w-[840px]">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-14 text-center">S.No</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-36">Publication type</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Title of the paper</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Journal Name / page number</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-36">ISSN / ISBN NO.</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-28">Refereed</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-36">Author</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-24">Year</th>
                          <th className="px-2 py-2.5 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {researchBookItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2 border-r border-slate-200 text-center font-mono tabular-nums font-semibold text-slate-600">
                              {idx + 1}
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                list="research-book-pub-types"
                                placeholder="Type"
                                value={item.publicationType}
                                onChange={(e) => {
                                  const copy = [...researchBookItems];
                                  copy[idx] = { ...copy[idx], publicationType: e.target.value };
                                  setResearchBookItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Title"
                                value={item.title}
                                onChange={(e) => {
                                  const copy = [...researchBookItems];
                                  copy[idx] = { ...copy[idx], title: e.target.value };
                                  setResearchBookItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Journal / Publisher / page no."
                                value={item.journalNameAndPage}
                                onChange={(e) => {
                                  const copy = [...researchBookItems];
                                  copy[idx] = { ...copy[idx], journalNameAndPage: e.target.value };
                                  setResearchBookItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="ISSN/ISBN"
                                value={item.issnIsbnNo}
                                onChange={(e) => {
                                  const copy = [...researchBookItems];
                                  copy[idx] = { ...copy[idx], issnIsbnNo: e.target.value };
                                  setResearchBookItems(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <select
                                value={item.refereed}
                                onChange={(e) => {
                                  const copy = [...researchBookItems];
                                  copy[idx] = { ...copy[idx], refereed: e.target.value };
                                  setResearchBookItems(copy);
                                }}
                                className={tableInputClass}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Author"
                                value={item.author}
                                onChange={(e) => {
                                  const copy = [...researchBookItems];
                                  copy[idx] = { ...copy[idx], author: e.target.value };
                                  setResearchBookItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="YYYY"
                                value={item.year}
                                onChange={(e) => {
                                  const copy = [...researchBookItems];
                                  copy[idx] = { ...copy[idx], year: e.target.value };
                                  setResearchBookItems(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums text-center`}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (researchBookItems.length === 1) {
                                    setResearchBookItems([{ publicationType: '', title: '', journalNameAndPage: '', issnIsbnNo: '', refereed: '', author: '', year: '' }]);
                                  } else {
                                    setResearchBookItems(researchBookItems.filter((_, i) => i !== idx));
                                  }
                                }}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table 3: Research Project, if any optional */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <FlaskConical className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-blue-700">
                        Research Project, if any optional
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setResearchProjectItems([
                          ...researchProjectItems,
                          { majorMinor: '', period: '', totalGrants: '', sponsoringBody: '', outcome: '' },
                        ])
                      }
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-xs text-left border-collapse min-w-[760px]">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-14 text-center">S.No</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-36">Major / Minor</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-36">Period</th>
                          <th className="px-3 py-2.5 border-r border-slate-200 w-36">Total grants</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Name of sponsoring Body / Funding Agency</th>
                          <th className="px-3 py-2.5 border-r border-slate-200">Outcome of the Project</th>
                          <th className="px-2 py-2.5 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {researchProjectItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2 border-r border-slate-200 text-center font-mono tabular-nums font-semibold text-slate-600">
                              {idx + 1}
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <select
                                value={item.majorMinor}
                                onChange={(e) => {
                                  const copy = [...researchProjectItems];
                                  copy[idx] = { ...copy[idx], majorMinor: e.target.value };
                                  setResearchProjectItems(copy);
                                }}
                                className={tableInputClass}
                              >
                                <option value="">Select</option>
                                <option value="Major">Major</option>
                                <option value="Minor">Minor</option>
                              </select>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="e.g. 2023-2025"
                                value={item.period}
                                onChange={(e) => {
                                  const copy = [...researchProjectItems];
                                  copy[idx] = { ...copy[idx], period: e.target.value };
                                  setResearchProjectItems(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Amount"
                                value={item.totalGrants}
                                onChange={(e) => {
                                  const copy = [...researchProjectItems];
                                  copy[idx] = { ...copy[idx], totalGrants: e.target.value };
                                  setResearchProjectItems(copy);
                                }}
                                className={`${tableInputClass} font-mono tabular-nums`}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Funding Agency"
                                value={item.sponsoringBody}
                                onChange={(e) => {
                                  const copy = [...researchProjectItems];
                                  copy[idx] = { ...copy[idx], sponsoringBody: e.target.value };
                                  setResearchProjectItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                placeholder="Outcome of the Project"
                                value={item.outcome}
                                onChange={(e) => {
                                  const copy = [...researchProjectItems];
                                  copy[idx] = { ...copy[idx], outcome: e.target.value };
                                  setResearchProjectItems(copy);
                                }}
                                className={tableInputClass}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (researchProjectItems.length === 1) {
                                    setResearchProjectItems([{ majorMinor: '', period: '', totalGrants: '', sponsoringBody: '', outcome: '' }]);
                                  } else {
                                    setResearchProjectItems(researchProjectItems.filter((_, i) => i !== idx));
                                  }
                                }}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 3 Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 inline-flex items-center gap-1.5 transition whitespace-nowrap"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Education</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => saveStepData(4)}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 transition whitespace-nowrap"
                  >
                    <span>Save &amp; Continue to Miscellaneous</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Miscellaneous Info */}
            {activeStep === 4 && (
              <div className="space-y-8">
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${titleColorClass}`}>
                      <AlertCircle className={`w-4 h-4 ${theme.accentColor}`} />
                      <span>Miscellaneous Information &amp; Disclosures</span>
                    </h3>
                    <p className="text-xs text-blue-700 mt-0.5 font-medium">
                      Provide joining notice timeline, statement of suitability, language proficiency, statutory disclosures, and two professional referees.
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    <span className="text-rose-500 font-bold">*</span> Mandatory fields
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Career Profile & Languages */}
                  <div className="space-y-5">
                    <div>
                      <label className={formLabelClass}>
                        Time required for joining (in days / months) <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        value={extraMisc.joiningTimeRequired}
                        onChange={(e) => setExtraMisc({ ...extraMisc, joiningTimeRequired: e.target.value })}
                        placeholder="e.g. 30 Days"
                        className={formInputClass}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs font-semibold text-slate-800">
                        Do you have computer proficiency certificate?
                      </span>
                      <div className="flex items-center gap-2">
                        <label
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                            extraMisc.hasComputerProficiency === true
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="computerProficiency"
                            checked={extraMisc.hasComputerProficiency === true}
                            onChange={() => setExtraMisc({ ...extraMisc, hasComputerProficiency: true })}
                            className="text-indigo-600 focus:ring-indigo-600"
                          />
                          <span>Yes</span>
                        </label>
                        <label
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                            extraMisc.hasComputerProficiency === false
                              ? 'bg-slate-200/70 border-slate-400 text-slate-900'
                              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="computerProficiency"
                            checked={extraMisc.hasComputerProficiency === false}
                            onChange={() => setExtraMisc({ ...extraMisc, hasComputerProficiency: false })}
                            className="text-indigo-600 focus:ring-indigo-600"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className={formLabelClass}>
                        Kindly describe your contribution to institutions where you have worked
                      </label>
                      <textarea
                        value={extraMisc.institutionalContribution}
                        onChange={(e) => setExtraMisc({ ...extraMisc, institutionalContribution: e.target.value })}
                        rows={3}
                        placeholder="Summarize academic, research, or administrative contributions"
                        className={formInputClass}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>
                        What makes you suitable for the job? <RequiredMark />
                      </label>
                      <textarea
                        required
                        value={extraMisc.suitabilityStatement}
                        onChange={(e) => setExtraMisc({ ...extraMisc, suitabilityStatement: e.target.value })}
                        rows={3}
                        placeholder="Highlight relevant qualifications, domain expertise, and accomplishments"
                        className={formInputClass}
                      />
                    </div>

                    <div>
                      <label className={formLabelClass}>Honours and awards (If Any)</label>
                      <textarea
                        value={extraMisc.honoursAndAwards}
                        onChange={(e) => setExtraMisc({ ...extraMisc, honoursAndAwards: e.target.value })}
                        rows={2}
                        placeholder="List fellowships, academic honours, or distinctions"
                        className={formInputClass}
                      />
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Globe className="w-3.5 h-3.5" />
                          </span>
                          <h4 className="text-sm font-bold text-blue-700">Languages Known</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setLanguages([...(languages || []), { language: '', read: false, write: false, speak: false }])
                          }
                          className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Language</span>
                        </button>
                      </div>

                      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                            <tr>
                              <th className="px-3 py-2.5 border-r border-slate-200">Language</th>
                              <th className="px-3 py-2.5 border-r border-slate-200 text-center w-16">Read</th>
                              <th className="px-3 py-2.5 border-r border-slate-200 text-center w-16">Write</th>
                              <th className="px-3 py-2.5 border-r border-slate-200 text-center w-16">Speak</th>
                              <th className="px-2 py-2.5 text-center w-14">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {languages?.map((lang, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-2 border-r border-slate-200">
                                  <input
                                    type="text"
                                    value={lang.language}
                                    onChange={(e) => {
                                      const newLangs = [...languages];
                                      newLangs[idx].language = e.target.value;
                                      setLanguages(newLangs);
                                    }}
                                    placeholder="e.g. English"
                                    className={`${tableInputClass} font-semibold`}
                                  />
                                </td>
                                <td className="p-2 border-r border-slate-200 text-center">
                                  <input
                                    type="checkbox"
                                    checked={lang.read}
                                    onChange={(e) => {
                                      const newLangs = [...languages];
                                      newLangs[idx].read = e.target.checked;
                                      setLanguages(newLangs);
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                  />
                                </td>
                                <td className="p-2 border-r border-slate-200 text-center">
                                  <input
                                    type="checkbox"
                                    checked={lang.write}
                                    onChange={(e) => {
                                      const newLangs = [...languages];
                                      newLangs[idx].write = e.target.checked;
                                      setLanguages(newLangs);
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                  />
                                </td>
                                <td className="p-2 border-r border-slate-200 text-center">
                                  <input
                                    type="checkbox"
                                    checked={lang.speak}
                                    onChange={(e) => {
                                      const newLangs = [...languages];
                                      newLangs[idx].speak = e.target.checked;
                                      setLanguages(newLangs);
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                  />
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                    title="Delete language"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Legal & Disciplinary Disclosures */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 border-b border-blue-100 pb-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Scale className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-blue-700">Legal &amp; Disciplinary Disclosures</h4>
                        <p className="text-xs text-blue-700 font-medium">Select Yes or No accurately for each statutory disclosure item.</p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 bg-white overflow-hidden">
                      {[
                        { label: 'Debarred or punished for adopting unfair means in any examination?', key: 'debarredForUnfairMeans' },
                        { label: 'Involved in any administrative malpractice?', key: 'administrativeMalpractice' },
                        { label: 'Involved in any financial irregularity?', key: 'financialIrregularity' },
                        { label: 'Ever discharged or dismissed from previous employment?', key: 'dischargedOrDismissed' },
                        { label: 'Pending or contemplated disciplinary proceeding against you?', key: 'pendingDisciplinaryProceeding' },
                        { label: 'Declared medically unfit or asked to resign on discharge/dismissed?', key: 'medicallyUnfitResignation' },
                        { label: 'No objection certificate available?', key: 'nocAvailable' },
                      ].map((item) => {
                        const currentVal = (extraMisc as Record<string, unknown>)[item.key];
                        return (
                          <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-slate-50/50">
                            <span className="text-xs font-medium text-slate-800 leading-relaxed">{item.label}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <label
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer transition ${
                                  currentVal === true
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`disclosure-${item.key}`}
                                  checked={currentVal === true}
                                  onChange={() => setExtraMisc({ ...extraMisc, [item.key]: true })}
                                  className="text-indigo-600 focus:ring-indigo-600"
                                />
                                <span>Yes</span>
                              </label>
                              <label
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer transition ${
                                  currentVal === false
                                    ? 'bg-slate-100 border-slate-400 text-slate-900'
                                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`disclosure-${item.key}`}
                                  checked={currentVal === false}
                                  onChange={() => setExtraMisc({ ...extraMisc, [item.key]: false })}
                                  className="text-indigo-600 focus:ring-indigo-600"
                                />
                                <span>No</span>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Referees Section (Zero Numbering) */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-start gap-2.5 border-b border-blue-100 pb-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-blue-700">
                        Two Referees Familiar With Your Profile <RequiredMark />
                      </h4>
                      <p className="text-xs text-blue-700 font-medium">Provide contact details for two senior academic or professional referees (not related by blood/marriage).</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {referees.map((ref, idx) => (
                      <div key={idx} className="p-5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
                        <div className="flex items-center gap-2 border-b border-blue-100 pb-2.5">
                          <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <UserCheck className="w-3.5 h-3.5" />
                          </span>
                          <h5 className="text-sm font-bold text-blue-700">
                            {idx === 0 ? 'Primary Referee' : idx === 1 ? 'Secondary Referee' : 'Additional Referee'}
                            {idx < 2 && <RequiredMark />}
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className={formLabelClass}>
                              Full Name {idx < 2 && <RequiredMark />}
                            </label>
                            <input
                              type="text"
                              required={idx < 2}
                              placeholder="e.g. Prof. A. K. Verma"
                              value={ref.name}
                              onChange={(e) => {
                                const newRefs = [...referees];
                                newRefs[idx].name = e.target.value;
                                setReferees(newRefs);
                              }}
                              className={formInputClass}
                            />
                          </div>
                          <div>
                            <label className={formLabelClass}>
                              Designation {idx < 2 && <RequiredMark />}
                            </label>
                            <input
                              type="text"
                              required={idx < 2}
                              placeholder="e.g. Professor & Head"
                              value={ref.designation}
                              onChange={(e) => {
                                const newRefs = [...referees];
                                newRefs[idx].designation = e.target.value;
                                setReferees(newRefs);
                              }}
                              className={formInputClass}
                            />
                          </div>
                          <div>
                            <label className={formLabelClass}>
                              Mobile Number {idx < 2 && <RequiredMark />}
                            </label>
                            <input
                              type="text"
                              required={idx < 2}
                              placeholder="10-digit mobile"
                              value={ref.mobile}
                              onChange={(e) => {
                                const newRefs = [...referees];
                                newRefs[idx].mobile = e.target.value;
                                setReferees(newRefs);
                              }}
                              className={`${formInputClass} font-mono tabular-nums`}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className={formLabelClass}>
                              Email Address {idx < 2 && <RequiredMark />}
                            </label>
                            <input
                              type="email"
                              required={idx < 2}
                              placeholder="referee@institution.edu"
                              value={ref.email}
                              onChange={(e) => {
                                const newRefs = [...referees];
                                newRefs[idx].email = e.target.value;
                                setReferees(newRefs);
                              }}
                              className={formInputClass}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className={formLabelClass}>
                              Official Address {idx < 2 && <RequiredMark />}
                            </label>
                            <textarea
                              required={idx < 2}
                              value={ref.address}
                              onChange={(e) => {
                                const newRefs = [...referees];
                                newRefs[idx].address = e.target.value;
                                setReferees(newRefs);
                              }}
                              rows={2}
                              placeholder="Department, Institution, City & PIN"
                              className={formInputClass}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 4 Footer Actions */}
                <div className="space-y-3 pt-5 border-t border-slate-200">
                  {stepValidationError && (
                    <div className="flex items-center justify-end gap-1.5 text-rose-700 font-semibold text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{stepValidationError}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStepValidationError(null);
                        setActiveStep(3);
                      }}
                      className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 inline-flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Research</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => saveStepData(5)}
                      className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 transition whitespace-nowrap"
                    >
                      <span>Save &amp; Continue to Uploads</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Document Uploads */}
            {activeStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className={`text-base font-bold flex items-center gap-2 ${titleColorClass}`}>
                    <Upload className={`w-4 h-4 ${theme.accentColor}`} />
                    <span>Document Upload &amp; Verification Preparation</span>
                  </h3>
                  <p className="text-xs text-blue-700 mt-0.5 font-medium">
                    Upload self-attested academic certificates, experience letters, category documents, and valid photo identification (PDF, JPG, or PNG up to 5 MB).
                  </p>
                </div>

                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5">
                  <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    <div className="flex-1">
                      <label htmlFor="docTypeSelect" className={formLabelClass}>
                        Select Document Category
                      </label>
                      <select
                        id="docTypeSelect"
                        className={formInputClass}
                      >
                        <option value="degree_10th">10th Class Certificate</option>
                        <option value="degree_12th">12th Class / Diploma Certificate</option>
                        <option value="degree_ug">Undergraduate Degree</option>
                        <option value="degree_pg">Postgraduate Degree</option>
                        <option value="degree_phd">PhD / Research Degree</option>
                        <option value="experience_proof">Experience / NOC Certificate</option>
                        <option value="caste_certificate">Caste / Category Certificate</option>
                        <option value="id_proof">ID Proof (Aadhaar/PAN)</option>
                        <option value="other">Other Supporting Document</option>
                      </select>
                    </div>

                    <div className="flex-[2]">
                      <label className={formLabelClass}>Upload Supporting File</label>
                      <div
                        onClick={() => {
                          const type = (document.getElementById('docTypeSelect') as HTMLSelectElement).value;
                          if (!isUploading) {
                            const input = fileInputRef.current;
                            if (input) {
                              input.setAttribute('data-current-type', type);
                              input.click();
                            }
                          }
                        }}
                        className={`bg-white px-4 py-2 rounded-lg border border-dashed ${
                          isUploading ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20'
                        } cursor-pointer transition flex items-center justify-center gap-2.5 min-h-[40px]`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const type = e.currentTarget.getAttribute('data-current-type') || 'other';
                            handleFileUpload(e, type);
                          }}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                            <span className="text-xs font-semibold text-indigo-700">Uploading document...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-semibold text-slate-700">
                              Choose File (PDF / JPG / PNG up to 5 MB)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {documents.length === 0 ? (
                  <div className="border border-slate-200 rounded-xl p-8 text-center bg-white">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No documents uploaded yet</p>
                    <p className="text-xs text-blue-700 mt-0.5 font-medium">Select a document category above and upload your supporting files.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-xs font-semibold text-slate-900 block truncate" title={doc.name}>
                            {doc.name}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="capitalize">{doc.type.replace(/_/g, ' ')}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{doc.fileSize}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            Uploaded
                          </span>
                          <a
                            href={`${window.location.origin}${doc.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-700 hover:border-indigo-300 transition"
                            title="View Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 5 Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 inline-flex items-center gap-1.5 transition whitespace-nowrap"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Miscellaneous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => saveStepData(6)}
                    disabled={isUploading}
                    className={`px-5 py-2.5 rounded-lg ${
                      isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white font-semibold text-xs inline-flex items-center gap-2 transition whitespace-nowrap`}
                  >
                    <span>Save &amp; Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Fee Payment & Declaration */}
            {activeStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className={`text-base font-bold flex items-center gap-2 ${titleColorClass}`}>
                    <CreditCard className={`w-4 h-4 ${theme.accentColor}`} />
                    <span>Application Fee Breakdown &amp; Declaration</span>
                  </h3>
                  <p className="text-xs text-blue-700 mt-0.5 font-medium">
                    Review the applicable recruitment fee, record SBI Collect transaction details, and accept the formal candidate declaration.
                  </p>
                </div>

                <div className="bg-slate-50/70 p-5 sm:p-6 rounded-xl border border-slate-200 space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-100 pb-4">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Receipt className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-blue-700">Application Fee Summary</h4>
                        <p className="text-xs text-blue-700 mt-0.5 font-medium">
                          Review your fee details and complete payment if applicable.
                        </p>
                      </div>
                    </div>
                    {!isFeeExempt && (
                      <div className="flex flex-wrap gap-2.5">
                        <a
                          href="https://sbcollect.sbi.bank.in/sbicollect/icollecthome.htm?corpID=322526"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition inline-flex items-center gap-2 whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Pay via SBI Collect</span>
                        </a>
                        <button
                          type="button"
                          onClick={simulatePaymentVerification}
                          disabled={isVerifyingPayment || paymentVerified}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition inline-flex items-center gap-2 whitespace-nowrap ${
                            paymentVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isVerifyingPayment ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : paymentVerified ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Payment Verified</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Verify &amp; Auto-fill IDs</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-medium text-slate-500 block">Standard Fee</span>
                      <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
                        ₹{activePost?.applicationFee || 1000}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-medium text-slate-500 block">Exemption Status</span>
                      <div className={`text-sm font-semibold mt-1.5 ${isFeeExempt ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {isFeeExempt ? 'Eligible (Exempted)' : 'Not Eligible'}
                      </div>
                    </div>
                    <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
                      <span className="text-xs font-semibold text-indigo-700 block">Net Payable</span>
                      <div className="text-lg font-bold text-indigo-700 font-mono tabular-nums mt-1">
                        ₹{feeToPay}
                      </div>
                    </div>
                  </div>

                  {!isFeeExempt && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-blue-700 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <CreditCard className="w-3.5 h-3.5" />
                        </span>
                        <span>Enter Payment Confirmation Details</span>
                      </h4>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                        <table className="w-full text-xs text-left border-collapse min-w-[680px]">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-slate-700 font-semibold">
                              <th className="px-3 py-2.5 border-r border-slate-200">
                                Order ID <span className="text-rose-500">*</span>
                              </th>
                              <th className="px-3 py-2.5 border-r border-slate-200">
                                Transaction ID <span className="text-rose-500">*</span>
                              </th>
                              <th className="px-3 py-2.5 border-r border-slate-200 w-28">Amount Paid</th>
                              <th className="px-3 py-2.5 border-r border-slate-200 w-36">
                                Mode <span className="text-rose-500">*</span>
                              </th>
                              <th className="px-3 py-2.5 w-36">
                                Date <span className="text-rose-500">*</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="text-slate-900">
                              <td className="p-2 border-r border-slate-200">
                                <input
                                  type="text"
                                  placeholder="Enter Order ID"
                                  value={paymentDetails.orderId}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, orderId: e.target.value })}
                                  className={`${tableInputClass} font-mono font-semibold text-indigo-700`}
                                />
                              </td>
                              <td className="p-2 border-r border-slate-200">
                                <input
                                  type="text"
                                  placeholder="Enter Transaction ID"
                                  value={paymentDetails.transactionId}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
                                  className={`${tableInputClass} font-mono font-semibold text-indigo-700`}
                                />
                              </td>
                              <td className="px-3 py-2 border-r border-slate-200 font-semibold font-mono tabular-nums bg-slate-50/70">
                                ₹{feeToPay}
                              </td>
                              <td className="p-2 border-r border-slate-200">
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. SBI Collect / Net Banking"
                                  value={paymentDetails.paymentMode}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMode: e.target.value })}
                                  className={tableInputClass}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  required
                                  placeholder="DD/MM/YYYY"
                                  value={paymentDetails.paymentDate}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentDate: e.target.value })}
                                  className={`${tableInputClass} font-mono tabular-nums`}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Declaration Box */}
                <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-blue-100 pb-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-blue-700">
                      Candidate Declaration <RequiredMark />
                    </h4>
                  </div>
                  <p className="leading-relaxed">
                    I, <span className="font-semibold text-slate-900 underline decoration-slate-400 px-1">{profile.fullName || 'Candidate'}</span> son/daughter of{' '}
                    <span className="font-semibold text-slate-900 underline decoration-slate-400 px-1">{profile.fatherName || 'Guardian'}</span> hereby declare that all the statements and entries made in this application are true, complete and correct to the best of my knowledge and belief. In the event of any information found false or incorrect or ineligibility being detected before or after the Selection Committee and Executive Council/Board of Management meetings, my candidature/appointment may be cancelled by the University.
                  </p>
                  <p className="leading-relaxed">
                    I have never been convicted or contemplated for any unlawful activity.
                  </p>
                  <label className="inline-flex items-center gap-2.5 cursor-pointer pt-2 select-none">
                    <input
                      type="checkbox"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-xs font-semibold text-slate-900">
                      I Accept the Declaration <RequiredMark />
                    </span>
                  </label>
                </div>

                {showPaymentError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 font-medium text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Order ID, Transaction ID, Payment Mode, and Payment Date are required for non-exempt candidates before final submission.</span>
                  </div>
                )}

                {/* Step 6 Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentError(false);
                      setActiveStep(5);
                    }}
                    className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 inline-flex items-center gap-1.5 transition whitespace-nowrap"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Uploads</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="px-5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs inline-flex items-center gap-2 hover:bg-slate-50 transition whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Preview Application Form</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          !isFeeExempt &&
                          (!paymentDetails.orderId.trim() ||
                            !paymentDetails.transactionId.trim() ||
                            !paymentDetails.paymentMode.trim() ||
                            !paymentDetails.paymentDate.trim())
                        ) {
                          setShowPaymentError(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          return;
                        }
                        setShowPaymentError(false);
                        handleFinalSubmit();
                      }}
                      disabled={!declarationAccepted}
                      className={`px-6 py-2.5 rounded-lg ${
                        declarationAccepted
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      } font-semibold text-xs inline-flex items-center gap-2 transition whitespace-nowrap`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Final Application</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Summary & Receipt */}
            {activeStep === 7 && submittedApp && (
              <div className="max-w-2xl mx-auto py-4 space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${titleColorClass}`}>Application Submitted Successfully</h3>
                    <p className="text-xs sm:text-sm text-blue-700 mt-1 font-medium">
                      Your application dossier has been recorded in the recruitment database and forwarded for screening.
                    </p>
                  </div>
                </div>

                <dl className="bg-slate-50/70 rounded-xl border border-slate-200 divide-y divide-slate-200 text-xs">
                  <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <dt className="text-slate-500 font-medium">Application Number</dt>
                    <dd className={`font-mono tabular-nums font-bold text-sm ${titleColorClass}`}>{submittedApp.applicationNo}</dd>
                  </div>
                  <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <dt className="text-slate-500 font-medium">Candidate Name</dt>
                    <dd className="font-semibold text-slate-900">{submittedApp.applicant.fullName}</dd>
                  </div>
                  <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <dt className="text-slate-500 font-medium">Applied Post</dt>
                    <dd className="font-semibold text-slate-800 text-right">{submittedApp.postTitle}</dd>
                  </div>
                  <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <dt className="text-slate-500 font-medium">Payment Status</dt>
                    <dd className="font-semibold text-emerald-700">{submittedApp.paymentStatus}</dd>
                  </div>
                  <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <dt className="text-slate-500 font-medium">Submission Date</dt>
                    <dd className="font-mono tabular-nums text-slate-700">{new Date().toLocaleDateString()}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 inline-flex items-center gap-2 transition whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Print Acknowledgement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs inline-flex items-center gap-2 transition whitespace-nowrap"
                  >
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <span>Preview / Print Application</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAdmitCard(submittedApp)}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 transition whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Preview Admit Card</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showAdmitCard && (
        <AdmitCardModal application={showAdmitCard} onClose={() => setShowAdmitCard(null)} />
      )}

      {isPreviewOpen && (
        <ApplicationPreviewModal
          application={{
            ...profile,
            ...pdfExtraFields,
            researchPapers,
            researchPublications,
            researchPaperItems,
            researchBookItems,
            researchProjectItems,
            ...miscInfo,
            ...extraMisc,
            referees,
            applicant: profile,
            academics,
            otherQualifications,
            experience,
            documents,
            postId: selectedPostId,
            postTitle: activePost?.title,
            departmentName: activePost?.departmentName,
            campus: activePost?.campus,
            advtNumber: activeDrive?.advtNumber,
            applicationNo: applications.find(a => a.id === currentAppId)?.applicationNo || profile.regNumber || 'DRAFT-PREVIEW',
            languages,
            presentEmploymentDetails,
          }}
          drive={activeDrive}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};
