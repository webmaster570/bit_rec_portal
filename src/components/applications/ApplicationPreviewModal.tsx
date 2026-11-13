import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { X, Printer, Download, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Application, RecruitmentDrive } from '../../types';

interface Props {
  application: Partial<Application>;
  drive?: RecruitmentDrive;
  onClose: () => void;
}

export const ApplicationPreviewModal: React.FC<Props> = ({ application, drive, onClose }) => {
  const { branding } = usePortal();
  const post = drive?.posts.find(p => p.id === application.postId);
  const isFeeExempt = post?.feeExemptCategories.includes(application.applicant?.category || '') || application.applicant?.isPwD || application.applicant?.gender === 'Female';
  const feeToPay = isFeeExempt ? 0 : post?.applicationFee || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Web Header (Actions) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Application Preview</h2>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">
                Ref: {application.applicationNo || 'DRAFT-MODE'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md hover:shadow-indigo-200"
              title="Print Application"
            >
              <Printer className="w-4 h-4" />
              <span>Print Form</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Professional Document Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/50 print:bg-white print:p-0">
          <div className="bg-white shadow-xl border border-slate-200 mx-auto print:shadow-none print:border-0 print:m-0 w-full max-w-[210mm] relative">
            
            {/* Watermark for Web view only */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg] select-none overflow-hidden print:hidden">
              <span className="text-[120px] font-black tracking-tighter">OFFICIAL RECORD</span>
            </div>

            {/* Document Body */}
            <div className="p-8 sm:p-12 space-y-8 text-slate-800 leading-normal font-serif relative z-10">
              
              {/* UNIVERSITY HEADER */}
              <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6 mb-8 relative">
                {/* Logo Section */}
                <div className="absolute left-0 top-0 w-24 h-24 flex items-center justify-center">
                  {branding.logoImageUrl ? (
                    <img src={branding.logoImageUrl} alt="University Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-full h-full border-2 border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-300 italic font-sans p-2 text-center">
                      University Logo Space
                    </div>
                  )}
                </div>
                
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 pl-24">Birla Institute of Technology</h1>
                <p className="text-sm font-bold text-slate-600 pl-24">(A Deemed to be University u/s 3 of UGC Act 1956)</p>
                <p className="text-xs font-medium text-slate-500 max-w-md mx-auto leading-relaxed pl-24">
                  Mesra, Ranchi - 835215, Jharkhand, India
                </p>
                <div className="pt-4">
                  <span className="px-6 py-1.5 bg-slate-900 text-white text-sm font-black rounded-full uppercase tracking-[0.2em]">Application Form</span>
                </div>
              </div>

              {/* POST & ADVT DETAILS GRID */}
              <div className="grid grid-cols-2 gap-px bg-slate-300 border border-slate-300 text-[10pt] font-sans overflow-hidden rounded-lg">
                <div className="bg-slate-50 p-3 flex flex-col">
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-1">Advertisement Details</span>
                  <span className="font-bold">No: {drive?.advtNumber || 'N/A'}</span>
                  <span className="text-slate-600 italic">Date: {drive?.startDate || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-3 flex flex-col border-l border-slate-300">
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-1">Position Applied For</span>
                  <span className="font-black text-indigo-700 uppercase">{application.postTitle || 'N/A'}</span>
                  <span className="text-slate-600">Dept: {application.departmentName || 'N/A'}</span>
                </div>
                <div className="bg-white p-3 flex flex-col col-span-2 border-t border-slate-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-1">Application Reference</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black tracking-wider text-slate-900">{application.applicationNo || 'PENDING'}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-1">Date of Submission</span>
                      <div className="font-bold text-slate-700">{application.submittedAt ? new Date(application.submittedAt).toLocaleDateString('en-GB') : 'In-Progress'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* REGISTRATION DETAILS */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 font-bold uppercase tracking-widest text-[11pt] skew-x-[-10deg] w-fit">
                  <span className="skew-x-[10deg]">Registration</span>
                </h3>
                <div className="overflow-hidden border border-slate-900 rounded-lg shadow-sm">
                  <table className="w-full border-collapse text-[9pt] font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[8px] tracking-wider border-b border-slate-300">
                        <th className="p-3 border-r border-slate-200 text-left">Application Number</th>
                        <th className="p-3 border-r border-slate-200 text-left">Post</th>
                        <th className="p-3 border-r border-slate-200 text-left">Campus/Organizational Unit</th>
                        <th className="p-3 border-r border-slate-200 text-left">Branch/Department</th>
                        <th className="p-3 text-left">Advertisement Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="p-3 border-r border-slate-200 font-mono font-bold text-slate-900">
                          {application.applicationNo || application.applicant?.regNumber || 'PENDING'}
                        </td>
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                          {application.postTitle || post?.title || 'N/A'}
                        </td>
                        <td className="p-3 border-r border-slate-200 font-semibold text-slate-800">
                          {application.campus || post?.campus || application.applicant?.campusUnit || 'N/A'}
                        </td>
                        <td className="p-3 border-r border-slate-200 text-slate-700">
                          {application.departmentName || post?.departmentName || 'N/A'}
                        </td>
                        <td className="p-3 font-mono text-slate-800">
                          {application.advtNumber || drive?.advtNumber || 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* APPLICATION FEE SUMMARY */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 font-bold uppercase tracking-widest text-[11pt] skew-x-[-10deg] w-fit">
                  <span className="skew-x-[10deg]">Application Fee Summary</span>
                </h3>
                
                <div className="overflow-hidden border border-slate-900 rounded-lg shadow-sm">
                  <table className="w-full border-collapse text-[9pt] font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[8px] tracking-wider border-b border-slate-300">
                        <th className="p-3 border-r border-slate-200 text-left">Order id *</th>
                        <th className="p-3 border-r border-slate-200 text-left">Transaction ID *</th>
                        <th className="p-3 border-r border-slate-200 text-left">Amount Paid</th>
                        <th className="p-3 border-r border-slate-200 text-left">Mode</th>
                        <th className="p-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="p-3 border-r border-slate-200 font-bold text-indigo-600">
                          {application.orderId || (isFeeExempt ? 'EXEMPTED' : '-')}
                        </td>
                        <td className="p-3 border-r border-slate-200 font-bold text-indigo-600">
                          {application.transactionId || (isFeeExempt ? 'EXEMPTED' : '-')}
                        </td>
                        <td className="p-3 border-r border-slate-200 font-black text-slate-900">
                          ₹{feeToPay}
                        </td>
                        <td className="p-3 border-r border-slate-200 text-slate-600 font-medium">
                          {isFeeExempt ? 'N/A (Exempted)' : (application.paymentMode || 'SBI Collect (Online)')}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          {application.paymentDate || (application.submittedAt ? new Date(application.submittedAt).toLocaleDateString('en-GB') : '-')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {isFeeExempt && (
                    <div className="bg-emerald-50 px-4 py-2 border-t border-emerald-100 flex items-center gap-2 text-[8pt] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Fee Exemption Applied: {application.applicant?.category} / {application.applicant?.gender} / PwD Status</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PART 1: PERSONAL PROFILE */}
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 font-bold uppercase tracking-widest text-[11pt] skew-x-[-10deg]">
                  <span className="skew-x-[10deg]">Personal Information</span>
                </h3>
                
                <div className="grid grid-cols-12 gap-6 pt-2">
                  {/* Bio Data */}
                  <div className="col-span-12 md:col-span-9 grid grid-cols-2 gap-y-3 gap-x-6 text-[10pt]">
                    <div className="flex flex-col border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Full Name (Capital Letters)</span>
                      <span className="font-black text-slate-900 uppercase tracking-tight">{application.applicant?.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Father&rsquo;s Name</span>
                      <span className="font-bold text-slate-800">{application.applicant?.fatherName || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Mother&rsquo;s Name</span>
                      <span className="font-bold text-slate-800">{application.applicant?.motherName || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Date of Birth (Age)</span>
                      <span className="font-bold text-slate-800">{application.applicant?.dob || 'N/A'} {application.applicant?.ageOnLastDate && <span className="text-slate-500 font-normal ml-1">({application.applicant?.ageOnLastDate})</span>}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Category & Gender</span>
                      <span className="font-bold text-slate-800">{application.applicant?.category || 'N/A'} | {application.applicant?.gender || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Marital Status</span>
                      <span className="font-bold text-slate-800">{application.applicant?.maritalStatus || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-1 col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Communication Details</span>
                      <div className="flex gap-4 font-bold text-slate-800">
                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-indigo-500"/> {application.applicant?.email}</span>
                        <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-indigo-500"/> {application.applicant?.mobile}</span>
                      </div>
                    </div>
                  </div>

                  {/* Photo Section */}
                  <div className="col-span-12 md:col-span-3 space-y-4">
                    <div className="w-full aspect-[3/4] border-2 border-slate-900 rounded-lg overflow-hidden bg-slate-50 p-1">
                      <div className="w-full h-full border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                        {application.applicant?.photoUrl ? (
                          <img src={application.applicant.photoUrl} alt="Applicant" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-300 font-sans font-bold text-center p-4">PASSPORT PHOTO<br/>(AFFIXED)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-8 text-[9pt] pt-2">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-black text-slate-900 uppercase text-[8px] tracking-[0.2em] mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" /> Correspondence Address
                    </h4>
                    <p className="font-bold text-slate-700 leading-relaxed italic">
                      {[
                        application.applicant?.correspondenceLine1,
                        application.applicant?.correspondenceLine2,
                        application.applicant?.correspondenceLandmark && `Landmark: ${application.applicant.correspondenceLandmark}`,
                      ].filter(Boolean).join(', ')}<br/>
                      {application.applicant?.correspondenceCity}, {application.applicant?.correspondenceDistrict}<br/>
                      {application.applicant?.correspondenceState} - {application.applicant?.correspondencePin}<br/>
                      {application.applicant?.correspondenceCountry}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-black text-slate-900 uppercase text-[8px] tracking-[0.2em] mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" /> Permanent Address
                    </h4>
                    <p className="font-bold text-slate-700 leading-relaxed italic">
                      {[
                        application.applicant?.permanentLine1,
                        application.applicant?.permanentLine2,
                        application.applicant?.permanentLandmark && `Landmark: ${application.applicant.permanentLandmark}`,
                      ].filter(Boolean).join(', ')}<br/>
                      {application.applicant?.permanentCity}, {application.applicant?.permanentDistrict}<br/>
                      {application.applicant?.permanentState} - {application.applicant?.permanentPin}<br/>
                      {application.applicant?.permanentCountry}
                    </p>
                  </div>
                </div>
              </section>

              {/* PART 2: ACADEMIC QUALIFICATIONS */}
              <section className="space-y-4 pt-4">
                <h3 className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 font-bold uppercase tracking-widest text-[11pt] skew-x-[-10deg]">
                  <span className="skew-x-[10deg]">Educational Qualifications</span>
                </h3>
                
                <div className="overflow-hidden border border-slate-900 rounded-lg">
                  <table className="w-full border-collapse text-[9pt] font-sans">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase text-[8px] tracking-wider">
                        <th className="p-2 border-r border-slate-700 text-left">Exam / Degree</th>
                        <th className="p-2 border-r border-slate-700 text-left">Board / University</th>
                        <th className="p-2 border-r border-slate-700 text-left">Specialization</th>
                        <th className="p-2 border-r border-slate-700 text-center w-16">Year</th>
                        <th className="p-2 border-r border-slate-700 text-center w-24">Marks (%)</th>
                        <th className="p-2 text-center w-16">Div.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {application.academics?.map((acad, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="p-2 border-r border-slate-200 font-black uppercase text-slate-900">{acad.degree}</td>
                          <td className="p-2 border-r border-slate-200 font-bold">{acad.boardOrUniversity}</td>
                          <td className="p-2 border-r border-slate-200 text-slate-600">{acad.fieldOfStudy || acad.subjects}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold">{acad.passingYear}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-black text-indigo-700">{acad.gradeOrPercentage || acad.cgpa}</td>
                          <td className="p-2 text-center font-bold">{acad.division}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Other Qualifications */}
                {application.otherQualifications && application.otherQualifications.some(o => o.examName?.trim()) && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-black text-slate-900 uppercase text-[9px] tracking-widest px-1">Specialized Certificates / ITI / Diploma</h4>
                    <div className="overflow-hidden border border-slate-300 rounded-lg">
                      <table className="w-full border-collapse text-[8pt] font-sans">
                        <tbody className="divide-y divide-slate-200">
                          {application.otherQualifications.filter(o => o.examName?.trim()).map((item, idx) => (
                            <tr key={idx} className="bg-slate-50/30">
                              <td className="p-2 border-r border-slate-200 font-bold uppercase w-1/2">{item.examName}</td>
                              <td className="p-2 border-r border-slate-200 font-mono text-[8px]">Roll: {item.rollNo || '-'}</td>
                              <td className="p-2 border-r border-slate-200 text-center w-16 font-bold">{item.year || '-'}</td>
                              <td className="p-2 text-right text-slate-400 italic">Proof SL: {item.proofSlNo || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>

              {/* PRESENT EMPLOYMENT DETAILS */}
              <section className="space-y-4 pt-4">
                <h3 className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 font-bold uppercase tracking-widest text-[11pt] skew-x-[-10deg]">
                  <span className="skew-x-[10deg]">Present Employment Details</span>
                </h3>
                <div className="overflow-hidden border border-slate-900 rounded-lg">
                  <table className="w-full border-collapse text-[9pt] font-sans">
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { label: 'Name of the Post', val: application.presentEmploymentDetails?.postName },
                        { label: 'Type of appointment', val: application.presentEmploymentDetails?.appointmentType },
                        { label: 'Date of Appointment', val: application.presentEmploymentDetails?.dateOfAppointment },
                        { label: "Employer's Name", val: application.presentEmploymentDetails?.employerName },
                        { label: 'Pay Band and Grade Pay(6th CPC)/Equivalent', val: application.presentEmploymentDetails?.payBandAndGradePay },
                        { label: 'Pay Level/Equivalent', val: application.presentEmploymentDetails?.payLevel },
                        { label: 'Gross Emoluments', val: application.presentEmploymentDetails?.grossEmoluments },
                        { label: 'Age of retirement in the Present Post', val: application.presentEmploymentDetails?.retirementAge },
                        { label: 'Date of retirement in the Present Post', val: application.presentEmploymentDetails?.retirementDate },
                        { label: 'Whether you are receiving any pension', val: application.presentEmploymentDetails?.receivingPension },
                      ].map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                          <td className="w-1/2 p-2.5 border-r border-slate-300 font-bold text-slate-800">{row.label}</td>
                          <td className="w-1/2 p-2.5 font-semibold text-slate-900">{row.val || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* PART 3: WORK EXPERIENCE */}
              <section className="space-y-4 pt-4">
                <h3 className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 font-bold uppercase tracking-widest text-[11pt] skew-x-[-10deg]">
                  <span className="skew-x-[10deg]">Professional Experience</span>
                </h3>
                
                {application.experience && application.experience.length > 0 ? (
                  <div className="overflow-hidden border border-slate-900 rounded-lg">
                    <table className="w-full border-collapse text-[9pt] font-sans">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold uppercase text-[8px] tracking-wider">
                          <th className="p-2 border-r border-slate-700 text-left">Employer / Organization</th>
                          <th className="p-2 border-r border-slate-700 text-left">Designation</th>
                          <th className="p-2 border-r border-slate-700 text-center w-24">From</th>
                          <th className="p-2 border-r border-slate-700 text-center w-24">To</th>
                          <th className="p-2 text-left">Duties & Responsibilities</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {application.experience.map((exp, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="p-2 border-r border-slate-200 font-black text-slate-900">{exp.organization}</td>
                            <td className="p-2 border-r border-slate-200 font-bold italic">{exp.designation}</td>
                            <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-600 uppercase text-[8px]">{exp.startDate}</td>
                            <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-600 uppercase text-[8px]">{exp.endDate || 'Present'}</td>
                            <td className="p-2 text-slate-500 text-[8pt] leading-tight">{exp.jobDescription}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 font-bold uppercase text-xs">
                    No employment history recorded
                  </div>
                )}
              </section>

              {/* PART 4: RESEARCH & MISC */}
              <div className="space-y-6 pt-4">
                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 font-bold uppercase tracking-widest text-[11pt] skew-x-[-10deg]">
                    <span className="skew-x-[10deg]">Research Publications &amp; Projects</span>
                  </h3>

                  {/* 1. Research Papers/Review Articles/Conference Proceedings */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-[9.5pt]">
                      Research Papers/Review Articles/Conference Proceedings (In Related Areas Only) if any (Optional)
                    </h4>
                    {application.researchPaperItems && application.researchPaperItems.some(r => r.title?.trim() || r.publicationType?.trim() || r.journalNameAndPage?.trim()) ? (
                      <div className="overflow-hidden border border-slate-900 rounded-lg">
                        <table className="w-full border-collapse text-[8pt] font-sans">
                          <thead>
                            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                              <th className="p-2 border-r border-slate-200 text-center w-10">S.No</th>
                              <th className="p-2 border-r border-slate-200 text-left">Publication type</th>
                              <th className="p-2 border-r border-slate-200 text-left">Title of the paper</th>
                              <th className="p-2 border-r border-slate-200 text-left">Journal Name /page number</th>
                              <th className="p-2 border-r border-slate-200 text-left">ISSN/ISBN NO.</th>
                              <th className="p-2 border-r border-slate-200 text-center">Refereed</th>
                              <th className="p-2 border-r border-slate-200 text-left">Author</th>
                              <th className="p-2 text-center w-14">Year</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {application.researchPaperItems
                              .filter(r => r.title?.trim() || r.publicationType?.trim() || r.journalNameAndPage?.trim())
                              .map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                  <td className="p-2 border-r border-slate-200 text-center font-bold">{idx + 1}</td>
                                  <td className="p-2 border-r border-slate-200">{item.publicationType || '-'}</td>
                                  <td className="p-2 border-r border-slate-200 font-semibold">{item.title || '-'}</td>
                                  <td className="p-2 border-r border-slate-200">{item.journalNameAndPage || '-'}</td>
                                  <td className="p-2 border-r border-slate-200 font-mono">{item.issnIsbnNo || '-'}</td>
                                  <td className="p-2 border-r border-slate-200 text-center">{item.refereed || '-'}</td>
                                  <td className="p-2 border-r border-slate-200">{item.author || '-'}</td>
                                  <td className="p-2 text-center font-mono">{item.year || '-'}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : application.researchPapers ? (
                      <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[9pt] font-bold text-slate-800 whitespace-pre-wrap">{application.researchPapers}</p>
                    ) : (
                      <p className="p-2 border border-dashed border-slate-200 rounded-lg text-[8.5pt] text-slate-400 italic">None provided</p>
                    )}
                  </div>

                  {/* 2. Research Publication – Books, Chapters, Edited Works, Articles */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-[9.5pt]">
                      Research Publication – Books, Chapters, Edited Works, Articles (In Related Areas Only) if any
                    </h4>
                    {application.researchBookItems && application.researchBookItems.some(r => r.title?.trim() || r.publicationType?.trim() || r.journalNameAndPage?.trim()) ? (
                      <div className="overflow-hidden border border-slate-900 rounded-lg">
                        <table className="w-full border-collapse text-[8pt] font-sans">
                          <thead>
                            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                              <th className="p-2 border-r border-slate-200 text-center w-10">S.No</th>
                              <th className="p-2 border-r border-slate-200 text-left">Publication type</th>
                              <th className="p-2 border-r border-slate-200 text-left">Title of the paper</th>
                              <th className="p-2 border-r border-slate-200 text-left">Journal Name /page number</th>
                              <th className="p-2 border-r border-slate-200 text-left">ISSN/ISBN NO.</th>
                              <th className="p-2 border-r border-slate-200 text-center">Refereed</th>
                              <th className="p-2 border-r border-slate-200 text-left">Author</th>
                              <th className="p-2 text-center w-14">Year</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {application.researchBookItems
                              .filter(r => r.title?.trim() || r.publicationType?.trim() || r.journalNameAndPage?.trim())
                              .map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                  <td className="p-2 border-r border-slate-200 text-center font-bold">{idx + 1}</td>
                                  <td className="p-2 border-r border-slate-200">{item.publicationType || '-'}</td>
                                  <td className="p-2 border-r border-slate-200 font-semibold">{item.title || '-'}</td>
                                  <td className="p-2 border-r border-slate-200">{item.journalNameAndPage || '-'}</td>
                                  <td className="p-2 border-r border-slate-200 font-mono">{item.issnIsbnNo || '-'}</td>
                                  <td className="p-2 border-r border-slate-200 text-center">{item.refereed || '-'}</td>
                                  <td className="p-2 border-r border-slate-200">{item.author || '-'}</td>
                                  <td className="p-2 text-center font-mono">{item.year || '-'}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : application.researchPublications ? (
                      <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[9pt] font-bold text-slate-800 whitespace-pre-wrap">{application.researchPublications}</p>
                    ) : (
                      <p className="p-2 border border-dashed border-slate-200 rounded-lg text-[8.5pt] text-slate-400 italic">None provided</p>
                    )}
                  </div>

                  {/* 3. Research Project, if any optional */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-[9.5pt]">
                      Research Project, if any optional
                    </h4>
                    {application.researchProjectItems && application.researchProjectItems.some(p => p.majorMinor?.trim() || p.sponsoringBody?.trim() || p.outcome?.trim() || p.totalGrants?.trim()) ? (
                      <div className="overflow-hidden border border-slate-900 rounded-lg">
                        <table className="w-full border-collapse text-[8pt] font-sans">
                          <thead>
                            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                              <th className="p-2 border-r border-slate-200 text-center w-10">S.No</th>
                              <th className="p-2 border-r border-slate-200 text-left">Major/Minor</th>
                              <th className="p-2 border-r border-slate-200 text-left">Period</th>
                              <th className="p-2 border-r border-slate-200 text-left">Total grants</th>
                              <th className="p-2 border-r border-slate-200 text-left">Name of sponsoring Body/Funding Agency</th>
                              <th className="p-2 text-left">Outcome of the Project</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {application.researchProjectItems
                              .filter(p => p.majorMinor?.trim() || p.sponsoringBody?.trim() || p.outcome?.trim() || p.totalGrants?.trim())
                              .map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                  <td className="p-2 border-r border-slate-200 text-center font-bold">{idx + 1}</td>
                                  <td className="p-2 border-r border-slate-200 font-semibold">{item.majorMinor || '-'}</td>
                                  <td className="p-2 border-r border-slate-200">{item.period || '-'}</td>
                                  <td className="p-2 border-r border-slate-200 font-mono">{item.totalGrants || '-'}</td>
                                  <td className="p-2 border-r border-slate-200">{item.sponsoringBody || '-'}</td>
                                  <td className="p-2">{item.outcome || '-'}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="p-2 border border-dashed border-slate-200 rounded-lg text-[8.5pt] text-slate-400 italic">None provided</p>
                    )}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="bg-slate-900 text-white px-4 py-1 font-bold uppercase tracking-widest text-[10pt]">Disclosures</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {[
                      { label: 'Time Required to Join', val: application.joiningTimeRequired || '-' },
                      { label: 'Computer Proficiency', val: application.hasComputerProficiency ? 'YES' : 'NO' },
                      { label: 'NOC Available', val: application.nocAvailable ? 'YES' : 'NO' },
                      { label: 'Debarred from Exams', val: application.debarredForUnfairMeans ? 'YES' : 'NO' },
                      { label: 'Disciplinary Pending', val: application.pendingDisciplinaryProceeding ? 'YES' : 'NO' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                        <span className="text-[9pt] font-medium text-slate-500">{item.label}</span>
                        <span className="text-[9pt] font-black text-slate-900">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* LANGUAGES KNOWN SECTION */}
              <section className="space-y-4 pt-4">
                <h3 className="bg-slate-900 text-white px-4 py-1 font-bold uppercase tracking-widest text-[10pt]">Languages Known</h3>
                <div className="overflow-hidden border border-slate-900 rounded-lg">
                  <table className="w-full border-collapse text-[9pt] font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[8px] tracking-wider border-b border-slate-300">
                        <th className="p-2 border-r border-slate-200 text-left">Language</th>
                        <th className="p-2 border-r border-slate-200 text-center">Read</th>
                        <th className="p-2 border-r border-slate-200 text-center">Write</th>
                        <th className="p-2 text-center">Speak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {application.languages && application.languages.length > 0 ? (
                        application.languages.map((lang, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                            <td className="p-2 border-r border-slate-200 font-bold uppercase">{lang.language || 'N/A'}</td>
                            <td className="p-2 border-r border-slate-200 text-center">
                              {lang.read ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto" /> : <span className="text-slate-300">-</span>}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-center">
                              {lang.write ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto" /> : <span className="text-slate-300">-</span>}
                            </td>
                            <td className="p-2 text-center">
                              {lang.speak ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto" /> : <span className="text-slate-300">-</span>}
                            </td>
                          </tr>
                        ))
                      ) : application.languagesKnown ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-slate-700 font-bold">
                            {application.languagesKnown}
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400 italic">No language data provided</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* PART 5: REFEREES */}
              <section className="space-y-4 pt-4">
                <h3 className="bg-slate-900 text-white px-4 py-1 font-bold uppercase tracking-widest text-[10pt]">Professional Referees</h3>
                <div className="grid grid-cols-2 gap-4">
                  {application.referees?.map((ref, idx) => (
                    <div key={idx} className="border border-slate-300 p-4 rounded-xl bg-white shadow-sm flex flex-col gap-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-black uppercase text-slate-900 text-[10pt] leading-none">{ref.name}</span>
                        <span className="bg-slate-100 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Referee #{idx+1}</span>
                      </div>
                      <span className="text-indigo-700 font-black text-[9pt] uppercase leading-tight">{ref.designation}</span>
                      <p className="text-[8pt] text-slate-500 leading-tight italic line-clamp-2">{ref.address}</p>
                      <div className="mt-2 flex gap-3 text-[8pt] font-bold text-slate-800">
                        <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-slate-400" /> {ref.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-slate-400" /> {ref.mobile}</span>
                      </div>
                    </div>
                  )) || <div className="col-span-2 text-center p-4 border border-dashed rounded-lg text-slate-300 font-bold uppercase text-[10px]">No referees provided</div>}
                </div>
              </section>

              {/* PART 6: DECLARATION & SIGNATURE */}
              <section className="pt-8 border-t-2 border-slate-900">
                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <h4 className="font-black uppercase text-[10pt] text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" /> Applicant&rsquo;s Declaration
                    </h4>
                    <p className="text-[10pt] font-medium text-slate-700 leading-relaxed text-justify">
                      I hereby declare that all particulars furnished in this application are true, complete and correct to the best of my knowledge and belief. I understand that my candidature shall be liable to cancellation at any stage of recruitment if any information furnished by me is found to be false, misleading, incomplete or suppressed, or if I am found ineligible under the applicable recruitment rules and conditions prescribed in the advertisement.
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-8">
                    <div className="space-y-3 font-bold text-[10pt]">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-black uppercase text-[9px]">Submission Date:</span>
                        <span className="font-mono text-slate-900 underline underline-offset-4">{application.date || new Date().toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-black uppercase text-[9px]">Submission Place:</span>
                        <span className="text-slate-900 underline underline-offset-4 decoration-dotted">{application.place || 'RANCHI, JHARKHAND'}</span>
                      </div>
                    </div>

                    <div className="text-center space-y-4 w-64">
                      <div className="h-24 w-full border-2 border-slate-900 rounded-xl bg-slate-50 flex items-center justify-center p-2 overflow-hidden shadow-inner relative">
                        {application.applicant?.signatureUrl ? (
                          <img src={application.applicant.signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Sign Attached</span>
                        )}
                        <div className="absolute top-0 right-0 p-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9pt] font-black uppercase tracking-widest text-slate-900">E-Signature</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">(Candidate&rsquo;s Verification mark)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FOOTER INFO */}
              <div className="pt-12 text-center border-t border-slate-100 flex flex-col items-center gap-2">
                <div className="flex gap-4 text-[8px] font-black uppercase text-slate-300 tracking-[0.3em]">
                  <span>Mesra</span>
                  <span>|</span>
                  <span>Ranchi</span>
                  <span>|</span>
                  <span>Jharkhand</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-30 text-[9px] font-bold">
                  <Globe className="w-3 h-3" /> bitmesra.ac.in
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
