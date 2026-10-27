import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Application } from '../../types';
import {
  FileSearch,
  Search,
  CheckCircle,
  XCircle,
  AlertOctagon,
  FileText,
  User,
  Building2,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const DocumentVerificationPortal: React.FC = () => {
  const { applications, updateDocVerification } = usePortal();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(
    applications.find((a) => a.docVerificationStatus === 'Pending' || a.docVerificationStatus === 'Discrepancy') || applications[0] || null
  );

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docRemarks, setDocRemarks] = useState('');
  const [discrepancyReason, setDiscrepancyReason] = useState('');

  const filteredApps = applications.filter(
    (app) =>
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDocumentAction = (status: 'Verified' | 'Discrepancy' | 'Rejected') => {
    if (!selectedApp) return;

    updateDocVerification(
      selectedApp.id,
      status,
      docRemarks || `Marked ${status} by DVO Officer.`,
      selectedDocId || undefined,
      status === 'Discrepancy' ? discrepancyReason : undefined
    );

    setDocRemarks('');
    setDiscrepancyReason('');
    setSelectedDocId(null);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl shadow-md border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <FileSearch className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl font-bold text-slate-900">Document Verification Officer (DVO) Portal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit original uploaded transcripts, caste certificates, and experience documents for discrepancies.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold text-xs">
            Pending Audit: {applications.filter((a) => a.docVerificationStatus === 'Pending').length} Applicants
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-4 glass-card border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto space-y-1">
            {filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-50 border border-cyan-300 text-slate-900'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs block">{app.applicant.fullName}</span>
                    <span className="text-[10px] font-mono text-slate-500 block">{app.applicationNo}</span>
                    <span className="text-[10px] text-cyan-700 font-medium block">{app.documents.length} Uploaded Files</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      app.docVerificationStatus === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : app.docVerificationStatus === 'Discrepancy'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {app.docVerificationStatus || 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Inspection Area */}
        <div className="lg:col-span-8 glass-card border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          {selectedApp ? (
            <div className="space-y-5">
              {/* Candidate Info Header */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedApp.applicant.photoUrl}
                    alt={selectedApp.applicant.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedApp.applicant.fullName}</h3>
                    <p className="text-xs text-slate-500">
                      Post: <span className="text-cyan-700 font-semibold">{selectedApp.postTitle}</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-200 text-slate-800">
                  Status: {selectedApp.docVerificationStatus}
                </span>
              </div>

              {/* Uploaded Files Table */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Uploaded Document Inventory
                </h4>

                <div className="space-y-2">
                  {selectedApp.documents.map((doc) => {
                    const isSelectedDoc = selectedDocId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelectedDoc
                            ? 'bg-cyan-100/70 border-cyan-400 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-cyan-600" />
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{doc.name}</span>
                            <span className="text-[10px] text-slate-500 uppercase">
                              Type: {doc.type.replace(/_/g, ' ')} • Size: {doc.fileSize}
                            </span>
                            {doc.discrepancyReason && (
                              <span className="text-[10px] text-amber-700 block font-medium">
                                Discrepancy Note: {doc.discrepancyReason}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              doc.status === 'verified'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : doc.status === 'discrepancy'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DVO Action Panel */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Verification Decision Controls
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discrepancy Details (If Flagging Document Issue)
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Stamp missing on experience letterhead, caste cert issued after cutoff date..."
                    value={discrepancyReason}
                    onChange={(e) => setDiscrepancyReason(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Overall DVO Audit Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter verification notes for candidate record..."
                    value={docRemarks}
                    onChange={(e) => setDocRemarks(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleDocumentAction('Discrepancy')}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Flag Discrepancy</span>
                  </button>

                  <button
                    onClick={() => handleDocumentAction('Verified')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Candidate Documents</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select a candidate to review uploaded transcripts and degree certificates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
