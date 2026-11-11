import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Application, OtherExamRecord } from '../../types';
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
} from 'lucide-react';
import { ApplicationPreviewModal } from './ApplicationPreviewModal';

export const ApplicantPortal: React.FC = () => {
  const { 
    drives, 
    submitApplication, 
    applications, 
    selectedDriveId: ctxDriveId, 
    selectedPostId: ctxPostId, 
    currentUser, 
    users, 
    updateApplication,
    editingAppId,
    setEditingAppId 
  } = usePortal();
  const dbUser = users.find(u => u.email === currentUser?.email);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedDriveId, setSelectedDriveId] = useState<string>(ctxDriveId || drives[0]?.id || 'drive-2026-01');
  const [selectedPostId, setSelectedPostId] = useState<string>(ctxPostId || drives[0]?.posts[0]?.id || 'post-101');
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [showAdmitCard, setShowAdmitCard] = useState<Application | null>(null);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    correspondenceCity: '',
    correspondenceDistrict: '',
    correspondenceState: '',
    correspondencePin: '',
    correspondenceCountry: 'India',
    permanentLine1: '',
    permanentLine2: '',
    permanentCity: '',
    permanentDistrict: '',
    permanentState: '',
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
          setProfile(prev => ({ ...prev, [field]: data.url }));
        } else {
          alert('Upload failed: ' + data.error);
        }
        if (field === 'photoUrl') setIsPhotoUploading(false);
        else setIsSigUploading(false);
      };
    } catch (err) {
      console.error('Upload error:', err);
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
    languagesKnown: 'English, Hindi, Marathi',
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
        
        // Only reset to step 1 when first loading the draft
        setActiveStep(1);
      }
    }
  }, [editingAppId, applications, currentAppId]);

  const saveStepData = (nextStep: number) => {
    const additionalData = {
      natureOfExperience,
      researchPapers,
      researchPublications,
      otherQualifications,
      ...miscInfo,
      ...extraMisc,
      referees,
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
      otherQualifications,
      ...miscInfo,
      ...extraMisc,
      referees,
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
          alert('Upload failed: ' + data.error);
        }
        setIsUploading(false);
      };
    } catch (err) {
      console.error('File reading error:', err);
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-700 border border-indigo-600 p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center space-x-2">
            <Send className="w-6 h-6 text-blue-100" />
            <h2 className="text-xl font-bold">Online Applicant Registration Portal</h2>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            Submit formal application for Faculty and Staff recruitment drives online.
          </p>
        </div>

        <div className="text-right text-xs space-y-1">
          <div>
            <span className="text-blue-100 block">Registration Reference:</span>
            <span className="font-mono font-bold text-white text-sm">{profile.regNumber}</span>
          </div>
          {editingAppId && (
            <button
              onClick={() => {
                setEditingAppId(null);
                setCurrentAppId(null);
                setActiveStep(1);
                // The useEffect for dbUser will re-populate basic info
              }}
              className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white border border-white/30 transition flex items-center gap-1 ml-auto"
            >
              <Plus className="w-3 h-3" />
              <span>Start New Application</span>
            </button>
          )}
        </div>
      </div>

      {/* Wizard Steps Navigation Bar */}
      <div className="glass-card border border-slate-200 rounded-xl p-3 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
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
              <div
                key={s.num}
                onClick={() => isDone && setActiveStep(s.num)}
                className={`flex items-center space-x-2 cursor-pointer transition ${
                  isCurrent
                    ? 'text-indigo-600 font-bold'
                    : isDone
                    ? 'text-emerald-600 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                      : isDone
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-xs whitespace-nowrap">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Area */}
      <div className="glass-card border border-slate-200 rounded-2xl p-6 shadow-2xs">
        {/* Drive and Post Selection Header */}
        {activeStep < 6 && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Recruitment Drive
              </label>
              <select
                value={selectedDriveId}
                onChange={(e) => {
                  setSelectedDriveId(e.target.value);
                  const d = drives.find((dr) => dr.id === e.target.value);
                  if (d && d.posts[0]) setSelectedPostId(d.posts[0].id);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.advtNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Position / Post
              </label>
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                {activeDrive?.posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {p.departmentName} (Fee: ₹{p.applicationFee})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 1: Personal Profile */}
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* Auto-generated Registration & Fee Tables from image_b8282c66.png */}
            <div className="space-y-6 mb-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Registration</h4>
                <div className="overflow-x-auto border border-slate-300 rounded-sm">
                  <table className="w-full text-[11px] text-left border-collapse bg-white">
                    <thead className="bg-slate-50 border-b border-slate-300">
                      <tr className="text-slate-700">
                        <th className="p-2 border-r border-slate-300">Application Number (auto generated)</th>
                        <th className="p-2 border-r border-slate-300">Post</th>
                        <th className="p-2 border-r border-slate-300">Campus/Organizational Unit</th>
                        <th className="p-2 border-r border-slate-300">Branch/Department</th>
                        <th className="p-2">Advertisement Number (auto generated)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-slate-900">
                        <td className="p-2 border-r border-slate-300 font-mono">{profile.regNumber}</td>
                        <td className="p-2 border-r border-slate-300">{activePost?.title}</td>
                        <td className="p-2 border-r border-slate-300 font-semibold">{profile.campusUnit}</td>
                        <td className="p-2 border-r border-slate-300">{activePost?.departmentName}</td>
                        <td className="p-2 font-mono">{activeDrive?.advtNumber}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>


            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Step 1: Applicant Personal Information
            </h3>

            {/* Photo & Signature Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Candidate Recent Photo (Passport Size)</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-32 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center relative group">
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center">
                        <User className="w-8 h-8" />
                        <span className="text-[10px]">No Photo</span>
                      </div>
                    )}
                    {isPhotoUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input 
                      type="file" 
                      ref={photoInputRef}
                      className="hidden" 
                      accept="image/png, image/jpeg"
                      onChange={(e) => handleProfileImageUpload(e, 'photoUrl')}
                    />
                    <button 
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isPhotoUploading}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {profile.photoUrl ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    <p className="text-[10px] text-slate-500">Max 500KB. JPG/PNG only.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Candidate Signature</label>
                <div className="flex items-center gap-4">
                  <div className="w-48 h-20 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center relative group">
                    {profile.signatureUrl ? (
                      <img src={profile.signatureUrl} alt="Signature" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center">
                        <FileText className="w-8 h-8" />
                        <span className="text-[10px]">No Signature</span>
                      </div>
                    )}
                    {isSigUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input 
                      type="file" 
                      ref={sigInputRef}
                      className="hidden" 
                      accept="image/png, image/jpeg"
                      onChange={(e) => handleProfileImageUpload(e, 'signatureUrl')}
                    />
                    <button 
                      onClick={() => sigInputRef.current?.click()}
                      disabled={isSigUploading}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {profile.signatureUrl ? 'Change Signature' : 'Upload Signature'}
                    </button>
                    <p className="text-[10px] text-slate-500">Max 200KB. JPG/PNG only.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Campus / Org Unit</label>
                <input
                  type="text"
                  value={profile.campusUnit}
                  onChange={(e) => setProfile({ ...profile, campusUnit: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name (In Capital Letters)</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Father's Name</label>
                <input
                  type="text"
                  value={profile.fatherName}
                  onChange={(e) => setProfile({ ...profile, fatherName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mother's Name</label>
                <input
                  type="text"
                  value={profile.motherName}
                  onChange={(e) => setProfile({ ...profile, motherName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dob}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Age (on last date of advt)</label>
                <input
                  type="text"
                  value={profile.ageOnLastDate}
                  readOnly
                  placeholder="Auto-calculated from DOB"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Place of Birth</label>
                <input
                  type="text"
                  value={profile.placeOfBirth}
                  placeholder="City, State, Country"
                  onChange={(e) => setProfile({ ...profile, placeOfBirth: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Religion</label>
                <input
                  type="text"
                  value={profile.religion}
                  onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={profile.nationality}
                  onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Transgender</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={profile.category}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="UR">UR (General)</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Marital Status</label>
                <select
                  value={profile.maritalStatus}
                  onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Single">Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              {profile.maritalStatus === 'Married' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Name of Spouse</label>
                  <input
                    type="text"
                    value={profile.spouseName}
                    onChange={(e) => setProfile({ ...profile, spouseName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">PWD (Person with Disability)</label>
                <select
                  value={profile.isPwD ? 'Yes' : 'No'}
                  onChange={(e) => setProfile({ ...profile, isPwD: e.target.value === 'Yes' })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">PAN/Passport/Aadhar No.</label>
                <input
                  type="text"
                  value={profile.idProofNumber}
                  onChange={(e) => setProfile({ ...profile, idProofNumber: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Institute Employee?</label>
                <select
                  value={profile.isInstituteEmployee ? 'Yes' : 'No'}
                  onChange={(e) => setProfile({ ...profile, isInstituteEmployee: e.target.value === 'Yes' })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Government Employee?</label>
                <select
                  value={profile.isGovtEmployee ? 'Yes' : 'No'}
                  onChange={(e) => setProfile({ ...profile, isGovtEmployee: e.target.value === 'Yes' })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ex-Service Man?</label>
                <select
                  value={profile.isExServiceMan ? 'Yes' : 'No'}
                  onChange={(e) => setProfile({ ...profile, isExServiceMan: e.target.value === 'Yes' })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone/Mobile Number</label>
                <input
                  type="text"
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="lg:col-span-3">
                <label className="block font-medium text-slate-700 mb-1">Address Correspondence</label>
                <textarea
                  value={profile.correspondenceAddress}
                  onChange={(e) => setProfile({ ...profile, correspondenceAddress: e.target.value })}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="lg:col-span-3">
                <label className="block font-medium text-slate-700 mb-1">Address Permanent</label>
                <textarea
                  value={profile.permanentAddress}
                  onChange={(e) => setProfile({ ...profile, permanentAddress: e.target.value })}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 pt-4 border-t border-slate-200">
              {showPaymentError && (
                <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Order ID and Transaction ID are required to proceed</span>
                </div>
              )}
              <button
                onClick={() => {
                  saveStepData(2);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs flex items-center space-x-1.5"
              >
                <span>Save & Continue to Education</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Education & Experience */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Step 2: Educational Qualifications & Professional Experience
            </h3>

            {/* Academic Qualifications Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">11. Educational Qualifications</h4>
                <button
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
                        proofSlNo: ''
                      },
                    ])
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Qualification
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 border-r border-slate-200">Name of course/Exam</th>
                      <th className="p-2 border-r border-slate-200">Board/University</th>
                      <th className="p-2 border-r border-slate-200 w-16">Year</th>
                      <th className="p-2 border-r border-slate-200 w-16">Division</th>
                      <th className="p-2 border-r border-slate-200 w-16">CGPA</th>
                      <th className="p-2 border-r border-slate-200 w-16">% Marks</th>
                      <th className="p-2 border-r border-slate-200">Subjects</th>
                      <th className="p-2 border-r border-slate-200 w-16 text-center">Proof Sl No</th>
                      <th className="p-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {academics.map((acad, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={acad.degree}
                            onChange={(e) => {
                              const copy = [...academics];
                              copy[idx].degree = e.target.value;
                              setAcademics(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-900 font-semibold"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={acad.boardOrUniversity}
                            onChange={(e) => {
                              const copy = [...academics];
                              copy[idx].boardOrUniversity = e.target.value;
                              setAcademics(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="number"
                            value={acad.passingYear}
                            onChange={(e) => {
                              const copy = [...academics];
                              copy[idx].passingYear = Number(e.target.value);
                              setAcademics(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={acad.division || ''}
                            onChange={(e) => {
                              const copy = [...academics];
                              copy[idx].division = e.target.value;
                              setAcademics(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={acad.cgpa || ''}
                            onChange={(e) => {
                              const copy = [...academics];
                              copy[idx].cgpa = e.target.value;
                              setAcademics(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={acad.gradeOrPercentage}
                            onChange={(e) => {
                              const copy = [...academics];
                              copy[idx].gradeOrPercentage = e.target.value;
                              setAcademics(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700 font-bold"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={acad.subjects || ''}
                            onChange={(e) => {
                              const copy = [...academics];
                              copy[idx].subjects = e.target.value;
                              setAcademics(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={acad.proofSlNo || ''}
                            onChange={(e) => {
                              const copy = [...academics];
                              copy[idx].proofSlNo = e.target.value;
                              setAcademics(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-center text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            onClick={() => setAcademics(academics.filter((_, i) => i !== idx))}
                            className="text-rose-600 hover:text-rose-800"
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
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Any other exams passed (ITI / Diploma / Certificate)
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setOtherQualifications([
                      ...otherQualifications,
                      { examName: '', rollNo: '', year: '', proofSlNo: '' }
                    ])
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add more
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 border-r border-slate-200">Name of Exam/Course/Subject</th>
                      <th className="p-2 border-r border-slate-200 w-32">Roll No.</th>
                      <th className="p-2 border-r border-slate-200 w-24">Year</th>
                      <th className="p-2 border-r border-slate-200 text-center w-24">Proof Sl No</th>
                      <th className="p-2 text-center w-10">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {otherQualifications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                          No other exams added. Click &quot;Add more&quot; above to add ITI, Diploma, or Certificate credentials.
                        </td>
                      </tr>
                    ) : (
                      otherQualifications.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-1.5 border-r border-slate-100">
                            <input
                              type="text"
                              placeholder="e.g. ITI Electrician / Polytechnic Diploma / Certificate in GIS"
                              value={item.examName}
                              onChange={(e) => {
                                const copy = [...otherQualifications];
                                copy[idx].examName = e.target.value;
                                setOtherQualifications(copy);
                              }}
                              className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-900 placeholder:text-slate-400"
                            />
                          </td>
                          <td className="p-1.5 border-r border-slate-100">
                            <input
                              type="text"
                              placeholder="Roll Number"
                              value={item.rollNo || ''}
                              onChange={(e) => {
                                const copy = [...otherQualifications];
                                copy[idx].rollNo = e.target.value;
                                setOtherQualifications(copy);
                              }}
                              className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700 font-mono"
                            />
                          </td>
                          <td className="p-1.5 border-r border-slate-100">
                            <input
                              type="number"
                              placeholder="YYYY"
                              value={item.year || ''}
                              onChange={(e) => {
                                const copy = [...otherQualifications];
                                copy[idx].year = e.target.value;
                                setOtherQualifications(copy);
                              }}
                              className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700 font-mono"
                            />
                          </td>
                          <td className="p-1.5 border-r border-slate-100 text-center">
                            <input
                              type="text"
                              placeholder="e.g. 03"
                              value={item.proofSlNo || ''}
                              onChange={(e) => {
                                const copy = [...otherQualifications];
                                copy[idx].proofSlNo = e.target.value;
                                setOtherQualifications(copy);
                              }}
                              className="w-full bg-transparent border-0 focus:ring-0 p-0 text-center text-slate-700"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (otherQualifications.length === 1) {
                                  // Clear instead of removing last row, so applicant always has a blank field
                                  setOtherQualifications([{ examName: '', rollNo: '', year: '', proofSlNo: '' }]);
                                } else {
                                  setOtherQualifications(otherQualifications.filter((_, i) => i !== idx));
                                }
                              }}
                              className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition"
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

            {/* Experience Table */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">12. Chronological list of Experience</h4>
                <button
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
                        proofSlNo: ''
                      },
                    ])
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 border-r border-slate-200">Designation</th>
                      <th className="p-2 border-r border-slate-200">Employer Name & Address</th>
                      <th className="p-2 border-r border-slate-200 w-24">From</th>
                      <th className="p-2 border-r border-slate-200 w-24">To</th>
                      <th className="p-2 border-r border-slate-200 w-24">Duration</th>
                      <th className="p-2 border-r border-slate-200">Duties</th>
                      <th className="p-2 border-r border-slate-200 w-16 text-center">Proof Sl No</th>
                      <th className="p-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {experience.map((exp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={exp.designation}
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].designation = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-900 font-semibold"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={exp.organization}
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].organization = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].startDate = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].endDate = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={exp.durationYearsMonths || ''}
                            placeholder="Years/Months"
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].durationYearsMonths = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={exp.jobDescription}
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].jobDescription = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="text"
                            value={exp.proofSlNo || ''}
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].proofSlNo = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-center text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                            className="text-rose-600 hover:text-rose-800"
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
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">13. Nature of Experience</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 border-r border-slate-200">Category</th>
                      <th className="p-2 border-r border-slate-200 text-center">No. of Years</th>
                      <th className="p-2 border-r border-slate-200 text-center">No. of Months</th>
                      <th className="p-2 border-r border-slate-200 text-center">No. of Days</th>
                      <th className="p-2 text-center">Proof Sl No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(['teaching', 'administrative', 'research', 'other'] as const).map((key) => (
                      <tr key={key}>
                        <td className="p-2 border-r border-slate-100 capitalize font-semibold text-slate-800">{key}</td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="number"
                            value={natureOfExperience?.[key]?.years || 0}
                            onChange={(e) => setNatureOfExperience({
                              ...natureOfExperience,
                              [key]: { ...natureOfExperience?.[key], years: Number(e.target.value) }
                            })}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-center"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="number"
                            value={natureOfExperience?.[key]?.months || 0}
                            onChange={(e) => setNatureOfExperience({
                              ...natureOfExperience,
                              [key]: { ...natureOfExperience?.[key], months: Number(e.target.value) }
                            })}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-center"
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-100">
                          <input
                            type="number"
                            value={natureOfExperience?.[key]?.days || 0}
                            onChange={(e) => setNatureOfExperience({
                              ...natureOfExperience,
                              [key]: { ...natureOfExperience?.[key], days: Number(e.target.value) }
                            })}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-center"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={natureOfExperience?.[key]?.proofSlNo || ''}
                            onChange={(e) => setNatureOfExperience({
                              ...natureOfExperience,
                              [key]: { ...natureOfExperience?.[key], proofSlNo: e.target.value }
                            })}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-center"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => saveStepData(3)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs flex items-center space-x-1.5"
              >
                <span>Save & Continue to Research</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Research Publications */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Step 3: Research Publications
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Research Papers/Review Articles/Conference Proceedings (Optional)
                </label>
                <textarea
                  value={researchPapers}
                  onChange={(e) => setResearchPapers(e.target.value)}
                  rows={4}
                  placeholder="In Related Areas Only. List details if any..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Research Publication – Books, Chapters, Edited Works, Articles (Optional)
                </label>
                <textarea
                  value={researchPublications}
                  onChange={(e) => setResearchPublications(e.target.value)}
                  rows={4}
                  placeholder="In Related Areas Only. List details if any..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => saveStepData(4)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs flex items-center space-x-1.5"
              >
                <span>Save & Continue to Miscellaneous</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Miscellaneous Info */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              Step 4: Miscellaneous Information & Disclosures
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">1. Time required for joining? (in days/months)</label>
                  <input
                    type="text"
                    value={extraMisc.joiningTimeRequired}
                    onChange={(e) => setExtraMisc({ ...extraMisc, joiningTimeRequired: e.target.value })}
                    placeholder="e.g. 30 Days"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700">2. Do you have computer proficiency certificate?</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" checked={extraMisc.hasComputerProficiency === true} onChange={() => setExtraMisc({...extraMisc, hasComputerProficiency: true})} />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" checked={extraMisc.hasComputerProficiency === false} onChange={() => setExtraMisc({...extraMisc, hasComputerProficiency: false})} />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">3. Kindly describe your contribution to institutions where you have worked?</label>
                  <textarea
                    value={extraMisc.institutionalContribution}
                    onChange={(e) => setExtraMisc({ ...extraMisc, institutionalContribution: e.target.value })}
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">4. What makes you suitable for the job?</label>
                  <textarea
                    value={extraMisc.suitabilityStatement}
                    onChange={(e) => setExtraMisc({ ...extraMisc, suitabilityStatement: e.target.value })}
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">5. Honours and awards (If Any)?</label>
                  <textarea
                    value={extraMisc.honoursAndAwards}
                    onChange={(e) => setExtraMisc({ ...extraMisc, honoursAndAwards: e.target.value })}
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">13. Languages known?</label>
                  <input
                    type="text"
                    value={pdfExtraFields.languagesKnown}
                    onChange={(e) => setPdfExtraFields({ ...pdfExtraFields, languagesKnown: e.target.value })}
                    placeholder="e.g. English, Hindi"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-widest text-[10px] mb-2">Legal & Disciplinary Disclosures</h4>
                
                {[
                  { label: '6. Debarred or punished for adopting unfair means in any examination?', key: 'debarredForUnfairMeans' },
                  { label: '7. Involved in any administrative malpractice?', key: 'administrativeMalpractice' },
                  { label: '8. Involved in any financial irregularity?', key: 'financialIrregularity' },
                  { label: '9. Ever discharged or dismissed from previous employment?', key: 'dischargedOrDismissed' },
                  { label: '10. Pending or contemplated disciplinary proceeding against you?', key: 'pendingDisciplinaryProceeding' },
                  { label: '11. Declared medically unfit or asked to resign on discharge/dismissed?', key: 'medicallyUnfitResignation' },
                  { label: '14. No objection certificate available?', key: 'nocAvailable' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-700 max-w-[70%]">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={(extraMisc as any)[item.key] === true} onChange={() => setExtraMisc({...extraMisc, [item.key]: true})} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={(extraMisc as any)[item.key] === false} onChange={() => setExtraMisc({...extraMisc, [item.key]: false})} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">12. Two referees familiar with your profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {referees.map((ref, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700">Referee {idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 uppercase">Name</label>
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) => {
                            const newRefs = [...referees];
                            newRefs[idx].name = e.target.value;
                            setReferees(newRefs);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase">Designation</label>
                        <input
                          type="text"
                          value={ref.designation}
                          onChange={(e) => {
                            const newRefs = [...referees];
                            newRefs[idx].designation = e.target.value;
                            setReferees(newRefs);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase">Mobile</label>
                        <input
                          type="text"
                          value={ref.mobile}
                          onChange={(e) => {
                            const newRefs = [...referees];
                            newRefs[idx].mobile = e.target.value;
                            setReferees(newRefs);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 uppercase">Email</label>
                        <input
                          type="email"
                          value={ref.email}
                          onChange={(e) => {
                            const newRefs = [...referees];
                            newRefs[idx].email = e.target.value;
                            setReferees(newRefs);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 uppercase">Address</label>
                        <textarea
                          value={ref.address}
                          onChange={(e) => {
                            const newRefs = [...referees];
                            newRefs[idx].address = e.target.value;
                            setReferees(newRefs);
                          }}
                          rows={2}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => saveStepData(5)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs flex items-center space-x-1.5"
              >
                <span>Save & Continue to Uploads</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Document Uploads */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Step 5: Document Upload & Verification Preparation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-1 min-w-0 flex-1 mr-2">
                    <span className="font-bold text-slate-900 block truncate" title={doc.name}>{doc.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{doc.type.replace(/_/g, ' ')} • {doc.fileSize}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href={`${window.location.origin}${doc.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition"
                      title="View Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                      Uploaded
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">1. Select Document Category</label>
                <select 
                  id="docTypeSelect"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">2. Upload File</label>
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
                  className={`bg-white p-3 rounded-xl border border-dashed ${isUploading ? 'border-indigo-300' : 'border-slate-300 hover:border-indigo-400'} text-center space-y-1 cursor-pointer transition flex items-center justify-center gap-3 min-h-[50px]`}
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
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <span className="text-xs font-semibold text-indigo-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs font-semibold text-slate-700">Choose File (PDF/JPG/PNG up to 5MB)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep(4)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => saveStepData(6)}
                disabled={isUploading}
                className={`px-5 py-2 rounded-xl ${isUploading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold text-xs shadow-2xs flex items-center space-x-1.5 transition`}
              >
                <span>Save & Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Fee Payment & Declaration */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Step 6: Application Fee Breakdown & Declaration
            </h3>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Application Fee Summary</h4>
                  <p className="text-[10px] text-slate-500">Review your fee details and complete payment if applicable.</p>
                </div>
                {!isFeeExempt && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href="https://sbcollect.sbi.bank.in/sbicollect/icollecthome.htm?corpID=322526"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      1. Pay via SBI Collect
                    </a>
                    <button
                      onClick={simulatePaymentVerification}
                      disabled={isVerifyingPayment || paymentVerified}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                        paymentVerified 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                      }`}
                    >
                      {isVerifyingPayment ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Verifying...
                        </>
                      ) : paymentVerified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Payment Verified
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          2. Verify & Auto-fill IDs
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Standard Fee</span>
                  <div className="text-base font-bold text-slate-900">₹{activePost?.applicationFee || 1000}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Exemption Status</span>
                  <div className={`text-sm font-bold ${isFeeExempt ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {isFeeExempt ? 'Eligible (Exempted)' : 'Not Eligible'}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm ring-2 ring-indigo-600 ring-offset-1">
                  <span className="text-[10px] text-indigo-600 uppercase font-bold">Net Payable</span>
                  <div className="text-base font-black text-indigo-700">₹{feeToPay}</div>
                </div>
              </div>

              {!isFeeExempt && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Enter Payment Confirmation Details
                  </h4>
                  <div className="overflow-x-auto border border-slate-300 rounded-sm">
                    <table className="w-full text-[11px] text-left border-collapse bg-white">
                      <thead className="bg-slate-50 border-b border-slate-300">
                        <tr className="text-slate-700">
                          <th className="p-2 border-r border-slate-300">Order id <span className="text-rose-500">*</span></th>
                          <th className="p-2 border-r border-slate-300">Transaction ID <span className="text-rose-500">*</span></th>
                          <th className="p-2 border-r border-slate-300">Amount Paid</th>
                          <th className="p-2 border-r border-slate-300">Mode</th>
                          <th className="p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-slate-900">
                          <td className="p-2 border-r border-slate-300">
                            <input
                              type="text"
                              placeholder="Enter Order ID"
                              value={paymentDetails.orderId}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, orderId: e.target.value })}
                              className="w-full bg-transparent border-0 focus:ring-0 p-0 font-mono text-indigo-600 font-bold placeholder:font-normal placeholder:text-slate-300"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-300">
                            <input
                              type="text"
                              placeholder="Enter Transaction ID"
                              value={paymentDetails.transactionId}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
                              className="w-full bg-transparent border-0 focus:ring-0 p-0 font-mono text-indigo-600 font-bold placeholder:font-normal placeholder:text-slate-300"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-300 font-bold bg-slate-50/50">₹{feeToPay}</td>
                          <td className="p-2 border-r border-slate-300">
                            <input
                              type="text"
                              value={paymentDetails.paymentMode}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMode: e.target.value })}
                              className="w-full bg-transparent border-0 focus:ring-0 p-0"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={paymentDetails.paymentDate}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentDate: e.target.value })}
                              className="w-full bg-transparent border-0 focus:ring-0 p-0"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>


            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">19. Declaration</h4>
              <p className="leading-relaxed">
                I, <span className="font-bold underline px-2">{profile.fullName}</span> son/daughter of <span className="font-bold underline px-2">{profile.fatherName}</span> hereby declare that all the statements and entries made in this application are true, complete and correct to the best of my knowledge and belief. In the event of any information found false or incorrect or ineligibility being detected before or after the Selection Committee and Executive Council/Board of Management meetings, my candidature/appointment may be cancelled by the University.
              </p>
              <p className="leading-relaxed">
                I have never been convicted or contemplated for any unlawful activity.
              </p>
              <label className="flex items-center space-x-2 cursor-pointer pt-2">
                <input 
                  type="checkbox" 
                  checked={declarationAccepted} 
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600" 
                />
                <span className="font-bold">I Accept the Declaration</span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep(5)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="flex flex-col items-end gap-2">
                {showPaymentError && (
                  <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Order ID and Transaction ID are required for non-exempt candidates</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (!isFeeExempt && (!paymentDetails.orderId || !paymentDetails.transactionId)) {
                      setShowPaymentError(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      return;
                    }
                    setShowPaymentError(false);
                    handleFinalSubmit();
                  }}
                  disabled={!declarationAccepted}
                  className={`px-6 py-2.5 rounded-xl ${declarationAccepted ? 'bg-emerald-600 hover:bg-emerald-700 shadow-2xs' : 'bg-slate-300 cursor-not-allowed'} text-white font-bold text-xs flex items-center space-x-2 transition`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Final Application</span>
                </button>
              </div>

              <button
                onClick={() => setIsPreviewOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center space-x-2 hover:bg-indigo-50 transition shadow-2xs"
              >
                <FileText className="w-4 h-4" />
                <span>Preview Application Form</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Summary & Receipt */}
        {activeStep === 7 && submittedApp && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-300 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Application Submitted Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your application has been registered in the database and forwarded to the screening committee.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Application No:</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">{submittedApp.applicationNo}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Candidate Name:</span>
                <span className="font-bold text-slate-900">{submittedApp.applicant.fullName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Applied Post:</span>
                <span className="font-semibold text-slate-800">{submittedApp.postTitle}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-semibold text-emerald-700">{submittedApp.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Date:</span>
                <span className="text-slate-700">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Print Application Acknowledgement</span>
              </button>

              <button
                onClick={() => setShowAdmitCard(submittedApp)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Preview Admit Card / Hall Ticket</span>
              </button>

              <button
                onClick={() => setIsPreviewOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs flex items-center space-x-2 hover:bg-slate-50 transition"
              >
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Preview / Print Application Form</span>
              </button>
            </div>
          </div>
        )}
      </div>

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
            applicationNo: applications.find(a => a.id === currentAppId)?.applicationNo || 'DRAFT-PREVIEW'
          }}
          drive={activeDrive}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};
