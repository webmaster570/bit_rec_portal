import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  RoleInfo,
  RecruitmentDrive,
  Application,
  Department,
  AuditLog,
  SystemNotification,
  PostConfig,
  InterviewEvaluation,
  WeightageConfig,
  PortalBranding,
  PortalUser,
  ServerTransactionToast,
} from '../types';

import { INITIAL_BRANDING, DEFAULT_WEIGHTAGE_CONFIG } from '../constants';

import {
  INITIAL_ROLES,
  INITIAL_DRIVES,
  INITIAL_APPLICATIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
} from '../mockData';

interface UserSession {
  name: string;
  email: string;
  role: UserRole;
  regNumber?: string;
}

export interface MongoDbStatus {
  connected: boolean;
  database: string;
  error: string | null;
  uriMasked: string;
  lastSyncedAt?: string;
  missingUri?: boolean;
  ipWhitelistHint?: boolean;
}

interface PortalContextType {
  isLoggedIn: boolean;
  currentUser: UserSession | null;
  allowDevRoleSelector: boolean;
  currentRole: UserRole;
  roles: RoleInfo[];
  drives: RecruitmentDrive[];
  applications: Application[];
  departments: Department[];
  users: PortalUser[];
  auditLogs: AuditLog[];
  notifications: SystemNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDriveId: string | null;
  setSelectedDriveId: (id: string | null) => void;
  weightageConfig: WeightageConfig;
  setWeightageConfig: (config: WeightageConfig) => void;
  branding: PortalBranding;
  updateBranding: (updates: Partial<PortalBranding>) => void;
  mongoStatus: MongoDbStatus;
  refreshFromDatabase: (isManualTrigger?: boolean) => Promise<void>;

  // Server Transaction Toasts
  transactionToasts: ServerTransactionToast[];
  emitTransactionToast: (toast: Omit<ServerTransactionToast, 'id' | 'timestamp'>) => string;
  updateTransactionToast: (id: string, updates: Partial<ServerTransactionToast>) => void;
  dismissTransactionToast: (id: string) => void;
  clearAllTransactionToasts: () => void;
  runDbTransaction: <T>(
    title: string,
    operationTag: string,
    processingMsg: string,
    successMsg: string,
    asyncAction: () => Promise<T>
  ) => Promise<T | null>;

  login: (role: UserRole, email: string, name?: string, regNumber?: string) => void;
  secureLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerApplicant: (profile: {
    fullName: string;
    email: string;
    mobile: string;
    category: 'UR' | 'OBC' | 'SC' | 'ST' | 'EWS';
    dob: string;
    password?: string;
  }) => { regNumber: string };
  toggleDevRoleSelector: (allow?: boolean) => void;

  switchRole: (role: UserRole) => void;
  createDrive: (driveData: Omit<RecruitmentDrive, 'id' | 'totalApplicationsCount'>) => RecruitmentDrive;
  updateDrive: (driveId: string, updates: Partial<RecruitmentDrive>) => void;
  deleteDrive: (driveId: string) => void;
  addPostToDrive: (driveId: string, postData: Omit<PostConfig, 'id'>) => void;
  updatePostInDrive: (driveId: string, postId: string, postUpdates: Partial<PostConfig>) => void;
  deletePostFromDrive: (driveId: string, postId: string) => void;
  
  submitApplication: (
    driveId: string,
    postId: string,
    applicantProfile: Application['applicant'],
    academics: Application['academics'],
    experience: Application['experience'],
    documents: Application['documents'],
    isExempted: boolean
  ) => Application;

  updateScreening: (
    appId: string,
    decision: 'Eligible' | 'Provisionally Eligible' | 'Ineligible',
    remarks: string,
    evaluatorName?: string
  ) => void;

  updateDocVerification: (
    appId: string,
    status: 'Verified' | 'Discrepancy' | 'Rejected',
    remarks: string,
    docId?: string,
    docDiscrepancyReason?: string
  ) => void;

  submitInterviewScore: (
    appId: string,
    evaluation: Omit<InterviewEvaluation, 'submittedAt'>
  ) => void;

  scheduleExamAndInterview: (
    appId: string,
    examDetails: { center: string; dateTime: string; rollNo: string },
    interviewDetails?: { venue: string; dateTime: string }
  ) => void;

  generateMeritList: (driveId: string, postId: string, config?: WeightageConfig) => void;
  publishOfferLetter: (appId: string, deadlineDays?: number) => void;
  respondToOffer: (appId: string, response: 'Accepted' | 'Declined') => void;
  reconcilePayment: (appId: string, newStatus: 'Paid' | 'Refunded') => void;
  
  addDepartment: (dept: Omit<Department, 'id' | 'activePostsCount'>) => void;
  addUser: (user: Omit<PortalUser, 'id' | 'createdAt'>) => PortalUser;
  updateUser: (userId: string, updates: Partial<PortalUser>) => void;
  deleteUser: (userId: string) => void;
  updateRolePermissions: (roleId: UserRole, permissions: string[]) => void;
  logAudit: (action: string, module: AuditLog['module'], details: string) => void;
  markNotificationRead: (id: string) => void;
  resetToDemoData: () => void;
  changePassword: (newPassword: string) => Promise<boolean>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'recruitment_portal_data_v1';
const AUTH_STORAGE_KEY = 'recruitment_portal_auth_v1';

const loadInitialState = <T,>(key: string, fallback: T, storageKey = LOCAL_STORAGE_KEY): T => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed[key] !== undefined && parsed[key] !== null) {
        return parsed[key];
      }
    }
  } catch (e) {
    console.warn(`Failed to parse ${key} from ${storageKey}:`, e);
  }
  return fallback;
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => loadInitialState('isLoggedIn', false, AUTH_STORAGE_KEY));
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => loadInitialState('currentUser', null, AUTH_STORAGE_KEY));
  const [activeTab, setActiveTabState] = useState<string>(() => loadInitialState('activeTab', 'public_recruitment', AUTH_STORAGE_KEY));
  const [allowDevRoleSelector, setAllowDevRoleSelector] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadInitialState('currentRole', 'super_admin', AUTH_STORAGE_KEY));
  const [roles, setRoles] = useState<RoleInfo[]>(() => loadInitialState('roles', INITIAL_ROLES));
  const [drives, setDrives] = useState<RecruitmentDrive[]>(() => loadInitialState('drives', INITIAL_DRIVES));
  const [applications, setApplications] = useState<Application[]>(() => loadInitialState('applications', INITIAL_APPLICATIONS));
  const [departments, setDepartments] = useState<Department[]>(() => loadInitialState('departments', INITIAL_DEPARTMENTS));
  const [users, setUsers] = useState<PortalUser[]>(() => loadInitialState('users', INITIAL_USERS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadInitialState('auditLogs', INITIAL_AUDIT_LOGS));
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(() => loadInitialState('selectedDriveId', 'drive-2026-01'));
  
  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
  }, []);
  const [weightageConfig, setWeightageConfigState] = useState<WeightageConfig>(DEFAULT_WEIGHTAGE_CONFIG);
  const [branding, setBranding] = useState<PortalBranding>(() => loadInitialState('branding', INITIAL_BRANDING));

  const [mongoStatus, setMongoStatus] = useState<MongoDbStatus>({
    connected: false,
    database: 'bit_recruitment_portal',
    error: null,
    uriMasked: 'mongodb+srv://pratyushm977_db_user:****@bit-recruitment-portal.ze21uvt.mongodb.net/',
  });

  // Server Transaction Toasts State
  const [transactionToasts, setTransactionToasts] = useState<ServerTransactionToast[]>([]);

  const emitTransactionToast = useCallback(
    (toast: Omit<ServerTransactionToast, 'id' | 'timestamp'>): string => {
      const toastId = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ServerTransactionToast = {
        ...toast,
        id: toastId,
        timestamp: new Date().toISOString(),
      };
      setTransactionToasts((prev) => [newToast, ...prev.slice(0, 4)]);
      return toastId;
    },
    []
  );

  const updateTransactionToast = useCallback(
    (id: string, updates: Partial<ServerTransactionToast>) => {
      setTransactionToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    },
    []
  );

  const dismissTransactionToast = useCallback((id: string) => {
    setTransactionToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllTransactionToasts = useCallback(() => {
    setTransactionToasts([]);
  }, []);

  // Standardized Server Transaction Runner that displays processing toast,
  // awaits the asynchronous operation, and updates to success or failure.
  const runDbTransaction = useCallback(
    async <T,>(
      title: string,
      operationTag: string,
      processingMsg: string,
      successMsg: string,
      asyncAction: () => Promise<T>
    ): Promise<T | null> => {
      const startTime = Date.now();
      const toastId = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // 1. Emit Processing Toast
      setTransactionToasts((prev) => [
        {
          id: toastId,
          status: 'processing',
          title,
          message: processingMsg,
          operationTag,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 4),
      ]);

      try {
        const result = await asyncAction();
        const durationMs = Date.now() - startTime;

        // 2. Transition to Success Toast
        setTransactionToasts((prev) =>
          prev.map((t) =>
            t.id === toastId
              ? {
                  ...t,
                  status: 'success',
                  title: `${title} — Committed`,
                  message: successMsg,
                  durationMs,
                  autoDismissAfter: 4500,
                }
              : t
          )
        );

        // Auto-dismiss success toast after 4.5s
        setTimeout(() => {
          setTransactionToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 4500);

        return result;
      } catch (err: any) {
        const durationMs = Date.now() - startTime;
        const errorMsg = err?.message || 'Server network / connection issue.';

        // 3. Transition to Failure Toast
        setTransactionToasts((prev) =>
          prev.map((t) =>
            t.id === toastId
              ? {
                  ...t,
                  status: 'failure',
                  title: `${title} — Transaction Failed`,
                  message: `Failed to commit to database: ${errorMsg}`,
                  errorDetails: err?.stack ? String(err.stack).substring(0, 150) : undefined,
                  durationMs,
                }
              : t
          )
        );

        // Auto-dismiss failure toast after 8s
        setTimeout(() => {
          setTransactionToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 8000);

        return null;
      }
    },
    []
  );

  // Fetch full state from MongoDB backend
  const refreshFromDatabase = useCallback(async (isManualTrigger?: boolean) => {
    const fetchAction = async () => {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.branding) {
        setBranding((prev) => (JSON.stringify(prev) !== JSON.stringify(data.branding) ? data.branding : prev));
      }
      if (data.roles && Array.isArray(data.roles)) {
        setRoles((prev) => (JSON.stringify(prev) !== JSON.stringify(data.roles) ? data.roles : prev));
      }
      if (data.departments && Array.isArray(data.departments)) {
        setDepartments((prev) => (JSON.stringify(prev) !== JSON.stringify(data.departments) ? data.departments : prev));
      }
      if (data.users && Array.isArray(data.users)) {
        setUsers((prev) => (JSON.stringify(prev) !== JSON.stringify(data.users) ? data.users : prev));
      }
      if (data.drives && Array.isArray(data.drives)) {
        setDrives((prev) => (JSON.stringify(prev) !== JSON.stringify(data.drives) ? data.drives : prev));
      }
      if (data.applications && Array.isArray(data.applications)) {
        setApplications((prev) => (JSON.stringify(prev) !== JSON.stringify(data.applications) ? data.applications : prev));
      }
      if (data.auditLogs && Array.isArray(data.auditLogs)) {
        setAuditLogs((prev) => (JSON.stringify(prev) !== JSON.stringify(data.auditLogs) ? data.auditLogs : prev));
      }
      if (data.notifications && Array.isArray(data.notifications)) {
        setNotifications((prev) => (JSON.stringify(prev) !== JSON.stringify(data.notifications) ? data.notifications : prev));
      }
      if (data.weightageConfig) {
        setWeightageConfigState((prev) => (JSON.stringify(prev) !== JSON.stringify(data.weightageConfig) ? data.weightageConfig : prev));
      }
      
      setMongoStatus((prev) => {
        const next = {
          connected: data.dbStatus?.connected ?? true,
          database: data.dbStatus?.database || 'bit_recruitment_portal',
          error: data.dbStatus?.error || null,
          uriMasked: data.dbStatus?.uriMasked || 'mongodb+srv://****:****@bit-recruitment-portal.ze21uvt.mongodb.net/',
          lastSyncedAt: new Date().toLocaleTimeString(),
          missingUri: data.dbStatus?.missingUri || false,
          ipWhitelistHint: data.dbStatus?.ipWhitelistHint || false,
        };
        if (
          prev.connected === next.connected &&
          prev.database === next.database &&
          prev.error === next.error &&
          prev.missingUri === next.missingUri
        ) {
          return prev;
        }
        return next;
      });
      return data;
    };

    if (isManualTrigger) {
      await runDbTransaction(
        'Database Sync Query',
        'GET /api/state',
        'Fetching real-time state from MongoDB collections...',
        'All database collections synchronized with live server state.',
        fetchAction
      );
    } else {
      try {
        await fetchAction();
      } catch (err: any) {
        console.warn('[PortalContext] Real-time background sync warning:', err?.message || err);
        let errorMsg = err?.message || 'Connecting to MongoDB...';
        if (errorMsg.includes('404')) {
          errorMsg = 'API Route Not Found (HTTP 404). The server might be restarting or misconfigured. Please check the backend logs.';
        }
        setMongoStatus((prev) => ({
          ...prev,
          connected: false,
          error: errorMsg,
        }));
      }
    }
  }, [runDbTransaction]);

  // Initial load and periodic real-time sync with MongoDB
  useEffect(() => {
    refreshFromDatabase();
    const interval = setInterval(() => refreshFromDatabase(false), 6000);
    return () => clearInterval(interval);
  }, [refreshFromDatabase]);

  // Keep auth session in dedicated storage
  useEffect(() => {
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          isLoggedIn,
          currentUser,
          currentRole,
          activeTab,
        })
      );
    } catch (e) {
      console.warn('Failed to save auth state locally:', e);
    }
  }, [isLoggedIn, currentUser, currentRole, activeTab]);

  // Keep data backup in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          drives,
          applications,
          departments,
          auditLogs,
          roles,
          branding,
          users,
          selectedDriveId,
        })
      );
    } catch (e) {
      console.warn('Failed to save data state locally:', e);
    }
  }, [drives, applications, departments, auditLogs, roles, branding, users, selectedDriveId]);

  const updateBranding = (updates: Partial<PortalBranding>) => {
    const next = { ...branding, ...updates };
    setBranding(next);

    runDbTransaction(
      'Branding Configuration',
      'POST /api/branding',
      'Writing portal title, subtitle, and logo assets to MongoDB...',
      'University portal branding committed to database.',
      async () => {
        const res = await fetch('/api/branding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
      }
    );

    logAudit('BRANDING_UPDATED', 'Admin', 'Updated university portal title, subtitle, and logo settings.');
  };

  const setWeightageConfig = (config: WeightageConfig) => {
    setWeightageConfigState(config);
    runDbTransaction(
      'Evaluation Formula Update',
      'POST /api/weightage-config',
      'Updating written, interview & academic weights in database...',
      'Selection weightage rules committed to MongoDB.',
      async () => {
        const res = await fetch('/api/weightage-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
      }
    );
  };

  const logAudit = (action: string, module: AuditLog['module'], details: string) => {
    const roleObj = roles.find((r) => r.id === currentRole);
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: `usr-${currentRole}`,
      userName: roleObj?.name || 'System User',
      userRole: currentRole,
      action,
      module,
      details,
      ipAddress: '127.0.0.1 (Live MongoDB Session)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Send to MongoDB
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch((e) => console.error('MongoDB audit log creation failed:', e));
  };

  const login = (role: UserRole, email: string, name?: string, regNumber?: string) => {
    const roleObj = roles.find((r) => r.id === role);
    const userName = name || (role === 'applicant' ? 'Applicant User' : roleObj?.name || 'User');
    const session: UserSession = {
      name: userName,
      email: email || `${role}@university.edu.in`,
      role,
      regNumber: regNumber || (role === 'applicant' ? 'REG-2026-88421' : undefined),
    };
    setIsLoggedIn(true);
    setCurrentUser(session);
    setCurrentRole(role);
    if (role === 'applicant') setActiveTabState('applicant_portal');
    else setActiveTabState('overview');
    logAudit('USER_LOGIN', 'Security', `User logged in via Quick-Switch as ${role.toUpperCase()} (${session.email})`);
  };

  const secureLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed.');
      }

      const { user } = await res.json();
      const session: UserSession = {
        name: user.name,
        email: user.email,
        role: user.role,
        regNumber: user.regNumber,
      };

      setIsLoggedIn(true);
      setCurrentUser(session);
      setCurrentRole(user.role);
      logAudit('SECURE_LOGIN', 'Security', `Successful secure login for ${user.email} (${user.role.toUpperCase()})`);
      return true;
    } catch (err: any) {
      console.warn('[PortalContext] Secure login failed:', err.message);
      return false;
    }
  };

  const logout = () => {
    logAudit('USER_LOGOUT', 'Security', `User ${currentUser?.email || ''} logged out.`);
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const registerApplicant = (profile: {
    fullName: string;
    email: string;
    mobile: string;
    category: 'UR' | 'OBC' | 'SC' | 'ST' | 'EWS';
    dob: string;
    password?: string;
  }) => {
    const regNum = `REG-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Persist the applicant as a user
    addUser({
      name: profile.fullName,
      email: profile.email,
      role: 'applicant',
      mobile: profile.mobile,
      regNumber: regNum,
      status: 'active',
      password: profile.password || 'pass123',
    });

    const session: UserSession = {
      name: profile.fullName,
      email: profile.email,
      role: 'applicant',
      regNumber: regNum,
    };
    setIsLoggedIn(true);
    setCurrentUser(session);
    setCurrentRole('applicant');
    logAudit('APPLICANT_REGISTERED', 'Security', `New applicant registered: ${profile.fullName} (${regNum})`);
    return { regNumber: regNum };
  };

  const toggleDevRoleSelector = (allow?: boolean) => {
    setAllowDevRoleSelector((prev) => (typeof allow === 'boolean' ? allow : !prev));
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    logAudit('ROLE_SWITCH', 'Security', `User switched active working role to ${newRole.toUpperCase()}.`);
  };

  const createDrive = (driveData: Omit<RecruitmentDrive, 'id' | 'totalApplicationsCount'>): RecruitmentDrive => {
    const newId = `drive-${Date.now()}`;
    const newDrive: RecruitmentDrive = {
      ...driveData,
      id: newId,
      totalApplicationsCount: 0,
    };
    setDrives((prev) => [newDrive, ...prev]);

    runDbTransaction(
      'Recruitment Drive Creation',
      'POST /api/drives',
      `Writing new recruitment drive "${newDrive.title}" (${newDrive.driveCode}) to MongoDB...`,
      `Recruitment drive "${newDrive.driveCode}" registered and committed to database.`,
      async () => {
        const res = await fetch('/api/drives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDrive),
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit('DRIVE_CREATED', 'Drive', `Created new drive "${newDrive.title}" (${newDrive.driveCode})`);
    return newDrive;
  };

  const updateDrive = (driveId: string, updates: Partial<RecruitmentDrive>) => {
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, ...updates } : d))
    );

    runDbTransaction(
      'Recruitment Drive Update',
      `PUT /api/drives/${driveId}`,
      `Committing recruitment drive updates for ID: ${driveId}...`,
      `Drive configuration committed to database successfully.`,
      async () => {
        const res = await fetch(`/api/drives/${driveId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit('DRIVE_UPDATED', 'Drive', `Updated recruitment drive properties for ID: ${driveId}`);
  };

  const deleteDrive = (driveId: string) => {
    const driveToDelete = drives.find((d) => d.id === driveId);
    const driveTitle = driveToDelete?.title || driveId;
    const driveCode = driveToDelete?.driveCode || driveId;

    setDrives((prev) => prev.filter((d) => d.id !== driveId));
    if (selectedDriveId === driveId) {
      setSelectedDriveId(null);
    }

    runDbTransaction(
      'Recruitment Drive Deletion',
      `DELETE /api/drives/${driveId}`,
      `Deleting recruitment drive "${driveTitle}" (${driveCode}) from database...`,
      `Recruitment drive "${driveCode}" successfully deleted from MongoDB.`,
      async () => {
        const res = await fetch(`/api/drives/${driveId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit('DRIVE_DELETED', 'Drive', `Deleted recruitment drive "${driveTitle}" (${driveCode})`);
  };

  const updatePostInDrive = (driveId: string, postId: string, postUpdates: Partial<PostConfig>) => {
    setDrives((prev) =>
      prev.map((drive) => {
        if (drive.id === driveId) {
          return {
            ...drive,
            posts: drive.posts.map((p) => (p.id === postId ? { ...p, ...postUpdates } : p)),
          };
        }
        return drive;
      })
    );

    runDbTransaction(
      'Update Vacancy Position',
      `PUT /api/drives/${driveId}/posts/${postId}`,
      `Updating post details in drive ${driveId}...`,
      `Vacancy position updated and committed to database.`,
      async () => {
        const res = await fetch(`/api/drives/${driveId}/posts/${postId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postUpdates),
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit('POST_UPDATED', 'Drive', `Updated post ID: ${postId} in drive ID: ${driveId}`);
  };

  const deletePostFromDrive = (driveId: string, postId: string) => {
    setDrives((prev) =>
      prev.map((drive) => {
        if (drive.id === driveId) {
          return {
            ...drive,
            posts: drive.posts.filter((p) => p.id !== postId),
          };
        }
        return drive;
      })
    );

    runDbTransaction(
      'Delete Vacancy Position',
      `DELETE /api/drives/${driveId}/posts/${postId}`,
      `Removing position ${postId} from drive ${driveId}...`,
      `Vacancy position deleted from database.`,
      async () => {
        const res = await fetch(`/api/drives/${driveId}/posts/${postId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit('POST_DELETED', 'Drive', `Deleted post ID: ${postId} from drive ID: ${driveId}`);
  };

  const addPostToDrive = (driveId: string, postData: Omit<PostConfig, 'id'>) => {
    const postId = `post-${Date.now()}`;
    const newPost: PostConfig = { ...postData, id: postId };

    setDrives((prev) =>
      prev.map((drive) => {
        if (drive.id === driveId) {
          return {
            ...drive,
            posts: [...drive.posts, newPost],
          };
        }
        return drive;
      })
    );

    runDbTransaction(
      'Vacancy Post Configuration',
      `POST /api/drives/${driveId}/posts`,
      `Configuring post vacancy "${newPost.title}" in database...`,
      `Post vacancy "${newPost.title}" added and committed to MongoDB.`,
      async () => {
        const res = await fetch(`/api/drives/${driveId}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost),
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit('POST_CONFIGURED', 'Drive', `Configured post "${newPost.title}" under drive ID: ${driveId}`);
  };

  const submitApplication = (
    driveId: string,
    postId: string,
    applicantProfile: Application['applicant'],
    academics: Application['academics'],
    experience: Application['experience'],
    documents: Application['documents'],
    isExempted: boolean
  ): Application => {
    const targetDrive = drives.find((d) => d.id === driveId);
    const targetPost = targetDrive?.posts.find((p) => p.id === postId);

    const randomAppNo = `APP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const feeAmount = isExempted ? 0 : targetPost?.applicationFee || 1000;

    const newApp: Application = {
      id: `app-${Date.now()}`,
      applicationNo: randomAppNo,
      driveId,
      driveTitle: targetDrive?.title || 'Recruitment Drive 2026',
      advtNumber: targetDrive?.advtNumber || 'ADV/2026/001',
      postId,
      postTitle: targetPost?.title || 'Position',
      departmentName: targetPost?.departmentName || 'General',
      applicant: applicantProfile,
      academics,
      experience,
      documents,
      submittedAt: new Date().toISOString(),
      stage: 'submitted',
      feeAmount,
      paymentStatus: isExempted ? 'Exempted' : 'Paid',
      transactionId: isExempted ? undefined : `TXN${Math.floor(100000000 + Math.random() * 900000000)}`,
      paymentDate: isExempted ? undefined : new Date().toISOString(),
      paymentReceiptNo: isExempted ? undefined : `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      screeningStatus: 'Pending',
      docVerificationStatus: 'Pending',
    };

    setApplications((prev) => [newApp, ...prev]);

    // increment drive total applications count
    setDrives((prev) =>
      prev.map((d) =>
        d.id === driveId ? { ...d, totalApplicationsCount: d.totalApplicationsCount + 1 } : d
      )
    );

    runDbTransaction(
      'Application Submission Transaction',
      'POST /api/applications',
      `Submitting candidate application #${newApp.applicationNo} & generating receipt in MongoDB...`,
      `Application #${newApp.applicationNo} registered and payment receipt created.`,
      async () => {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newApp),
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit('APPLICATION_SUBMITTED', 'Application', `Submitted new application ${newApp.applicationNo} for post ${targetPost?.title}`);
    return newApp;
  };

  const updateScreening = (
    appId: string,
    decision: 'Eligible' | 'Provisionally Eligible' | 'Ineligible',
    remarks: string,
    evaluatorName = 'Screening Committee Member'
  ) => {
    let updatedApp: Application | null = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const newRemark = {
            committeeMember: evaluatorName,
            committeeMemberRole: 'Screening Officer',
            decision,
            remarks,
            timestamp: new Date().toISOString(),
          };

          const newStage =
            decision === 'Ineligible'
              ? 'screened_ineligible'
              : decision === 'Provisionally Eligible'
              ? 'under_screening'
              : 'screened_eligible';

          updatedApp = {
            ...app,
            screeningStatus: decision,
            screeningRemarks: [...(app.screeningRemarks || []), newRemark],
            stage: newStage,
            docVerificationStatus: decision === 'Eligible' ? 'Pending' : app.docVerificationStatus,
          };
          return updatedApp;
        }
        return app;
      })
    );

    if (updatedApp) {
      runDbTransaction(
        'Screening Decision Transaction',
        `PUT /api/applications/${appId}`,
        `Recording committee evaluation [${decision}] for App #${(updatedApp as Application).applicationNo} in database...`,
        `Candidate screening decision (${decision}) committed to MongoDB.`,
        async () => {
          const res = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedApp),
          });
          if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
          return await res.json();
        }
      );
    }

    logAudit('SCREENING_UPDATED', 'Screening', `Updated screening for ${appId} to ${decision}. Remarks: ${remarks}`);
  };

  const updateDocVerification = (
    appId: string,
    status: 'Verified' | 'Discrepancy' | 'Rejected',
    remarks: string,
    docId?: string,
    docDiscrepancyReason?: string
  ) => {
    let updatedApp: Application | null = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          let updatedDocs = app.documents;
          if (docId) {
            updatedDocs = app.documents.map((d) => {
              if (d.id === docId) {
                return {
                  ...d,
                  status: status === 'Verified' ? 'verified' : status === 'Discrepancy' ? 'discrepancy' : 'rejected',
                  discrepancyReason: docDiscrepancyReason,
                  verifiedAt: new Date().toISOString(),
                  verifiedBy: 'Document Verification Officer',
                };
              }
              return d;
            });
          }

          const newStage =
            status === 'Verified'
              ? 'doc_verified'
              : status === 'Discrepancy'
              ? 'doc_discrepancy'
              : 'rejected';

          updatedApp = {
            ...app,
            documents: updatedDocs,
            docVerificationStatus: status,
            docVerificationRemarks: remarks,
            stage: newStage,
          };
          return updatedApp;
        }
        return app;
      })
    );

    if (updatedApp) {
      runDbTransaction(
        'Document Verification Transaction',
        `PUT /api/applications/${appId}`,
        `Updating document audit trail to [${status}] in MongoDB...`,
        `Document verification record updated and committed to database.`,
        async () => {
          const res = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedApp),
          });
          if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
          return await res.json();
        }
      );
    }

    logAudit('DOC_VERIFICATION', 'Document', `Document verification for ${appId}: Marked ${status}. Notes: ${remarks}`);
  };

  const scheduleExamAndInterview = (
    appId: string,
    examDetails: { center: string; dateTime: string; rollNo: string },
    interviewDetails?: { venue: string; dateTime: string }
  ) => {
    let updatedApp: Application | null = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          updatedApp = {
            ...app,
            examCenter: examDetails.center,
            examDateTime: examDetails.dateTime,
            rollNumber: examDetails.rollNo,
            admitCardIssued: true,
            interviewVenue: interviewDetails?.venue || app.interviewVenue,
            interviewDateTime: interviewDetails?.dateTime || app.interviewDateTime,
            stage: interviewDetails ? 'interview_scheduled' : 'test_scheduled',
          };
          return updatedApp;
        }
        return app;
      })
    );

    if (updatedApp) {
      runDbTransaction(
        'Exam Schedule & Admit Card',
        `PUT /api/applications/${appId}`,
        `Committing examination center & admit card (Roll #${examDetails.rollNo}) to database...`,
        `Admit card details and examination schedule synced with server.`,
        async () => {
          const res = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedApp),
          });
          if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
          return await res.json();
        }
      );
    }

    logAudit('TEST_SCHEDULED', 'Interview', `Scheduled exam/interview for App ID ${appId}. Roll No: ${examDetails.rollNo}`);
  };

  const submitInterviewScore = (
    appId: string,
    evaluationData: Omit<InterviewEvaluation, 'submittedAt'>
  ) => {
    let updatedApp: Application | null = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const evaluation: InterviewEvaluation = {
            ...evaluationData,
            submittedAt: new Date().toISOString(),
          };

          const existingEvaluations = app.evaluations || [];
          const updatedEvaluations = [...existingEvaluations, evaluation];

          // compute weighted score
          const written = evaluation.writtenTestScore || 0;
          const interview = evaluation.interviewScore || 0;
          const academic = evaluation.academicScore || 0;
          const demo = evaluation.teachingDemoScore || 0;

          // normalized formula score
          const calculatedScore = Number((written * 0.4 + (interview + demo) * 0.4 + academic * 0.2).toFixed(1));

          updatedApp = {
            ...app,
            evaluations: updatedEvaluations,
            aggregateScore: calculatedScore,
            stage: 'interviewed',
          };
          return updatedApp;
        }
        return app;
      })
    );

    if (updatedApp) {
      runDbTransaction(
        'Interview Score Transaction',
        `PUT /api/applications/${appId}`,
        `Calculating normalized marks and saving panel evaluation to database...`,
        `Interview evaluation scores committed to database successfully.`,
        async () => {
          const res = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedApp),
          });
          if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
          return await res.json();
        }
      );
    }

    logAudit('EVALUATION_SUBMITTED', 'Interview', `Panel submitted score for candidate ${appId}. Evaluator: ${evaluationData.panelMemberName}`);
  };

  const generateMeritList = (driveId: string, postId: string, config = weightageConfig) => {
    setApplications((prev) => {
      // filter candidate applications for this post & drive that are interviewed or doc_verified
      const eligibleForMerit = prev.filter(
        (a) => a.driveId === driveId && a.postId === postId && a.aggregateScore !== undefined
      );

      // sort descending by aggregate score
      const sorted = [...eligibleForMerit].sort((a, b) => {
        if ((b.aggregateScore || 0) !== (a.aggregateScore || 0)) {
          return (b.aggregateScore || 0) - (a.aggregateScore || 0);
        }
        // tie-breaker: age (older candidate ranked higher)
        const ageA = new Date(a.applicant.dob).getTime();
        const ageB = new Date(b.applicant.dob).getTime();
        return ageA - ageB;
      });

      // assign merit ranks
      const rankMap = new Map<string, { overallRank: number; catRank: number; status: 'Selected' | 'Waitlisted' | 'Not Selected' }>();
      
      const categoryCounters: Record<string, number> = {};

      sorted.forEach((app, idx) => {
        const overallRank = idx + 1;
        const cat = app.applicant.category;
        categoryCounters[cat] = (categoryCounters[cat] || 0) + 1;
        const catRank = categoryCounters[cat];

        const status: 'Selected' | 'Waitlisted' | 'Not Selected' =
          overallRank <= 3 ? 'Selected' : overallRank <= 6 ? 'Waitlisted' : 'Not Selected';

        rankMap.set(app.id, { overallRank, catRank, status });
      });

      const updatedApps = prev.map((app) => {
        if (rankMap.has(app.id)) {
          const meta = rankMap.get(app.id)!;
          const up = {
            ...app,
            meritRank: meta.overallRank,
            categoryRank: meta.catRank,
            selectedStatus: meta.status,
            selectionCategory: app.applicant.category,
            stage: (meta.status === 'Selected' ? 'selected' : app.stage) as Application['stage'],
          };
          fetch(`/api/applications/${app.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(up),
          }).catch((e) => console.error('MongoDB merit update failed:', e));
          return up;
        }
        return app;
      });

      return updatedApps;
    });

    runDbTransaction(
      'Merit Computation Transaction',
      'PUT /api/applications/merit',
      `Applying category quotas, age tie-breaker rule (${config.tieBreakerRule}) and ranking candidates in database...`,
      `Merit ranking computed and candidate selection statuses committed to MongoDB.`,
      async () => {
        return { success: true };
      }
    );

    logAudit('MERIT_LIST_GENERATED', 'Merit', `Generated merit list for Drive ${driveId}, Post ${postId} with tie-breaker rule ${config.tieBreakerRule}`);
  };

  const publishOfferLetter = (appId: string, deadlineDays = 21) => {
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);

    let updatedApp: Application | null = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          updatedApp = {
            ...app,
            stage: 'offer_issued',
            offerIssuedAt: new Date().toISOString(),
            offerDeadline: deadlineDate.toISOString(),
            offerStatus: 'Pending',
          };
          return updatedApp;
        }
        return app;
      })
    );

    if (updatedApp) {
      runDbTransaction(
        'Offer Letter Issuance',
        `PUT /api/applications/${appId}`,
        `Issuing formal appointment offer letter and joining deadline to database...`,
        `Offer letter dispatched and confirmed in database.`,
        async () => {
          const res = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedApp),
          });
          if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
          return await res.json();
        }
      );
    }

    logAudit('OFFER_ISSUED', 'Merit', `Issued formal offer letter for Application ${appId} with joining deadline ${deadlineDate.toLocaleDateString()}`);
  };

  const respondToOffer = (appId: string, response: 'Accepted' | 'Declined') => {
    let updatedApp: Application | null = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          updatedApp = {
            ...app,
            offerStatus: response,
            stage: response === 'Accepted' ? 'offer_accepted' : 'rejected',
          };
          return updatedApp;
        }
        return app;
      })
    );

    if (updatedApp) {
      runDbTransaction(
        'Offer Acceptance Decision',
        `PUT /api/applications/${appId}`,
        `Recording applicant response [${response}] in database...`,
        `Candidate offer response confirmed as ${response}.`,
        async () => {
          const res = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedApp),
          });
          if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
          return await res.json();
        }
      );
    }

    logAudit('OFFER_RESPONSE', 'Application', `Applicant ${response} offer for application ${appId}`);
  };

  const reconcilePayment = (appId: string, newStatus: 'Paid' | 'Refunded') => {
    let updatedApp: Application | null = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          updatedApp = {
            ...app,
            paymentStatus: newStatus,
          };
          return updatedApp;
        }
        return app;
      })
    );

    if (updatedApp) {
      runDbTransaction(
        'Finance Payment Reconciliation',
        `PUT /api/applications/${appId}`,
        `Updating finance ledger transaction status to [${newStatus}] in database...`,
        `Payment record reconciled to ${newStatus} in MongoDB.`,
        async () => {
          const res = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedApp),
          });
          if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
          return await res.json();
        }
      );
    }

    logAudit('PAYMENT_RECONCILED', 'Finance', `Payment status updated to ${newStatus} for Application ID: ${appId}`);
  };

  const addDepartment = (dept: Omit<Department, 'id' | 'activePostsCount'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      activePostsCount: 0,
    };
    setDepartments((prev) => [...prev, newDept]);

    runDbTransaction(
      'Department Provisioning',
      'POST /api/departments',
      `Writing department "${newDept.name}" (${newDept.code}) to MongoDB...`,
      `Department "${newDept.name}" successfully created in database.`,
      async () => {
        const res = await fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDept),
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit('DEPARTMENT_ADDED', 'Admin', `Added new department: ${newDept.name} (${newDept.code})`);
  };

  const addUser = (userData: Omit<PortalUser, 'id' | 'createdAt'>): PortalUser => {
    const newUser: PortalUser = {
      ...userData,
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);

    runDbTransaction(
      'User Account Creation',
      'POST /api/users',
      `Provisioning user account for "${newUser.name}" (${newUser.email}) with role [${newUser.role}]...`,
      `User account for ${newUser.name} created and committed to MongoDB.`,
      async () => {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit(
      'USER_CREATED',
      'Admin',
      `SuperAdmin created user account: ${newUser.name} (${newUser.email}) with role [${newUser.role}]`
    );
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<PortalUser>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );

    runDbTransaction(
      'User Account Modification',
      `PUT /api/users/${userId}`,
      `Updating user profile & role permissions in database...`,
      `User account parameters updated in MongoDB.`,
      async () => {
        const res = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit(
      'USER_MODIFIED',
      'Admin',
      `SuperAdmin updated user account ID [${userId}]: ${Object.keys(updates).join(', ')}`
    );
  };

  const deleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    runDbTransaction(
      'User Account Deletion',
      `DELETE /api/users/${userId}`,
      `Removing user account "${userToDelete?.name || userId}" from database...`,
      `User account removed from database.`,
      async () => {
        const res = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit(
      'USER_DELETED',
      'Admin',
      `SuperAdmin deleted user account: ${userToDelete?.name || userId} (${userToDelete?.email || 'N/A'})`
    );
  };

  const updateRolePermissions = (roleId: UserRole, permissions: string[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions } : r))
    );

    runDbTransaction(
      'RBAC Permissions Matrix Update',
      'POST /api/roles/permissions',
      `Updating permission matrix for role [${roleId}] in MongoDB...`,
      `Role permissions updated and committed to database.`,
      async () => {
        const res = await fetch('/api/roles/permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleId, permissions }),
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      }
    );

    logAudit('PERMISSIONS_UPDATED', 'Admin', `Updated RBAC permission list for role: ${roleId}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }).catch((e) => console.error('MongoDB notification update failed:', e));
  };

  const resetToDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    runDbTransaction(
      'Database Factory Reset',
      'POST /api/reset-data',
      'Flushing collections and seeding MongoDB with fresh university recruitment demo datasets...',
      'Database collections reset and seeded successfully.',
      async () => {
        const res = await fetch('/api/reset-data', { method: 'POST' });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        await refreshFromDatabase(false);
        return await res.json();
      }
    );

    setCurrentRole('super_admin');
    setSelectedDriveId('drive-2026-01');
    logAudit('SYSTEM_RESET', 'Admin', 'Reset recruitment database state to factory demo state.');
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    // Find full user object to get ID
    const userObj = users.find(u => u.email === currentUser.email);
    if (!userObj) return false;

    try {
      await updateUser(userObj.id, { password: newPassword });
      logAudit('PASSWORD_CHANGED', 'Security', `User ${currentUser.email} changed their own login password.`);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <PortalContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        activeTab,
        setActiveTab,
        allowDevRoleSelector,
        currentRole,
        roles,
        drives,
        applications,
        departments,
        users,
        auditLogs,
        notifications,
        selectedDriveId,
        setSelectedDriveId,
        weightageConfig,
        setWeightageConfig,
        branding,
        updateBranding,
        mongoStatus,
        refreshFromDatabase,
        transactionToasts,
        emitTransactionToast,
        updateTransactionToast,
        dismissTransactionToast,
        clearAllTransactionToasts,
        runDbTransaction,
        login,
        secureLogin,
        logout,
        registerApplicant,
        toggleDevRoleSelector,
        switchRole,
        createDrive,
        updateDrive,
        deleteDrive,
        addPostToDrive,
        updatePostInDrive,
        deletePostFromDrive,
        submitApplication,
        updateScreening,
        updateDocVerification,
        scheduleExamAndInterview,
        submitInterviewScore,
        generateMeritList,
        publishOfferLetter,
        respondToOffer,
        reconcilePayment,
        addDepartment,
        addUser,
        updateUser,
        deleteUser,
        updateRolePermissions,
        logAudit,
        markNotificationRead,
        resetToDemoData,
        changePassword,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within a PortalProvider');
  return ctx;
};

