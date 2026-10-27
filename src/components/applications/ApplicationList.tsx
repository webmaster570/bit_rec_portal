import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Application, ApplicationStage } from '../../types';
import { AdmitCardModal } from '../common/AdmitCardModal';
import { OfferLetterModal } from '../common/OfferLetterModal';
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Award,
  CreditCard,
  User,
  Building2,
  Calendar,
  X,
  Printer,
  ShieldCheck,
} from 'lucide-react';

export const ApplicationList: React.FC = () => {
  const { applications, drives } = usePortal();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriveFilter, setSelectedDriveFilter] = useState<string>('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const [selectedAppDetail, setSelectedAppDetail] = useState<Application | null>(null);
  const [showAdmitCardModal, setShowAdmitCardModal] = useState<Application | null>(null);
  const [showOfferModal, setShowOfferModal] = useState<Application | null>(null);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.postTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDrive = selectedDriveFilter === 'all' || app.driveId === selectedDriveFilter;
    const matchesStage = selectedStageFilter === 'all' || app.stage === selectedStageFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || app.applicant.category === selectedCategoryFilter;

    return matchesSearch && matchesDrive && matchesStage && matchesCategory;
  });

  const getStageBadge = (stage: ApplicationStage) => {
    switch (stage) {
      case 'submitted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Submitted</span>;
      case 'screened_eligible':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">Screened Eligible</span>;
      case 'screened_ineligible':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Ineligible</span>;
      case 'doc_verified':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">Doc Verified</span>;
      case 'doc_discrepancy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Doc Discrepancy</span>;
      case 'interview_scheduled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Interview Scheduled</span>;
      case 'selected':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Merit Selected</span>;
      case 'offer_issued':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">Offer Issued</span>;
      case 'offer_accepted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-300">Offer Accepted</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{stage}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl shadow-md border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Application Master Database</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized applicant submissions, verification logs, stage progress tracking, and hall tickets.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            Total Applications: <strong className="text-indigo-600">{applications.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-card p-4 rounded-xl shadow-2xs space-y-3 border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Application No, Candidate Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedDriveFilter}
              onChange={(e) => setSelectedDriveFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Recruitment Drives</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.advtNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Application Stages</option>
              <option value="submitted">Submitted</option>
              <option value="screened_eligible">Screened Eligible</option>
              <option value="screened_ineligible">Ineligible</option>
              <option value="doc_verified">Doc Verified</option>
              <option value="doc_discrepancy">Doc Discrepancy</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="selected">Merit Selected</option>
              <option value="offer_issued">Offer Issued</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Reservation Categories</option>
              <option value="UR">UR (General)</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xs border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">App No / Reg No</th>
                <th className="p-3.5">Candidate Details</th>
                <th className="p-3.5">Position & Department</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Fee Status</th>
                <th className="p-3.5">Current Stage</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No application records match the selected search parameters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-slate-900 block">{app.applicationNo}</span>
                      <span className="text-[10px] text-slate-500">{app.applicant.regNumber}</span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={app.applicant.photoUrl}
                          alt={app.applicant.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 block">{app.applicant.fullName}</span>
                          <span className="text-[10px] text-slate-500 block">{app.applicant.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-slate-900 block">{app.postTitle}</span>
                      <span className="text-[10px] text-indigo-600 block">{app.departmentName}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {app.applicant.category} {app.applicant.isPwD ? '(PwD)' : ''}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : app.paymentStatus === 'Exempted'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {app.paymentStatus}
                      </span>
                    </td>

                    <td className="p-3.5">{getStageBadge(app.stage)}</td>

                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedAppDetail(app)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold border border-slate-200 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Inspect</span>
                      </button>

                      {app.admitCardIssued && (
                        <button
                          onClick={() => setShowAdmitCardModal(app)}
                          className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200 inline-flex items-center gap-1"
                          title="View / Print Hall Ticket"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Admit Card</span>
                        </button>
                      )}

                      {(app.stage === 'offer_issued' || app.stage === 'offer_accepted') && (
                        <button
                          onClick={() => setShowOfferModal(app)}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-200 inline-flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Offer Letter</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Application Full Detail Drawer Modal */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedAppDetail.applicant.photoUrl}
                  alt={selectedAppDetail.applicant.fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedAppDetail.applicant.fullName} ({selectedAppDetail.applicationNo})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applied for: <span className="text-indigo-600 font-semibold">{selectedAppDetail.postTitle}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAppDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Personal Info Grid */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                  1. Applicant Personal Profile
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-500 block">Father's Name</span>
                    <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mother's Name</span>
                    <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.motherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Birth</span>
                    <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.dob}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Category / Gender</span>
                    <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.category} / {selectedAppDetail.applicant.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mobile Number</span>
                    <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email Address</span>
                    <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ID Proof</span>
                    <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.idProofType}: {selectedAppDetail.applicant.idProofNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Address</span>
                    <span className="font-semibold text-slate-900">{selectedAppDetail.applicant.address}, {selectedAppDetail.applicant.district}, {selectedAppDetail.applicant.state} - {selectedAppDetail.applicant.pin}</span>
                  </div>
                </div>
              </div>

              {/* Academic History */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                  2. Academic Qualifications
                </h4>

                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-1">Degree</th>
                      <th className="py-1">Specialization</th>
                      <th className="py-1">University / Board</th>
                      <th className="py-1">Year</th>
                      <th className="py-1">Marks / CGPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedAppDetail.academics.map((acad, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-semibold text-slate-900">{acad.degree}</td>
                        <td className="py-2 text-slate-700">{acad.fieldOfStudy}</td>
                        <td className="py-2 text-slate-500">{acad.boardOrUniversity}</td>
                        <td className="py-2 text-slate-700">{acad.passingYear}</td>
                        <td className="py-2 font-semibold text-emerald-600">{acad.gradeOrPercentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Uploaded Documents */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                  3. Uploaded Certificates & Verification Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedAppDetail.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block">{doc.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{doc.type.replace(/_/g, ' ')} • {doc.fileSize}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          doc.status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : doc.status === 'discrepancy'
                            ? 'bg-amber-50 text-amber-700 border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screening & Evaluation Summary */}
              {selectedAppDetail.screeningRemarks && selectedAppDetail.screeningRemarks.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                    4. Committee Screening Audit Trail
                  </h4>
                  {selectedAppDetail.screeningRemarks.map((rem, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-900">
                        <span>{rem.committeeMember} ({rem.committeeMemberRole})</span>
                        <span className="text-emerald-600">{rem.decision}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1">{rem.remarks}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admit Card & Offer Letter Modals */}
      {showAdmitCardModal && (
        <AdmitCardModal application={showAdmitCardModal} onClose={() => setShowAdmitCardModal(null)} />
      )}

      {showOfferModal && (
        <OfferLetterModal application={showOfferModal} onClose={() => setShowOfferModal(null)} />
      )}
    </div>
  );
};
