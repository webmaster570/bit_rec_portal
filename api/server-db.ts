import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import { INITIAL_BRANDING, DEFAULT_WEIGHTAGE_CONFIG } from '../src/constants.js';
import {
  INITIAL_ROLES,
  INITIAL_DEPARTMENTS,
  INITIAL_DRIVES,
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
} from '../src/mockData.js';
import {
  PortalBranding,
  RoleInfo,
  Department,
  RecruitmentDrive,
  Application,
  AuditLog,
  SystemNotification,
  WeightageConfig,
  PortalUser,
} from '../src/types.js';

function getMongoUri(): string | undefined {
  let uri = process.env.MONGODB_URI;
  
  if (!uri || typeof uri !== 'string') return undefined;
  
  uri = uri.trim();
  // Strip accidental enclosing quotes from Vercel env var input
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  return uri || undefined;
}

const DEFAULT_DB_NAME = 'bit_recruitment_portal';

// Global caching for Vercel / AWS Lambda container reuse
declare global {
  var _mongoClientInstance: MongoClient | null | undefined;
  var _mongoDbInstance: Db | null | undefined;
  var _hasInitialSyncDone: boolean | undefined;
}

let client: MongoClient | null = globalThis._mongoClientInstance || null;
let db: Db | null = globalThis._mongoDbInstance || null;
let isConnected = !!(client && db);
let isConnecting = false;
let connectionError: string | null = null;

// ------------------------------------------------------------------
// Resilient In-Memory Master Store
// ------------------------------------------------------------------
const memoryState = {
  branding: { ...INITIAL_BRANDING },
  roles: [...INITIAL_ROLES],
  departments: [...INITIAL_DEPARTMENTS],
  drives: [...INITIAL_DRIVES],
  applications: [...INITIAL_APPLICATIONS],
  auditLogs: [...INITIAL_AUDIT_LOGS],
  notifications: [...INITIAL_NOTIFICATIONS],
  users: [...INITIAL_USERS],
  weightageConfig: { ...DEFAULT_WEIGHTAGE_CONFIG },
};

export function getDbStatus() {
  const uri = getMongoUri();
  return {
    connected: isConnected,
    database: db?.databaseName || DEFAULT_DB_NAME,
    error: connectionError,
    uriMasked: (uri || '').replace(/:\/\/[^:]+:[^@]+@/, '://****:****@'),
    isConnecting,
    env: process.env.NODE_ENV || 'production',
    isVercel: !!process.env.VERCEL,
    hasUri: !!uri,
    missingUri: !uri,
    ipWhitelistHint: connectionError?.includes('IP Access List') || connectionError?.includes('whitelist') || false,
    memorySummary: {
      drives: memoryState.drives.length,
      apps: memoryState.applications.length,
      users: memoryState.users.length,
    }
  };
}

export async function tryConnectDb(): Promise<Db | null> {
  // 1. Instant check for cached connection
  if (db && isConnected && client) {
    try {
      await db.command({ ping: 1 });
      return db;
    } catch (e) {
      console.warn('[MongoDB] Cached connection stale, reconnecting...');
      isConnected = false;
    }
  }

  if (globalThis._mongoDbInstance && globalThis._mongoClientInstance) {
    try {
      await globalThis._mongoDbInstance.command({ ping: 1 });
      db = globalThis._mongoDbInstance;
      client = globalThis._mongoClientInstance;
      isConnected = true;
      return db;
    } catch (e) {
      globalThis._mongoDbInstance = null;
      globalThis._mongoClientInstance = null;
    }
  }
  
  if (isConnecting) {
    let attempts = 0;
    while (isConnecting && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 250));
      attempts++;
      if (db && isConnected) return db;
    }
  }

  isConnecting = true;
  try {
    const uri = getMongoUri();
    const isVercel = !!process.env.VERCEL;
    
    if (!uri) {
      connectionError = 'MONGODB_URI is missing in environment variables.';
      return null;
    }

    if (!client) {
      client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        maxPoolSize: 1, // Minimize connections in serverless
        minPoolSize: 0,
        retryWrites: true,
      });
      globalThis._mongoClientInstance = client;
    }

    // Attempt connection with explicit timeout
    await client.connect();
    
    db = client.db(); // Uses db name from URI if present
    globalThis._mongoDbInstance = db;
    isConnected = true;
    connectionError = null;
    
    console.log(`[MongoDB] Connected to: ${db.databaseName}`);

    // Seed if empty
    await syncInitialDatabase(db);
    return db;
  } catch (err: any) {
    isConnected = false;
    const msg = err?.message || String(err);
    console.error(`[MongoDB] Connection failed:`, msg);
    
    if (msg.includes('IP Access List') || msg.includes('not whitelisted')) {
      connectionError = 'Vercel IP is not whitelisted. Ensure 0.0.0.0/0 is Active in MongoDB Atlas > Network Access.';
    } else if (msg.includes('timed out') || msg.includes('ServerSelectionTimeout')) {
      connectionError = 'Connection timed out. Check MongoDB Atlas status and whitelist (0.0.0.0/0).';
    } else if (msg.includes('Authentication failed')) {
      connectionError = 'Invalid MongoDB credentials. Check your MONGODB_URI username/password.';
    } else {
      connectionError = msg;
    }
    
    // Cleanup failed client to prevent leak
    if (client) {
      client.close().catch(() => {});
      client = null;
      globalThis._mongoClientInstance = null;
    }
    
    return null;
  } finally {
    isConnecting = false;
  }
}

async function ensureDb(): Promise<Db> {
  const database = await tryConnectDb();
  if (!database) {
    throw new Error(connectionError || 'Database connection unavailable.');
  }
  return database;
}

async function syncInitialDatabase(database: Db) {
  if (globalThis._hasInitialSyncDone) return;
  try {
    const brandingCol = database.collection('branding');
    const existingBranding = await brandingCol.findOne({ _id: 'portal_branding' as any }).catch(() => null);

    if (existingBranding) {
      globalThis._hasInitialSyncDone = true;
      console.log('[MongoDB] Existing database detected. Sync complete.');
      return;
    }

    console.log('[MongoDB] Initializing clean database...');
    await brandingCol.insertOne({ _id: 'portal_branding' as any, ...memoryState.branding }).catch(() => {});

    // Fast seed
    await Promise.all([
      database.collection('roles').insertMany(memoryState.roles.map((r) => ({ ...r, _id: r.id as any }))).catch(() => {}),
      database.collection('departments').insertMany(memoryState.departments.map((d) => ({ ...d, _id: d.id as any }))).catch(() => {}),
      database.collection('drives').insertMany(memoryState.drives.map((d) => ({ ...d, _id: d.id as any }))).catch(() => {}),
      database.collection('users').insertMany(memoryState.users.map((u) => ({ ...u, _id: u.id as any }))).catch(() => {}),
      database.collection('weightage_config').insertOne({ _id: 'default_config' as any, ...memoryState.weightageConfig }).catch(() => {}),
    ]);

    globalThis._hasInitialSyncDone = true;
  } catch (err) {
    console.warn('[MongoDB] Seeding notice:', err);
  }
}

export async function getFullState() {
  try {
    const database = await tryConnectDb();
    if (database) {
      const [brandingDoc, rolesDocs, deptsDocs, drivesDocs, appsDocs, auditDocs, notifsDocs, usersDocs, weightDoc] =
        await Promise.all([
          database.collection('branding').findOne({ _id: 'portal_branding' as any }).catch(() => null),
          database.collection('roles').find({}).toArray().catch(() => []),
          database.collection('departments').find({}).toArray().catch(() => []),
          database.collection('drives').find({}).sort({ startDate: -1 }).toArray().catch(() => []),
          database.collection('applications').find({}).sort({ submittedAt: -1 }).toArray().catch(() => []),
          database.collection('audit_logs').find({}).sort({ timestamp: -1 }).limit(100).toArray().catch(() => []),
          database.collection('notifications').find({}).sort({ timestamp: -1 }).toArray().catch(() => []),
          database.collection('users').find({}).toArray().catch(() => []),
          database.collection('weightage_config').findOne({ _id: 'default_config' as any }).catch(() => null),
        ]);

      const clean = (doc: any) => {
        if (!doc) return doc;
        const { _id, ...rest } = doc;
        return { ...rest, id: rest.id || _id };
      };

      if (brandingDoc) memoryState.branding = clean(brandingDoc);
      if (rolesDocs?.length) memoryState.roles = rolesDocs.map(clean);
      if (deptsDocs?.length) memoryState.departments = deptsDocs.map(clean);
      if (drivesDocs?.length) memoryState.drives = drivesDocs.map(clean);
      if (appsDocs?.length) memoryState.applications = appsDocs.map(clean);
      if (auditDocs?.length) memoryState.auditLogs = auditDocs.map(clean);
      if (notifsDocs?.length) memoryState.notifications = notifsDocs.map(clean);
      if (usersDocs?.length) memoryState.users = usersDocs.map(clean);
      if (weightDoc) memoryState.weightageConfig = clean(weightDoc);
    }
  } catch (e) {
    console.warn('[MongoDB] State sync failed, using memory fallback');
  }

  return {
    ...memoryState,
    dbStatus: getDbStatus(),
  };
}

export async function verifyLoginDb(email: string, password: string): Promise<PortalUser | null> {
  const cleanEmail = (email || '').trim();
  const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let user: PortalUser | null = null;

  if (isConnected && db) {
    try {
      const doc = await db.collection('users').findOne({ 
        email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } 
      });
      if (doc) {
        const { _id, ...rest } = doc;
        user = { ...rest, id: rest.id || _id } as PortalUser;
      }
    } catch (e) {}
  }

  if (!user) {
    user = memoryState.users.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase()) || null;
  }

  if (user && (user.password || 'pass123') === password) {
    const lastLoginAt = new Date().toISOString();
    if (isConnected && db) {
      db.collection('users').updateOne({ email: user.email }, { $set: { lastLoginAt } }).catch(() => {});
    }
    user.lastLoginAt = lastLoginAt;
    return user;
  }
  return null;
}

export async function updateBrandingDb(updates: Partial<PortalBranding>) {
  memoryState.branding = { ...memoryState.branding, ...updates };
  try {
    const database = await ensureDb();
    await database.collection('branding').updateOne(
      { _id: 'portal_branding' as any },
      { $set: updates },
      { upsert: true }
    );
  } catch (e) { throw e; }
  return memoryState.branding;
}

export async function updateRolePermissionsDb(roleId: string, permissions: string[]) {
  memoryState.roles = memoryState.roles.map((r) => r.id === roleId ? { ...r, permissions } : r);
  try {
    const database = await ensureDb();
    await database.collection('roles').updateOne({ id: roleId }, { $set: { permissions } });
  } catch (e) { throw e; }
}

export async function createDriveDb(drive: RecruitmentDrive) {
  memoryState.drives = [drive, ...memoryState.drives];
  try {
    const database = await ensureDb();
    await database.collection('drives').insertOne({ _id: drive.id as any, ...drive });
  } catch (e) { throw e; }
  return drive;
}

export async function updateDriveDb(driveId: string, updates: Partial<RecruitmentDrive>) {
  memoryState.drives = memoryState.drives.map((d) => d.id === driveId ? { ...d, ...updates } : d);
  try {
    const database = await ensureDb();
    await database.collection('drives').updateOne(
      { $or: [{ id: driveId }, { _id: driveId as any }] },
      { $set: updates }
    );
  } catch (e) { throw e; }
}

export async function addPostToDriveDb(driveId: string, newPost: any) {
  memoryState.drives = memoryState.drives.map((d) => {
    if (d.id === driveId) return { ...d, posts: [...(d.posts || []), newPost] };
    return d;
  });
  try {
    const database = await ensureDb();
    await database.collection('drives').updateOne(
      { $or: [{ id: driveId }, { _id: driveId as any }] },
      { $push: { posts: newPost } as any }
    );
  } catch (e) { throw e; }
}

export async function deleteDriveDb(driveId: string) {
  memoryState.drives = memoryState.drives.filter((d) => d.id !== driveId);
  try {
    const database = await ensureDb();
    await database.collection('drives').deleteOne({ $or: [{ id: driveId }, { _id: driveId as any }] });
  } catch (e) { throw e; }
}

export async function updatePostInDriveDb(driveId: string, postId: string, postUpdates: any) {
  memoryState.drives = memoryState.drives.map((d) => {
    if (d.id === driveId) {
      return { ...d, posts: d.posts.map((p) => (p.id === postId ? { ...p, ...postUpdates } : p)) };
    }
    return d;
  });
  try {
    const database = await ensureDb();
    const drive = memoryState.drives.find((d) => d.id === driveId);
    if (drive) {
      await database.collection('drives').updateOne(
        { $or: [{ id: driveId }, { _id: driveId as any }] },
        { $set: { posts: drive.posts } }
      );
    }
  } catch (e) { throw e; }
}

export async function deletePostFromDriveDb(driveId: string, postId: string) {
  memoryState.drives = memoryState.drives.map((d) => {
    if (d.id === driveId) return { ...d, posts: d.posts.filter((p) => p.id !== postId) };
    return d;
  });
  try {
    const database = await ensureDb();
    await database.collection('drives').updateOne(
      { $or: [{ id: driveId }, { _id: driveId as any }] },
      { $pull: { posts: { id: postId } } as any }
    );
  } catch (e) { throw e; }
}

export async function createApplicationDb(app: Application) {
  memoryState.applications = [app, ...memoryState.applications];
  memoryState.drives = memoryState.drives.map((d) =>
    d.id === app.driveId ? { ...d, totalApplicationsCount: (d.totalApplicationsCount || 0) + 1 } : d
  );
  try {
    const database = await ensureDb();
    await database.collection('applications').insertOne({ _id: app.id as any, ...app });
    await database.collection('drives').updateOne(
      { $or: [{ id: app.driveId }, { _id: app.driveId as any }] },
      { $inc: { totalApplicationsCount: 1 } }
    );
  } catch (e) { throw e; }
  return app;
}

export async function updateApplicationDb(appId: string, updates: Partial<Application>) {
  memoryState.applications = memoryState.applications.map((a) => a.id === appId ? { ...a, ...updates } : a);
  try {
    const database = await ensureDb();
    await database.collection('applications').updateOne(
      { $or: [{ id: appId }, { _id: appId as any }] },
      { $set: updates }
    );
  } catch (e) { throw e; }
}

export async function createDepartmentDb(dept: Department) {
  memoryState.departments = [...memoryState.departments, dept];
  try {
    const database = await ensureDb();
    await database.collection('departments').insertOne({ _id: dept.id as any, ...dept });
  } catch (e) { throw e; }
  return dept;
}

export async function createAuditLogDb(log: AuditLog) {
  memoryState.auditLogs = [log, ...memoryState.auditLogs];
  try {
    const database = await ensureDb();
    await database.collection('audit_logs').insertOne({ _id: log.id as any, ...log });
  } catch (e) {}
  return log;
}

export async function markNotificationReadDb(notifId: string) {
  memoryState.notifications = memoryState.notifications.map((n) => n.id === notifId ? { ...n, read: true } : n);
  try {
    const database = await ensureDb();
    await database.collection('notifications').updateOne(
      { $or: [{ id: notifId }, { _id: notifId as any }] },
      { $set: { read: true } }
    );
  } catch (e) { throw e; }
}

export async function updateWeightageConfigDb(config: WeightageConfig) {
  memoryState.weightageConfig = config;
  try {
    const database = await ensureDb();
    await database.collection('weightage_config').updateOne(
      { _id: 'default_config' as any },
      { $set: config },
      { upsert: true }
    );
  } catch (e) { throw e; }
}

export async function createUserDb(user: PortalUser) {
  memoryState.users = [user, ...memoryState.users];
  try {
    const database = await ensureDb();
    await database.collection('users').insertOne({ _id: user.id as any, ...user });
  } catch (e) { throw e; }
  return user;
}

export async function updateUserDb(userId: string, updates: Partial<PortalUser>) {
  memoryState.users = memoryState.users.map((u) => u.id === userId ? { ...u, ...updates } : u);
  try {
    const database = await ensureDb();
    await database.collection('users').updateOne(
      { $or: [{ id: userId }, { _id: userId as any }] },
      { $set: updates }
    );
  } catch (e) { throw e; }
  return memoryState.users.find((u) => u.id === userId);
}

export async function deleteUserDb(userId: string) {
  memoryState.users = memoryState.users.filter((u) => u.id !== userId);
  try {
    const database = await ensureDb();
    await database.collection('users').deleteOne({ $or: [{ id: userId }, { _id: userId as any }] });
  } catch (e) { throw e; }
  return true;
}

export async function resetDatabaseToFactory() {
  memoryState.branding = { ...INITIAL_BRANDING };
  memoryState.roles = [...INITIAL_ROLES];
  memoryState.departments = [...INITIAL_DEPARTMENTS];
  memoryState.drives = [...INITIAL_DRIVES];
  memoryState.applications = [...INITIAL_APPLICATIONS];
  memoryState.auditLogs = [...INITIAL_AUDIT_LOGS];
  memoryState.notifications = [...INITIAL_NOTIFICATIONS];
  memoryState.users = [...INITIAL_USERS];
  memoryState.weightageConfig = { ...DEFAULT_WEIGHTAGE_CONFIG };

  try {
    const database = await ensureDb();
    await Promise.all([
      database.collection('branding').deleteMany({}),
      database.collection('roles').deleteMany({}),
      database.collection('departments').deleteMany({}),
      database.collection('drives').deleteMany({}),
      database.collection('applications').deleteMany({}),
      database.collection('audit_logs').deleteMany({}),
      database.collection('notifications').deleteMany({}),
      database.collection('users').deleteMany({}),
      database.collection('weightage_config').deleteMany({}),
    ]);
    globalThis._hasInitialSyncDone = false;
    await syncInitialDatabase(database);
  } catch (e) { throw e; }
}
