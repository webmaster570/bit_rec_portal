import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import {
  CreditCard,
  Search,
  CheckCircle,
  RefreshCw,
  Download,
  DollarSign,
  TrendingUp,
  FileText,
} from 'lucide-react';

export const FinancePortal: React.FC = () => {
  const { applications, reconcilePayment } = usePortal();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const paidApps = applications.filter((a) => a.paymentStatus === 'Paid');
  const totalRevenue = paidApps.reduce((sum, a) => sum + a.feeAmount, 0);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.transactionId && app.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || app.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl shadow-md border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Finance & Fee Reconciliation Portal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Application fee monitoring, bank payment gateway reconciliation, transaction logs, and refund processing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const csv = 'ApplicationNo,Candidate,Amount,Status,TxnId\n' + applications.map(a => `${a.applicationNo},${a.applicant.fullName},${a.feeAmount},${a.paymentStatus},${a.transactionId || 'N/A'}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Recruitment_Fee_Transactions_2026.csv';
              a.click();
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Transactions CSV</span>
          </button>
        </div>
      </div>

      {/* Revenue KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-slate-500 uppercase font-medium block">Total Fee Collected</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Reconciled Bank Deposits</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-slate-500 uppercase font-medium block">Paid Applications</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{paidApps.length}</div>
            <span className="text-[10px] text-indigo-600 font-medium">Successful Gateway Payments</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-slate-500 uppercase font-medium block">Category Fee Exemptions</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {applications.filter((a) => a.paymentStatus === 'Exempted').length}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">SC / ST / PwD Candidates</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Txn ID, Application No, Candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Exempted">Exempted</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Application No</th>
                <th className="p-3.5">Candidate Name</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Receipt No</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Reconciliation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-mono text-indigo-600 font-bold">
                    {app.transactionId || 'N/A (Exempt)'}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">{app.applicationNo}</td>
                  <td className="p-3.5 font-semibold text-slate-800">{app.applicant.fullName}</td>
                  <td className="p-3.5 font-bold text-emerald-600">₹{app.feeAmount}</td>
                  <td className="p-3.5 font-mono text-slate-500">{app.paymentReceiptNo || 'N/A'}</td>
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
                  <td className="p-3.5 text-right space-x-2">
                    {app.paymentStatus === 'Paid' && (
                      <button
                        onClick={() => reconcilePayment(app.id, 'Refunded')}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200"
                      >
                        Process Refund
                      </button>
                    )}
                    {app.paymentStatus === 'Pending' && (
                      <button
                        onClick={() => reconcilePayment(app.id, 'Paid')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-2xs"
                      >
                        Mark Reconciled Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
