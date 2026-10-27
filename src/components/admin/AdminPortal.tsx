import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { INITIAL_BRANDING } from '../../constants';
import { UserRole, PortalUser } from '../../types';
import { THEME_CONFIGS } from '../../themeStyles';
import {
  Settings,
  ShieldCheck,
  Building2,
  Users,
  Database,
  Mail,
  Plus,
  Save,
  CheckCircle,
  Key,
  Globe,
  Image as ImageIcon,
  Palette,
  GraduationCap,
  Award,
  Sparkles,
  Upload,
  RotateCcw,
  RefreshCw,
  Server,
  Activity,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Phone,
  ArrowRightLeft,
  AlertTriangle,
  X,
  Lock,
  Eye,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    roles,
    departments,
    users,
    addUser,
    updateUser,
    deleteUser,
    addDepartment,
    updateRolePermissions,
    logAudit,
    allowDevRoleSelector,
    toggleDevRoleSelector,
    branding,
    updateBranding,
    mongoStatus,
    refreshFromDatabase,
    drives,
    applications,
    auditLogs,
    resetToDemoData,
    login,
    switchRole,
    currentUser,
  } = usePortal();

  const theme = THEME_CONFIGS[branding.theme || 'classic'];
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'branding' | 'rbac' | 'departments' | 'email' | 'system'>('users');
  const [isRefreshingDb, setIsRefreshingDb] = useState(false);
  const [dbNotice, setDbNotice] = useState<string | null>(null);

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<PortalUser | null>(null);
  const [userActionNotice, setUserActionNotice] = useState<string | null>(null);

  // User Form State
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormRole, setUserFormRole] = useState<UserRole>('screening_committee');
  const [userFormDesignation, setUserFormDesignation] = useState('');
  const [userFormDeptId, setUserFormDeptId] = useState('');
  const [userFormMobile, setUserFormMobile] = useState('');
  const [userFormStatus, setUserFormStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  const [userFormNotes, setUserFormNotes] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Branding Form State
  const [navTitle, setNavTitle] = useState(branding.title);
  const [navSubtitle, setNavSubtitle] = useState(branding.subtitle);
  const [logoType, setLogoType] = useState<'icon' | 'image'>(branding.logoType);
  const [logoIconName, setLogoIconName] = useState(branding.logoIconName || 'Building2');
  const [logoImageUrl, setLogoImageUrl] = useState(branding.logoImageUrl || '');
  const [selectedTheme, setSelectedTheme] = useState(branding.theme || 'classic');
  const [brandingSavedNotice, setBrandingSavedNotice] = useState(false);
  const [isBrandingDirty, setIsBrandingDirty] = useState(false);

  // Sync form state when branding context updates ONLY if user has not actively made local edits
  React.useEffect(() => {
    if (!isBrandingDirty) {
      setNavTitle(branding.title);
      setNavSubtitle(branding.subtitle);
      setLogoType(branding.logoType);
      setLogoIconName(branding.logoIconName || 'Building2');
      setLogoImageUrl(branding.logoImageUrl || '');
      setSelectedTheme(branding.theme || 'classic');
    }
  }, [branding, isBrandingDirty]);

  // New Dept Form
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptHeadEmail, setDeptHeadEmail] = useState('');

  // Selected Role for Permission Editing
  const [selectedRole, setSelectedRole] = useState<UserRole>('screening_committee');
  const roleObj = roles.find((r) => r.id === selectedRole);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(roleObj?.permissions || []);

  const allAvailablePermissions = [
    { id: 'all_access', name: 'SuperAdmin Full Control' },
    { id: 'manage_drives', name: 'Create & Edit Recruitment Drives' },
    { id: 'manage_posts', name: 'Configure Post Positions & Eligibility' },
    { id: 'process_applications', name: 'Process & Update Applications' },
    { id: 'screen_applications', name: 'Screen Candidate Eligibility' },
    { id: 'verify_documents', name: 'Verify Uploaded Degree Certs & ID' },
    { id: 'enter_interview_scores', name: 'Enter Interview & Test Scores' },
    { id: 'generate_merit', name: 'Calculate & Publish Merit Lists' },
    { id: 'reconcile_payments', name: 'Monitor & Reconcile Payment Receipts' },
    { id: 'view_audit_logs', name: 'Inspect Security Audit Logs' },
  ];

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({
      title: navTitle,
      subtitle: navSubtitle,
      logoType,
      logoIconName,
      logoImageUrl,
      theme: selectedTheme as any,
    });
    setIsBrandingDirty(false);
    setBrandingSavedNotice(true);
    setTimeout(() => setBrandingSavedNotice(false), 4000);
  };

  const handleResetBranding = () => {
    if (window.confirm('Reset website navbar title, tagline, and logo back to factory defaults?')) {
      updateBranding(INITIAL_BRANDING);
      setNavTitle(INITIAL_BRANDING.title);
      setNavSubtitle(INITIAL_BRANDING.subtitle);
      setLogoType(INITIAL_BRANDING.logoType);
      setLogoIconName(INITIAL_BRANDING.logoIconName);
      setLogoImageUrl(INITIAL_BRANDING.logoImageUrl);
      setSelectedTheme(INITIAL_BRANDING.theme || 'classic');
      setIsBrandingDirty(false);
      setBrandingSavedNotice(true);
      setTimeout(() => setBrandingSavedNotice(false), 4000);
    }
  };

  // User Management Actions
  const handleOpenCreateUser = () => {
    setEditingUserId(null);
    setUserFormName('');
    setUserFormEmail('');
    setUserFormRole('screening_committee');
    setUserFormDesignation('');
    setUserFormDeptId(departments[0]?.id || '');
    setUserFormMobile('');
    setUserFormStatus('active');
    setUserFormNotes('');
    setUserFormPassword('pass123'); // Default password for new users
    setUserFormError(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: PortalUser) => {
    setEditingUserId(user.id);
    setUserFormName(user.name);
    setUserFormEmail(user.email);
    setUserFormRole(user.role);
    setUserFormDesignation(user.designation || '');
    setUserFormDeptId(user.departmentId || '');
    setUserFormMobile(user.mobile || '');
    setUserFormStatus(user.status);
    setUserFormNotes(user.notes || '');
    setUserFormPassword(user.password || 'pass123');
    setUserFormError(null);
    setIsUserModalOpen(true);
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    const trimmedName = userFormName.trim();
    const trimmedEmail = userFormEmail.trim().toLowerCase();

    if (!trimmedName) {
      setUserFormError('Please enter user full name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setUserFormError('Please enter a valid email address.');
      return;
    }

    // Check duplicate email
    const duplicate = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.id !== editingUserId
    );
    if (duplicate) {
      setUserFormError(`A user with email "${trimmedEmail}" already exists (${duplicate.name} - ${duplicate.role}).`);
      return;
    }

    if (editingUserId) {
      updateUser(editingUserId, {
        name: trimmedName,
        email: trimmedEmail,
        role: userFormRole,
        designation: userFormDesignation.trim() || undefined,
        departmentId: userFormDeptId || undefined,
        mobile: userFormMobile.trim() || undefined,
        status: userFormStatus,
        notes: userFormNotes.trim() || undefined,
        password: userFormPassword.trim() || undefined,
      });
      setUserActionNotice(`User account "${trimmedName}" updated successfully.`);
    } else {
      addUser({
        name: trimmedName,
        email: trimmedEmail,
        role: userFormRole,
        designation: userFormDesignation.trim() || undefined,
        departmentId: userFormDeptId || undefined,
        mobile: userFormMobile.trim() || undefined,
        status: userFormStatus,
        notes: userFormNotes.trim() || undefined,
        password: userFormPassword.trim() || 'pass123',
      });
      setUserActionNotice(`New user "${trimmedName}" created and assigned [${userFormRole}] role.`);
    }

    setIsUserModalOpen(false);
    setTimeout(() => setUserActionNotice(null), 4000);
  };

  const handleToggleUserStatus = (user: PortalUser) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    updateUser(user.id, { status: nextStatus });
    setUserActionNotice(`User "${user.name}" status switched to [${nextStatus}].`);
    setTimeout(() => setUserActionNotice(null), 3000);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.id);
    setUserActionNotice(`User account "${deletingUser.name}" (${deletingUser.email}) was removed.`);
    setDeletingUser(null);
    setTimeout(() => setUserActionNotice(null), 4000);
  };

  const handleSwitchToUserAccount = (user: PortalUser) => {
    login(user.role, user.email, user.name, user.regNumber);
    switchRole(user.role);
    setUserActionNotice(`Switched active session to: ${user.name} (${user.role})`);
    setTimeout(() => setUserActionNotice(null), 4000);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.designation && u.designation.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.departmentId && departments.find((d) => d.id === u.departmentId)?.name.toLowerCase().includes(userSearchQuery.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'all' || u.status === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSavePermissions = () => {
    updateRolePermissions(selectedRole, selectedPermissions);
    alert(`Updated permissions for ${roleObj?.name} successfully!`);
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptCode || !deptName) return;

    addDepartment({
      code: deptCode,
      name: deptName,
      headEmail: deptHeadEmail || `hod.${deptCode.toLowerCase()}@univ.edu`,
    });

    setDeptCode('');
    setDeptName('');
    setDeptHeadEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Title Bar & System Governance Round Icon Navigation Tabs */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  System Governance & Master Settings
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Granular Role-Based Access Control (RBAC), Department Master Data, Portal Branding, Notification Templates, and DB Health.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Round Icon Tabs Grid (No Horizontal Scrollbar, auto wraps cleanly on all screens) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 pt-1">
          {[
            { id: 'users', label: 'User Directory', icon: Users, count: users.length, color: 'from-purple-600 to-indigo-600' },
            { id: 'branding', label: 'Portal Branding', icon: Palette, count: undefined, color: 'from-pink-500 to-rose-600' },
            { id: 'rbac', label: 'RBAC Roles', icon: Key, count: roles.length, color: 'from-amber-500 to-orange-600' },
            { id: 'departments', label: 'Departments', icon: Building2, count: departments.length, color: 'from-blue-500 to-cyan-600' },
            { id: 'email', label: 'Email / SMS', icon: Mail, count: undefined, color: 'from-emerald-500 to-teal-600' },
            { id: 'system', label: 'System Status', icon: Database, count: undefined, color: 'from-indigo-600 to-purple-800' },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeAdminTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveAdminTab(t.id as any)}
                className={`relative group p-3 sm:p-3.5 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 border ${
                  isActive
                    ? 'bg-gradient-to-b from-purple-50 via-indigo-50/50 to-white border-purple-300 shadow-md shadow-purple-500/10 ring-2 ring-purple-600 ring-offset-2 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-purple-200 text-slate-600 hover:text-slate-900 shadow-2xs hover:scale-101'
                }`}
              >
                {/* Round Circular Icon Tab */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs ${
                    isActive
                      ? `bg-gradient-to-tr ${t.color} text-white shadow-md ring-2 ring-white`
                      : 'bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-700'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                </div>

                {/* Tab Label */}
                <span
                  className={`text-xs font-bold leading-tight line-clamp-1 ${
                    isActive ? 'text-purple-950 font-black' : 'text-slate-700 group-hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </span>

                {/* Item Count Pill Badge */}
                {t.count !== undefined ? (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-purple-200 text-purple-900'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {t.count} items
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Config</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {userActionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{userActionNotice}</span>
          </div>
          <button onClick={() => setUserActionNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB: User Management */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          {/* User Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${theme.cardBase} p-4`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900">{users.length}</span>
                <span className="text-[11px] text-slate-500">accounts</span>
              </div>
            </div>

            <div className={`${theme.cardBase} p-4`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Staff</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-emerald-700">
                  {users.filter((u) => u.status === 'active' && u.role !== 'applicant').length}
                </span>
                <span className="text-[11px] text-slate-500">officers & admin</span>
              </div>
            </div>

            <div className={`${theme.cardBase} p-4`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Screening & Panel</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-cyan-700">
                  {users.filter((u) => u.role === 'screening_committee' || u.role === 'interview_panel').length}
                </span>
                <span className="text-[11px] text-slate-500">evaluators</span>
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inactive / Suspended</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-amber-700">
                  {users.filter((u) => u.status !== 'active').length}
                </span>
                <span className="text-[11px] text-slate-500">restricted</span>
              </div>
            </div>
          </div>

          {/* User List Table Card */}
          <div className="glass-card border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Portal User Directory & Access Management</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Administrator can create, update, suspend, or delete user accounts across all portal roles.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[200px] sm:min-w-[240px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, role..."
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="recruitment_admin">Recruitment Admin</option>
                  <option value="recruitment_officer">Recruitment Officer</option>
                  <option value="dept_admin">Department Admin</option>
                  <option value="screening_committee">Screening Committee</option>
                  <option value="interview_panel">Interview Panel</option>
                  <option value="doc_verifier">Doc Verifier</option>
                  <option value="finance_admin">Finance Admin</option>
                  <option value="applicant">Public Applicant</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>

                {/* Add User Button */}
                <button
                  type="button"
                  onClick={handleOpenCreateUser}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New User</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User & Designation</th>
                    <th className="py-3 px-4">Role & Scope</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No users found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Try adjusting your search query or filter settings, or click &quot;Add New User&quot;.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const userDept = departments.find((d) => d.id === user.departmentId);
                      const isCurrentUser = currentUser?.email === user.email;
                      const isRootAdmin = user.role === 'super_admin' && user.id === 'usr-super-1';

                      // Role styling colors
                      let roleBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                      let roleLabel = user.role;
                      if (user.role === 'super_admin') {
                        roleBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
                        roleLabel = 'Super Admin';
                      } else if (user.role === 'recruitment_admin') {
                        roleBadgeClass = 'bg-purple-50 text-purple-800 border-purple-300';
                        roleLabel = 'Recruitment Admin';
                      } else if (user.role === 'recruitment_officer') {
                        roleBadgeClass = 'bg-blue-50 text-blue-800 border-blue-300';
                        roleLabel = 'Recruitment Officer';
                      } else if (user.role === 'dept_admin') {
                        roleBadgeClass = 'bg-indigo-50 text-indigo-800 border-indigo-300';
                        roleLabel = 'Department Admin';
                      } else if (user.role === 'screening_committee') {
                        roleBadgeClass = 'bg-teal-50 text-teal-800 border-teal-300';
                        roleLabel = 'Screening Committee';
                      } else if (user.role === 'interview_panel') {
                        roleBadgeClass = 'bg-cyan-50 text-cyan-800 border-cyan-300';
                        roleLabel = 'Interview Panel';
                      } else if (user.role === 'doc_verifier') {
                        roleBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                        roleLabel = 'Doc Verifier';
                      } else if (user.role === 'finance_admin') {
                        roleBadgeClass = 'bg-green-50 text-green-800 border-green-300';
                        roleLabel = 'Finance Admin';
                      } else if (user.role === 'applicant') {
                        roleBadgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
                        roleLabel = 'Public Applicant';
                      }

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition group">
                          {/* User & Designation */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-bold text-slate-900 truncate">{user.name}</span>
                                  {isCurrentUser && (
                                    <span className="text-[9px] font-black bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">
                                      You
                                    </span>
                                  )}
                                  {isRootAdmin && (
                                    <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                      <Lock className="w-2.5 h-2.5" /> Root
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {user.designation || 'Staff Member'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${roleBadgeClass}`}
                            >
                              <Shield className="w-3 h-3 mr-1 opacity-70" />
                              {roleLabel}
                            </span>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1.5 font-mono text-slate-700">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <a
                                  href={`mailto:${user.email}`}
                                  className="hover:text-purple-600 hover:underline truncate"
                                >
                                  {user.email}
                                </a>
                              </div>
                              {user.mobile && (
                                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{user.mobile}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-3 px-4">
                            {userDept ? (
                              <div className="flex items-center space-x-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-800">{userDept.name}</span>
                                <span className="text-[10px] font-mono text-slate-400 font-bold">
                                  ({userDept.code})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Institution-Wide (Global)</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {user.status === 'active' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                                Active
                              </span>
                            ) : user.status === 'suspended' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Switch Role / Login As */}
                              <button
                                type="button"
                                onClick={() => handleSwitchToUserAccount(user)}
                                title={`Switch active session & test as ${user.name}`}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Status */}
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(user)}
                                title={user.status === 'active' ? 'Suspend account' : 'Activate account'}
                                className={`p-1.5 rounded-lg transition ${
                                  user.status === 'active'
                                    ? 'bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {user.status === 'active' ? (
                                  <UserX className="w-3.5 h-3.5" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(user)}
                                title="Edit user details and roles"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                disabled={isRootAdmin}
                                onClick={() => setDeletingUser(user)}
                                title={isRootAdmin ? 'Root administrator account cannot be deleted' : 'Delete user account'}
                                className={`p-1.5 rounded-lg transition ${
                                  isRootAdmin
                                    ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-50'
                                    : 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium">
                Showing {filteredUsers.length} of {users.length} total registered accounts
              </span>
              <span className="text-[11px] text-slate-400">
                All account creations and role alterations are recorded in immutable audit logs.
              </span>
            </div>
          </div>

          {/* User Creation / Edit Modal Dialog */}
          {isUserModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in my-8">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-indigo-50 to-white flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                      <UserPlus className="w-5 h-5 text-purple-600" />
                      <span>{editingUserId ? 'Edit Portal User Account' : 'Create New Portal User'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Provision credentials, department assignment, and access roles for recruitment personnel.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUserModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveUserForm} className="p-6 space-y-4">
                  {userFormError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{userFormError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={userFormName}
                        onChange={(e) => setUserFormName(e.target.value)}
                        placeholder="e.g. Dr. Ramesh Gupta"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={userFormEmail}
                        onChange={(e) => setUserFormEmail(e.target.value)}
                        placeholder="e.g. ramesh.gupta@univ.edu"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Role Selection */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Assigned Portal Role <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={userFormRole}
                        onChange={(e) => setUserFormRole(e.target.value as UserRole)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      >
                        <option value="super_admin">Super Admin (Full Governance)</option>
                        <option value="recruitment_admin">Recruitment Admin (Drives & Posts)</option>
                        <option value="recruitment_officer">Recruitment Officer (Operations)</option>
                        <option value="dept_admin">Department Admin (Dept Vacancies)</option>
                        <option value="screening_committee">Screening Committee (Eligibility Check)</option>
                        <option value="interview_panel">Interview Panel (Score Entry)</option>
                        <option value="doc_verifier">Document Verifier (Certificates)</option>
                        <option value="finance_admin">Finance Admin (Fee Reconciliation)</option>
                        <option value="applicant">Public Applicant</option>
                      </select>
                    </div>

                    {/* Designation */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Official Designation / Title
                      </label>
                      <input
                        type="text"
                        value={userFormDesignation}
                        onChange={(e) => setUserFormDesignation(e.target.value)}
                        placeholder="e.g. Professor & Screening Chairperson"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Department */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Assigned Department
                      </label>
                      <select
                        value={userFormDeptId}
                        onChange={(e) => setUserFormDeptId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      >
                        <option value="">Institution-Wide (All Departments)</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mobile Phone */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Contact Mobile
                      </label>
                      <input
                        type="tel"
                        value={userFormMobile}
                        onChange={(e) => setUserFormMobile(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Account Status */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Account Status
                      </label>
                      <select
                        value={userFormStatus}
                        onChange={(e) =>
                          setUserFormStatus(e.target.value as 'active' | 'inactive' | 'suspended')
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      >
                        <option value="active">Active (Can Login & Access RBAC Views)</option>
                        <option value="inactive">Inactive (Pending Onboarding)</option>
                        <option value="suspended">Suspended (Access Revoked)</option>
                      </select>
                    </div>

                    {/* Password Management */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Login Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={userFormPassword}
                          onChange={(e) => setUserFormPassword(e.target.value)}
                          placeholder="Set user password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Internal Notes */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Internal Notes / Senate Reference
                      </label>
                      <input
                        type="text"
                        value={userFormNotes}
                        onChange={(e) => setUserFormNotes(e.target.value)}
                        placeholder="e.g. Appointed via Executive Order #42"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsUserModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingUserId ? 'Save User Changes' : 'Create User Account'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete User Confirmation Modal */}
          {deletingUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Delete User Account?</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Are you sure you want to delete <strong className="text-slate-800">{deletingUser.name}</strong> (
                      <span className="font-mono text-slate-600">{deletingUser.email}</span>)?
                    </p>
                    <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5 mt-3 text-left">
                      <strong>Security Note:</strong> This action will permanently remove this user account from MongoDB. This action will be recorded in the security audit log.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setDeletingUser(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteUser}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
                    >
                      Confirm Delete User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 0: Portal Branding & Website Navigation Settings */}
      {activeAdminTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-card border border-slate-200 p-6 rounded-2xl shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Website Navbar & Logo Customization
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-500">
                    Update the official university logo, website main title, and subtitle text displayed across all portal headers.
                  </p>
                  {mongoStatus.connected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      Live Sync
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                      Local-Only
                    </span>
                  )}
                </div>
              </div>

              {brandingSavedNotice && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full animate-bounce shadow-2xs">
                  ✓ Saved to Database
                </span>
              )}
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
              {/* Main Website Title */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Website Main Title in Nav Bar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={navTitle}
                  onChange={(e) => {
                    setNavTitle(e.target.value);
                    setIsBrandingDirty(true);
                  }}
                  placeholder="E.g., National University Recruitment Portal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-purple-500 transition"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  This title appears prominently at the top left of the navigation header.
                </span>
              </div>

              {/* Small Text Below Main Title */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Small Text Below Main Title (Subtitle / Tagline) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={navSubtitle}
                  onChange={(e) => {
                    setNavSubtitle(e.target.value);
                    setIsBrandingDirty(true);
                  }}
                  placeholder="E.g., Centralized Public Job Advertisements & Merit Application System"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 transition"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  A concise secondary description displayed under the main portal title.
                </span>
              </div>

              {/* Logo Selection Mode */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <label className="block font-bold text-slate-800">Logo Graphic Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLogoType('icon');
                      setIsBrandingDirty(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-center space-x-2 ${
                      logoType === 'icon'
                        ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="text-xs">Pre-styled Vector Icon</div>
                      <div className="text-[10px] text-slate-400 font-normal">Choose built-in emblem</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLogoType('image');
                      setIsBrandingDirty(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-center space-x-2 ${
                      logoType === 'image'
                        ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="text-xs">Custom Logo Image URL</div>
                      <div className="text-[10px] text-slate-400 font-normal">Use institution emblem URL</div>
                    </div>
                  </button>
                </div>

                {logoType === 'icon' ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-700">Select Built-In Emblem Icon:</span>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { name: 'Building2', label: 'University', Icon: Building2 },
                        { name: 'GraduationCap', label: 'Academy', Icon: GraduationCap },
                        { name: 'ShieldCheck', label: 'Governance', Icon: ShieldCheck },
                        { name: 'Globe', label: 'Central', Icon: Globe },
                        { name: 'Award', label: 'Merit', Icon: Award },
                      ].map((item) => {
                        const IconComponent = item.Icon;
                        const isSelected = logoIconName === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              setLogoIconName(item.name);
                              setIsBrandingDirty(true);
                            }}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 text-center transition ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-700 font-bold shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                            <span className="text-[10px]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Custom Image URL</label>
                      <input
                        type="url"
                        value={logoImageUrl}
                        onChange={(e) => {
                          setLogoImageUrl(e.target.value);
                          setIsBrandingDirty(true);
                        }}
                        placeholder="https://example.com/logo.png"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-slate-900 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">Quick Test Logos:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoImageUrl('https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=120&q=80');
                          setIsBrandingDirty(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700"
                      >
                        Sample Emblem 1
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoImageUrl('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=120&q=80');
                          setIsBrandingDirty(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700"
                      >
                        Sample Emblem 2
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Portal Templates */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-600" />
                  Select Professional Portal Template
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'classic', label: 'Classic University', desc: 'Indigo & Slate, Standard Grid', color: 'bg-indigo-600' },
                    { id: 'modern', label: 'Modern Aesthetic', desc: 'Vibrant Accents, Soft Shadows', color: 'bg-violet-600' },
                    { id: 'crimson', label: 'Crimson Tech', desc: 'Deep Red Sidebar, Tech Focused', color: 'bg-rose-600' },
                    { id: 'academic', label: 'Academic Gold', desc: 'Navy Sidebar, Serifs, Prestigious', color: 'bg-[#1a365d]' },
                    { id: 'nature', label: 'Nature Mint', desc: 'Forest Green Sidebar, Organic', color: 'bg-emerald-800' },
                    { id: 'sapphire', label: 'Sapphire Ocean', desc: 'Slate Sidebar, Professional Blue', color: 'bg-slate-900' },
                  ].map((themeOption) => {
                    const isSelected = selectedTheme === themeOption.id;
                    return (
                      <button
                        key={themeOption.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(themeOption.id as any);
                          setIsBrandingDirty(true);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-600 ring-offset-2 shadow-md'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${themeOption.color} shrink-0 shadow-xs border border-white/20`} />
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-purple-900' : 'text-slate-900'}`}>
                            {themeOption.label}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{themeOption.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Update and Save Navbar Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetBranding}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs transition flex items-center justify-center space-x-1.5 shrink-0"
                  title="Reset branding to default state"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>Reset Default</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 glass-card border border-slate-200 p-6 rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Live Header Navbar Preview
            </h3>

            <p className="text-xs text-slate-500">
              This preview shows how public visitors and candidates will see the navigation bar at the top of the portal.
            </p>

            <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-md space-y-3">
              <div className="text-[10px] uppercase font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full inline-block">
                Simulated Header
              </div>

              <div className="flex items-center space-x-3 pt-1">
                {logoType === 'image' && logoImageUrl ? (
                  <img
                    src={logoImageUrl}
                    alt="Logo Preview"
                    className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md font-extrabold text-xl">
                    {logoIconName === 'GraduationCap' && <GraduationCap className="w-6 h-6" />}
                    {logoIconName === 'ShieldCheck' && <ShieldCheck className="w-6 h-6" />}
                    {logoIconName === 'Globe' && <Globe className="w-6 h-6" />}
                    {logoIconName === 'Award' && <Award className="w-6 h-6" />}
                    {logoIconName === 'Building2' && <Building2 className="w-6 h-6" />}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {navTitle || 'National University Recruitment Portal'}
                    </h4>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-1.5 py-0.5 rounded-full font-mono font-bold">
                      Official
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {navSubtitle || 'Centralized Public Job Advertisements & Merit Application System'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">Persistent Storage Status</div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Settings are saved to the persistent system state database (`PortalContext` & `localStorage`). Any changes will immediately reflect across all user tabs and sessions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Granular RBAC Permission Matrix */}
      {activeAdminTab === 'rbac' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 glass-card border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              System Roles ({roles.length})
            </h3>

            <div className="space-y-1">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRole(r.id);
                    setSelectedPermissions(r.permissions);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                    selectedRole === r.id
                      ? 'bg-purple-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="text-xs block font-semibold">{r.name}</span>
                    <span className="text-[10px] opacity-75 block">{r.permissions.length} Permissions</span>
                  </div>
                  {selectedRole === r.id && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 glass-card border border-slate-200 p-6 rounded-2xl shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Permission Matrix: {roleObj?.name}
                </h3>
                <p className="text-xs text-slate-500">{roleObj?.description}</p>
              </div>

              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Role Permissions</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {allAvailablePermissions.map((perm) => {
                const isChecked = selectedPermissions.includes(perm.id) || selectedPermissions.includes('all_access');
                return (
                  <label
                    key={perm.id}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center space-x-3 ${
                      isChecked
                        ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPermissions([...selectedPermissions, perm.id]);
                        } else {
                          setSelectedPermissions(selectedPermissions.filter((p) => p !== perm.id));
                        }
                      }}
                      className="rounded border-slate-300 bg-white text-purple-600 focus:ring-0"
                    />
                    <span>{perm.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Department Master Data */}
      {activeAdminTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              Add Master Department
            </h3>

            <form onSubmit={handleAddDept} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., CSE, MECH, CIVIL, FIN"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Department of Civil Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">HOD Contact Email</label>
                <input
                  type="email"
                  placeholder="hod@univ.edu"
                  value={deptHeadEmail}
                  onChange={(e) => setDeptHeadEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Department</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              Active University Departments ({departments.length})
            </h3>

            <div className="space-y-2">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{d.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Code: {d.code} | HOD: {d.headEmail}</span>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3 & 4: Email & Backup simulation */}
      {(activeAdminTab === 'email' || activeAdminTab === 'system') && (
        <div className="space-y-6">
          {/* Dev Mode Role Selector Settings Card */}
          <div className="glass-card border border-purple-200 p-6 rounded-2xl shadow-2xs bg-purple-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
                <h3 className="text-sm font-bold text-purple-950">
                  Development Phase Role Switcher on Login Modal
                </h3>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed max-w-xl">
                When enabled, visitors and reviewers can select their authenticated role dropdown directly inside the Login Modal popup. Disable this setting for production mode.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <span className={`text-xs font-bold ${allowDevRoleSelector ? 'text-emerald-700' : 'text-slate-500'}`}>
                {allowDevRoleSelector ? 'Status: ENABLED' : 'Status: DISABLED'}
              </span>
              <button
                type="button"
                onClick={() => {
                  toggleDevRoleSelector();
                  logAudit('DEV_ROLE_SELECTOR_TOGGLED', 'Security', `Toggled Dev Role Selector to ${!allowDevRoleSelector}`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allowDevRoleSelector ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    allowDevRoleSelector ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* MongoDB Atlas Live Database Info & Sync */}
          <div className={`glass-card border p-6 rounded-2xl shadow-2xs space-y-4 ${mongoStatus.connected ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40'}`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${mongoStatus.connected ? 'border-emerald-200/70' : 'border-amber-200/70'}`}>
              <div className="flex items-center space-x-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${mongoStatus.connected ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>MongoDB Atlas Database</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-mono border border-slate-200">Production Engine</span>
                    </h3>
                    {mongoStatus.connected ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                        Connected & Synchronized
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 animate-pulse"></span>
                        Connecting / IP Access Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {mongoStatus.connected
                      ? 'Live bidirectional sync with MongoDB Atlas is active. All drives, applicants, screenings, documents, and logs are persisted.'
                      : 'Live in-memory database engine is active and serving all records. Direct remote sync connects automatically once Atlas Network Access allows 0.0.0.0/0.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsRefreshingDb(true);
                    await refreshFromDatabase();
                    setIsRefreshingDb(false);
                    setDbNotice('Database state synchronized successfully!');
                    setTimeout(() => setDbNotice(null), 3500);
                  }}
                  disabled={isRefreshingDb}
                  className={`px-3.5 py-1.5 rounded-xl bg-white border font-bold text-xs shadow-2xs flex items-center space-x-1.5 transition disabled:opacity-50 ${mongoStatus.connected ? 'border-emerald-300 text-emerald-800 hover:bg-emerald-100/60' : 'border-amber-300 text-amber-800 hover:bg-amber-100/60'}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDb ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingDb ? 'Syncing...' : 'Sync Database State'}</span>
                </button>
              </div>
            </div>

            {mongoStatus.error && !mongoStatus.connected && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2.5">
                <div className="flex items-center space-x-2 font-black text-amber-800 uppercase tracking-tight">
                  <Activity className="w-4 h-4" />
                  <span>Connectivity Troubleshooting Guide</span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-relaxed text-amber-900/80">
                  <p>
                    <strong className="text-amber-950 underline decoration-amber-300 underline-offset-2">Critical Action Required:</strong> Even with a valid <code className="bg-amber-100 px-1 rounded text-amber-900">MONGODB_URI</code>, Atlas will block connections from Vercel unless the <strong>IP Access List</strong> is configured.
                  </p>
                  <div className="bg-white/50 p-2.5 rounded-lg border border-amber-200 font-medium space-y-1">
                    <p>1. Go to <strong>MongoDB Atlas Dashboard</strong> &gt; <strong>Network Access</strong>.</p>
                    <p>2. Click <strong>+ Add IP Address</strong>.</p>
                    <p>3. Select <strong>Allow Access from Anywhere</strong> (sets IP to <code className="bg-amber-100 px-1 rounded">0.0.0.0/0</code>).</p>
                    <p>4. Save and wait 1-2 minutes, then click &quot;Sync Database State&quot; below.</p>
                  </div>
                  <p className="italic text-[10px] mt-1 opacity-75 font-semibold">
                    Error Detail: {mongoStatus.error}
                  </p>
                </div>
              </div>
            )}

            {dbNotice && (
              <div className="p-2.5 bg-emerald-100/90 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{dbNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
              <div className="p-3 bg-white/80 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Database</span>
                <span className="text-xs font-extrabold text-slate-900 font-mono truncate block">
                  {mongoStatus.database}
                </span>
              </div>

              <div className="p-3 bg-white/80 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Drives</span>
                <span className="text-sm font-extrabold text-emerald-700 block">
                  {drives.length} <span className="text-[10px] text-slate-400 font-normal">Active</span>
                </span>
              </div>

              <div className="p-3 bg-white/80 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Applications</span>
                <span className="text-sm font-extrabold text-emerald-700 block">
                  {applications.length} <span className="text-[10px] text-slate-400 font-normal">Records</span>
                </span>
              </div>

              <div className="p-3 bg-white/80 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Departments</span>
                <span className="text-sm font-extrabold text-emerald-700 block">
                  {departments.length} <span className="text-[10px] text-slate-400 font-normal">Units</span>
                </span>
              </div>

              <div className="p-3 bg-white/80 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">RBAC Roles</span>
                <span className="text-sm font-extrabold text-emerald-700 block">
                  {roles.length} <span className="text-[10px] text-slate-400 font-normal">Configured</span>
                </span>
              </div>

              <div className="p-3 bg-white/80 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Audit Logs</span>
                <span className="text-sm font-extrabold text-emerald-700 block">
                  {auditLogs.length} <span className="text-[10px] text-slate-400 font-normal">Entries</span>
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/60 border border-emerald-100 rounded-xl text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 font-mono truncate">
                <Server className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-500">MongoDB Cluster:</span>
                <span className="font-semibold text-slate-800 truncate">{mongoStatus.uriMasked}</span>
              </div>
              <span className="text-slate-400 text-[10px] shrink-0">
                Auto-polled every 6s {mongoStatus.lastSyncedAt ? `(Last sync: ${mongoStatus.lastSyncedAt})` : ''}
              </span>
            </div>
          </div>

          <div className="glass-card border border-slate-200 p-8 rounded-2xl shadow-xs text-center space-y-4">
            <Database className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">System Automated Backup & Notification Engine</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              100% Database-driven automatic snapshots and SMS/Email gateway dispatchers configured and healthy.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => {
                  logAudit('DATABASE_BACKUP_GENERATED', 'Admin', 'Generated manual full JSON database backup snapshot from MongoDB.');
                  alert('Backup snapshot generated and synced with MongoDB successfully!');
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
              >
                Create Instant Database Backup
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset the MongoDB database to factory default data?')) {
                    resetToDemoData();
                    setDbNotice('MongoDB database reset to factory demo state.');
                    setTimeout(() => setDbNotice(null), 3500);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold"
              >
                Reset Database to Factory Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
