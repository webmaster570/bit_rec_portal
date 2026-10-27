import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { THEME_CONFIGS } from '../../themeStyles';
import {
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Server,
  Info,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const SystemStatusPortal: React.FC = () => {
  const { mongoStatus, refreshFromDatabase, reconnectDb, branding } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await reconnectDb();
    setIsRefreshing(false);
    setNotice('Connectivity status checked and updated.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${mongoStatus.connected ? 'bg-emerald-600' : 'bg-amber-600'}`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">System Connectivity & API Health</h1>
            <p className="text-xs text-slate-500">Real-time status of the recruitment portal database engine and server-side components.</p>
          </div>
        </div>
      </div>

      {/* Main Status Display */}
      <div className={`glass-card border p-8 rounded-3xl shadow-md space-y-6 transition-all ${
        mongoStatus.connected 
          ? 'border-emerald-200 bg-emerald-50/30' 
          : mongoStatus.missingUri 
            ? 'border-rose-200 bg-rose-50/30'
            : 'border-amber-200 bg-amber-50/30'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              mongoStatus.connected 
                ? 'bg-emerald-500 animate-pulse' 
                : mongoStatus.missingUri 
                  ? 'bg-rose-500 animate-bounce' 
                  : 'bg-amber-500 animate-pulse'
            }`} />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Database Engine Status</div>
              <div className={`text-2xl font-black ${
                mongoStatus.connected 
                  ? 'text-emerald-700' 
                  : mongoStatus.missingUri 
                    ? 'text-rose-700' 
                    : 'text-amber-700'
              }`}>
                {mongoStatus.connected ? 'Healthy & Connected' : mongoStatus.missingUri ? 'Configuration Missing' : 'Connecting...'}
              </div>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isRefreshing}
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-800 font-bold text-sm shadow-sm transition hover:shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check Connectivity</span>
          </button>
        </div>

        {notice && (
          <div className="p-3 bg-white/80 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4" />
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 p-4 rounded-2xl border border-white shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Provider</span>
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">MongoDB Atlas Cluster (v7.0)</span>
            </div>
          </div>
          <div className="bg-white/70 p-4 rounded-2xl border border-white shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Sync Check</span>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">{mongoStatus.lastSyncedAt || 'Never'}</span>
            </div>
          </div>
        </div>

        {/* Error Details */}
        {mongoStatus.error && !mongoStatus.connected && (
          <div className={`p-5 rounded-2xl border text-xs space-y-3 shadow-sm ${mongoStatus.missingUri ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <div className="flex items-center space-x-2 font-black uppercase tracking-tight">
              <ShieldAlert className="w-5 h-5" />
              <span>{mongoStatus.missingUri ? 'Critical Configuration Error' : 'Connectivity Interruption'}</span>
            </div>
            <p className="leading-relaxed font-medium">
              {mongoStatus.error}
            </p>
          </div>
        )}
      </div>

      {/* Troubleshooting Guide */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold">Production Troubleshooting Guide</h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono border border-white/20">v1.2.0</span>
        </div>

        <div className="p-6 space-y-8">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">1</div>
              <h3 className="font-extrabold text-slate-900">Add MONGODB_URI in Vercel Dashboard</h3>
            </div>
            <div className="ml-10 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>Since you switched repositories, your old environment variables are <strong>not</strong> automatically carried over. You must add them manually to the new project.</p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 font-medium">
                <p>1. Open <strong>Vercel Dashboard</strong> &gt; Project <strong>bit_rec_portal</strong>.</p>
                <p>2. Go to <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</p>
                <p>3. Add <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700 font-bold">MONGODB_URI</code>.</p>
                <p>4. Paste your connection string (ensure it starts with <code className="text-slate-500">mongodb+srv://...</code>).</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm shrink-0">2</div>
              <h3 className="font-extrabold text-slate-900">Trigger a New Deployment</h3>
            </div>
            <div className="ml-10 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>Adding an environment variable in Vercel <strong>does not</strong> affect existing builds. You must redeploy for the server to see the new key.</p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 font-medium">
                <p>1. Go to the <strong>Deployments</strong> tab in Vercel.</p>
                <p>2. Find the latest deployment and click the <strong className="text-slate-900">...</strong> menu.</p>
                <p>3. Select <strong>Redeploy</strong> (ensure "Use existing Build Cache" is unchecked if possible).</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">3</div>
              <h3 className="font-extrabold text-slate-900">Configure MongoDB Atlas IP Whitelist</h3>
            </div>
            <div className="ml-10 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>Vercel's edge network uses dynamic IP addresses. You must allow connections from any IP in your MongoDB Atlas dashboard.</p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 font-medium">
                <p>1. Log in to <strong>MongoDB Atlas</strong> &gt; <strong>Network Access</strong>.</p>
                <p>2. Click <strong>+ Add IP Address</strong>.</p>
                <p>3. Choose <strong>Allow Access from Anywhere</strong> (IP: <code className="bg-emerald-50 px-1 rounded text-emerald-700 font-bold">0.0.0.0/0</code>).</p>
                <p>4. Confirm and wait for the status to show &quot;Active&quot;.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Still having issues? Check the Vercel <strong>Runtime Logs</strong> for specific error messages.
          </div>
          <button 
            onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2"
          >
            <span>Open Vercel Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Return to Login */}
      <div className="text-center">
        <p className="text-xs text-slate-500 mb-3 font-medium italic">Once the status indicator above turns GREEN, you can proceed to login.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-200 transition transform hover:scale-102 flex items-center gap-2 mx-auto"
        >
          <span>Return to Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
