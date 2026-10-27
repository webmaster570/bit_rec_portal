import React from 'react';
import { Application } from '../../types';
import { usePortal } from '../../context/PortalContext';
import { X, Printer, Award, CheckCircle2, XCircle, Building2, Calendar, FileText } from 'lucide-react';

interface OfferLetterModalProps {
  application: Application;
  onClose: () => void;
}

export const OfferLetterModal: React.FC<OfferLetterModalProps> = ({ application, onClose }) => {
  const { respondToOffer } = usePortal();

  const handleRespond = (response: 'Accepted' | 'Declined') => {
    respondToOffer(application.id, response);
    alert(`Thank you! Offer ${response} recorded successfully.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">Official Offer of Appointment</h3>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] sm:text-xs font-semibold flex items-center space-x-1 border border-slate-200 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Letter</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offer Letter Document (Scrollable) */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white text-xs text-slate-700 flex-1 overflow-y-auto">
          <div className="text-center border-b border-slate-200 pb-3.5 space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight uppercase">
              National University of Technology & Sciences
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500">Office of the Registrar & Faculty Recruitment Board</p>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">Ref No: NUTS/OFFER/2026/{application.applicationNo}</span>
          </div>

          <div className="space-y-3 leading-relaxed text-xs">
            <p>
              To,
              <br />
              <strong className="text-slate-900 text-xs sm:text-sm">{application.applicant.fullName}</strong>
              <br />
              <span className="text-slate-600">
                {application.applicant.address}, {application.applicant.district}, {application.applicant.state}
              </span>
            </p>

            <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              Subject: Offer of Appointment for the post of <span className="text-emerald-700 font-bold">{application.postTitle}</span> under {application.departmentName}.
            </p>

            <p className="text-slate-700">
              Dear Candidate,
              <br />
              We are pleased to inform you that based on your merit performance in the Written Examination and Interview evaluation under Advertisement <span className="font-mono text-indigo-600 font-bold">{application.advtNumber}</span>, you have been selected for appointment as <strong className="text-slate-900">{application.postTitle}</strong> under <strong className="text-slate-900">{application.selectionCategory || application.applicant.category} Category</strong>.
            </p>

            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2 font-mono text-[10px] sm:text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Merit Rank Position:</span>
                <span className="font-bold text-purple-700">#{application.meritRank || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aggregate Evaluation Score:</span>
                <span className="font-bold text-amber-700">{application.aggregateScore || 92.4} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Joining Confirmation Deadline:</span>
                <span className="font-bold text-emerald-700">June 25, 2026</span>
              </div>
            </div>

            <p className="text-slate-500 text-[10px] sm:text-[11px]">
              This offer is conditional upon satisfactory verification of original character certificates, physical fitness endorsement, and official degree transcripts.
            </p>
          </div>

          {/* Interactive Candidate Response Controls */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Candidate Offer Response</span>
              <span className="text-[10px] text-slate-500">Current Status: {application.offerStatus || 'Pending'}</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => handleRespond('Accepted')}
                disabled={application.offerStatus === 'Accepted'}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept Offer</span>
              </button>
              <button
                onClick={() => handleRespond('Declined')}
                disabled={application.offerStatus === 'Declined'}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
