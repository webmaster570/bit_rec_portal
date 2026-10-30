import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Application } from '../../types';
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
} from 'lucide-react';

export const ApplicantPortal: React.FC = () => {
  const { drives, submitApplication, applications, selectedDriveId: ctxDriveId, selectedPostId: ctxPostId } = usePortal();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedDriveId, setSelectedDriveId] = useState<string>(ctxDriveId || drives[0]?.id || 'drive-2026-01');
  const [selectedPostId, setSelectedPostId] = useState<string>(ctxPostId || drives[0]?.posts[0]?.id || 'post-101');
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [showAdmitCard, setShowAdmitCard] = useState<Application | null>(null);

  const activeDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];
  const activePost = activeDrive?.posts.find((p) => p.id === selectedPostId) || activeDrive?.posts[0];

  // Form State
  const [profile, setProfile] = useState({
    applicantId: `usr-${Date.now()}`,
    regNumber: `REG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    fullName: 'Rohan Deshmukh',
    fatherName: 'Suresh Deshmukh',
    motherName: 'Sunita Deshmukh',
    dob: '1995-06-12',
    gender: 'Male' as const,
    category: 'OBC' as const,
    isPwD: false,
    nationality: 'Indian',
    maritalStatus: 'Single' as const,
    email: 'rohan.deshmukh@example.com',
    mobile: '+91 98234 56789',
    address: 'Flat 402, Royal Residency',
    state: 'Maharashtra',
    district: 'Pune',
    pin: '411007',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    signatureUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80',
    idProofType: 'Aadhaar Card',
    idProofNumber: 'XXXX-XXXX-9912',
  });

  const [academics, setAcademics] = useState([
    {
      degree: 'Ph.D. Computer Science',
      fieldOfStudy: 'Artificial Intelligence & Machine Learning',
      institution: 'Savitribai Phule Pune University',
      boardOrUniversity: 'SPPU',
      passingYear: 2022,
      gradeOrPercentage: 'CGPA 9.2/10',
    },
    {
      degree: 'M.Tech CSE',
      fieldOfStudy: 'Software Engineering',
      institution: 'COEP Technological University',
      boardOrUniversity: 'COEP',
      passingYear: 2018,
      gradeOrPercentage: '85.4%',
    },
  ]);

  const [experience, setExperience] = useState([
    {
      organization: 'Pune Institute of Computer Technology',
      designation: 'Assistant Professor (Ad-hoc)',
      startDate: '2022-07-01',
      endDate: '2026-01-30',
      isCurrent: true,
      jobDescription: 'Teaching Data Structures, Operating Systems, and Deep Learning.',
    },
  ]);

  const [documents, setDocuments] = useState<Application['documents']>([
    { id: 'doc-p', type: 'photo', name: 'Rohan_Passport_Photo.jpg', fileSize: '180 KB', uploadedAt: '2026-03-01', url: '#', status: 'pending' },
    { id: 'doc-s', type: 'signature', name: 'Rohan_Signature.png', fileSize: '95 KB', uploadedAt: '2026-03-01', url: '#', status: 'pending' },
    { id: 'doc-id', type: 'id_proof', name: 'Aadhaar_Card_PDF.pdf', fileSize: '1.1 MB', uploadedAt: '2026-03-01', url: '#', status: 'pending' },
    { id: 'doc-phd', type: 'phd_degree', name: 'SPPU_PhD_Degree_Certificate.pdf', fileSize: '2.3 MB', uploadedAt: '2026-03-01', url: '#', status: 'pending' },
  ]);

  // Fee Exemption Logic
  const isFeeExempt = activePost?.feeExemptCategories.includes(profile.category) || profile.isPwD || profile.gender === 'Female';
  const feeToPay = isFeeExempt ? 0 : activePost?.applicationFee || 1000;

  const handleFinalSubmit = () => {
    const createdApp = submitApplication(
      selectedDriveId,
      selectedPostId,
      profile,
      academics,
      experience,
      documents,
      isFeeExempt
    );
    setSubmittedApp(createdApp);
    setActiveStep(5);
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

        <div className="text-right text-xs">
          <span className="text-blue-100 block">Registration Reference:</span>
          <span className="font-mono font-bold text-white text-sm">{profile.regNumber}</span>
        </div>
      </div>

      {/* Wizard Steps Navigation Bar */}
      <div className="glass-card border border-slate-200 rounded-xl p-3 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {[
            { num: 1, label: 'Personal Details', icon: User },
            { num: 2, label: 'Education & Experience', icon: GraduationCap },
            { num: 3, label: 'Document Uploads', icon: Upload },
            { num: 4, label: 'Fee & Declaration', icon: CreditCard },
            { num: 5, label: 'Summary & Receipt', icon: CheckCircle2 },
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
        {activeStep < 5 && (
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
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Step 1: Applicant Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
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
                <label className="block font-medium text-slate-700 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
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
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ID Proof Type</label>
                <input
                  type="text"
                  value={profile.idProofType}
                  onChange={(e) => setProfile({ ...profile, idProofType: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep(2)}
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
                <h4 className="text-xs font-bold text-slate-800">Degrees & Qualifications</h4>
                <button
                  onClick={() =>
                    setAcademics([
                      ...academics,
                      {
                        degree: 'B.Tech / B.E.',
                        fieldOfStudy: 'Computer Engineering',
                        institution: 'University College',
                        boardOrUniversity: 'State University',
                        passingYear: 2016,
                        gradeOrPercentage: '80.0%',
                      },
                    ])
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Degree
                </button>
              </div>

              <div className="space-y-2">
                {academics.map((acad, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    <input
                      type="text"
                      value={acad.degree}
                      placeholder="Degree Title"
                      onChange={(e) => {
                        const copy = [...academics];
                        copy[idx].degree = e.target.value;
                        setAcademics(copy);
                      }}
                      className="bg-white border border-slate-200 rounded p-1.5 text-slate-900 font-semibold focus:outline-none"
                    />
                    <input
                      type="text"
                      value={acad.fieldOfStudy}
                      placeholder="Specialization"
                      onChange={(e) => {
                        const copy = [...academics];
                        copy[idx].fieldOfStudy = e.target.value;
                        setAcademics(copy);
                      }}
                      className="bg-white border border-slate-200 rounded p-1.5 text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={acad.boardOrUniversity}
                      placeholder="University"
                      onChange={(e) => {
                        const copy = [...academics];
                        copy[idx].boardOrUniversity = e.target.value;
                        setAcademics(copy);
                      }}
                      className="bg-white border border-slate-200 rounded p-1.5 text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={acad.gradeOrPercentage}
                      placeholder="Marks / CGPA"
                      onChange={(e) => {
                        const copy = [...academics];
                        copy[idx].gradeOrPercentage = e.target.value;
                        setAcademics(copy);
                      }}
                      className="bg-white border border-slate-200 rounded p-1.5 text-slate-900 focus:outline-none"
                    />
                    <button
                      onClick={() => setAcademics(academics.filter((_, i) => i !== idx))}
                      className="text-rose-600 hover:text-rose-700 p-1 self-center justify-self-end"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
                onClick={() => setActiveStep(3)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs flex items-center space-x-1.5"
              >
                <span>Continue to Document Uploads</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Document Uploads */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Step 3: Document Upload & Verification Preparation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">{doc.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{doc.type.replace(/_/g, ' ')} • {doc.fileSize}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Uploaded
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
              <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
              <span className="text-xs font-semibold text-slate-800 block">Drag & Drop Additional Degree Certificates or Caste Documents</span>
              <span className="text-[10px] text-slate-500 block">Supports PDF, JPG, PNG up to 5MB</span>
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
                onClick={() => setActiveStep(4)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs flex items-center space-x-1.5"
              >
                <span>Proceed to Fee & Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Fee Payment & Declaration */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Step 4: Application Fee Breakdown & Declaration
            </h3>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Position Fee Standard:</span>
                <span className="font-semibold text-slate-900">₹{activePost?.applicationFee || 1000}</span>
              </div>

              <div className="flex justify-between text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Fee Exemption Eligibility:</span>
                <span className="font-semibold text-emerald-700">
                  {isFeeExempt ? `Exempted (${profile.category} Category)` : 'Standard Rate Applicable'}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold pt-1">
                <span className="text-slate-900">Net Payable Amount:</span>
                <span className="text-emerald-700 text-base">₹{feeToPay}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 text-indigo-600" />
                <span>
                  I hereby declare that all information furnished in this application is true, complete, and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage, my candidature shall be cancelled automatically.
                </span>
              </label>
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
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Application & Generate Receipt</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Submitted Receipt & Admit Card Download */}
        {activeStep === 5 && submittedApp && (
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
            </div>
          </div>
        )}
      </div>

      {showAdmitCard && (
        <AdmitCardModal application={showAdmitCard} onClose={() => setShowAdmitCard(null)} />
      )}
    </div>
  );
};
