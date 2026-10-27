import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  User,
  Clock,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = usePortal();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const exportAuditCSV = () => {
    const header = 'Timestamp,Role,Action,Details,IPAddress\n';
    const rows = filteredLogs
      .map((l) => `"${l.timestamp}","${l.userRole}","${l.action}","${l.details.replace(/"/g, '""')}","${l.ipAddress}"`)
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recruitment_Audit_Logs_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl shadow-md border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">System Security & Audit Trail Logs</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system event tracking for compliance, screening actions, score updates, and permission changes.
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-2 shrink-0"
        >
          <Download className="w-4 h-4 text-rose-600" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Table */}
      <div className="glass-card border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit actions or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
            >
              <option value="all">All Performing Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="recruitment_admin">Recruitment Admin</option>
              <option value="screening_committee">Screening Committee</option>
              <option value="doc_verifier">Document Verifier</option>
              <option value="interview_panel">Interview Panel</option>
              <option value="applicant">Applicant</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User Role</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Event Details</th>
                <th className="p-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {log.userRole.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-rose-600">{log.action}</td>
                  <td className="p-3.5 text-slate-800">{log.details}</td>
                  <td className="p-3.5 text-right font-mono text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
