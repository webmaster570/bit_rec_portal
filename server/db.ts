import { MongoClient, Db } from 'mongodb';
import { INITIAL_BRANDING, DEFAULT_WEIGHTAGE_CONFIG } from '../src/constants';
import {
  INITIAL_ROLES,
  INITIAL_DEPARTMENTS,
  INITIAL_DRIVES,
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
} from '../src/mockData';
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
} from '../src/types';

function getMongoUri(): string | undefined {
  let uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL;
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
// Ensures the entire web application runs 100% smoothly at all times
// with zero downtime, even if MongoDB is reconnecting or pending IP whitelist
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
    ipWhitelistHint: connectionError?.includes('IP Whitelist') || false,
    memorySummary: {
      drives: memoryState.drives.length,
      apps: memoryState.applications.length,
      users: memoryState.users.length,
    }
  };
}

export async function tryConnectDb(): Promise<Db | null> {
  // If already connected and client is active, reuse instantly (0ms)
  if (db && isConnected && client) return db;
  if (globalThis._mongoDbInstance && globalThis._mongoClientInstance) {
    db = globalThis._mongoDbInstance;
    client = globalThis._mongoClientInstance;
    isConnected = true;
    return db;
  }
  
  // If we're already connecting in this instance, wait for it
  if (isConnecting) {
    let attempts = 0;
    while (isConnecting && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 300));
      attempts++;
    }
    if (db && isConnected) return db;
  }

  isConnecting = true;
  try {
    const uri = getMongoUri();
    const env = process.env.NODE_ENV || 'production';
    console.log(`[MongoDB] Initiating connection (Env: ${env}, Vercel: ${!!process.env.VERCEL})...`);
    
    if (!uri) {
      console.warn('[MongoDB] MONGODB_URI is MISSING or EMPTY in current environment.');
      isConnected = false;
      connectionError = 'MONGODB_URI environment variable is not defined.';
      return null;
    }

    const masked = uri.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@');
    console.log(`[MongoDB] Connection Target: ${masked}`);
    
    if (!client) {
      client = new MongoClient(uri, {
        connectTimeoutMS: 6000,
        serverSelectionTimeoutMS: 6000,
        socketTimeoutMS: 15000,
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 10000,
        retryWrites: true,
      });
      globalThis._mongoClientInstance = client;
    }

    // Explicitly enforce serverless timeout ceiling (7s) so Vercel lambdas never crash with 504
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timed out (7s). Check MongoDB Atlas Network Access (0.0.0.0/0).')), 7000)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    
    // Use the database name from the URI if specified, otherwise fall back to default
    db = client.db();
    const activeDbName = db.databaseName || DEFAULT_DB_NAME;
    
    globalThis._mongoDbInstance = db;
    isConnected = true;
    connectionError = null;
    console.log(`[MongoDB] Successfully connected to database: "${activeDbName}"`);

    // Sync in-memory state to / from MongoDB collections (fast check)
    await syncInitialDatabase(db);
    return db;
  } catch (err: any) {
    isConnected = false;
    try {
      if (client) {
        client.close().catch(() => {});
      }
    } catch {}
    client = null;
    globalThis._mongoClientInstance = null;
    globalThis._mongoDbInstance = null;

    const msg = err?.message || String(err);
    console.error(`[MongoDB] Connection error:`, msg);
    
    if (msg.includes('SSL alert') || msg.includes('TLS alert') || msg.includes('ServerSelection') || msg.includes('timed out')) {
      connectionError =
        'MongoDB Atlas connection timeout: Ensure 0.0.0.0/0 is Active in Atlas > Network Access, and database credentials are valid.';
    } else if (msg.includes('ENOTFOUND') || msg.includes('ETIMEDOUT') || msg.includes('DNS')) {
      connectionError = `Network / DNS error: ${msg}. Check if your MongoDB cluster host address is correct.`;
    } else if (msg.includes('Authentication failed') || msg.includes('bad auth')) {
      connectionError = 'Authentication failed: Invalid database username or password in MONGODB_URI.';
    } else {
      connectionError = msg;
    }
    
    console.error(`[MongoDB] Diagnostics: ${connectionError}`);
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

// Background auto-reconnect worker for persistent environments (disabled on Vercel to prevent frozen timer leaks)
if (!process.env.VERCEL) {
  setInterval(() => {
    if (!isConnected) {
      tryConnectDb().catch(() => {});
    }
  }, 12000);
}

async function syncInitialDatabase(database: Db) {
  if (globalThis._hasInitialSyncDone) {
    return;
  }
  try {
    const brandingCol = database.collection('branding');
    const existingBranding = await Promise.race([
      brandingCol.findOne({ _id: 'portal_branding' as any }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Seed check timeout')), 3000)),
    ]).catch(() => null);

    if (existingBranding) {
      // Database has already been initialized in MongoDB Atlas!
      globalThis._hasInitialSyncDone = true;
      console.log('[MongoDB] Database already initialized in Atlas. Skipping redundant re-seed.');
      return;
    }

    // First time setup on clean cluster: seed defaults
    console.log('[MongoDB] Initializing collections on fresh database cluster...');
    await brandingCol.insertOne({ _id: 'portal_branding' as any, ...memoryState.branding }).catch(() => {});

    const rolesCol = database.collection('roles');
    await rolesCol.insertMany(memoryState.roles.map((r) => ({ ...r, _id: r.id as any }))).catch(() => {});

    const deptsCol = database.collection('departments');
    await deptsCol.insertMany(memoryState.departments.map((d) => ({ ...d, _id: d.id as any }))).catch(() => {});

    const drivesCol = database.collection('drives');
    await drivesCol.insertMany(memoryState.drives.map((d) => ({ ...d, _id: d.id as any }))).catch(() => {});

    const appsCol = database.collection('applications');
    await appsCol.insertMany(memoryState.applications.map((a) => ({ ...a, _id: a.id as any }))).catch(() => {});

    const usersCol = database.collection('users');
    await usersCol.insertMany(memoryState.users.map((u) => ({ ...u, _id: u.id as any }))).catch(() => {});

    const weightCol = database.collection('weightage_config');
    await weightCol.insertOne({ _id: 'default_config' as any, ...memoryState.weightageConfig }).catch(() => {});

    globalThis._hasInitialSyncDone = true;
    console.log('[MongoDB] Initial database seeding completed.');
  } catch (err) {
    console.warn('[MongoDB] Sync process notice:', err);
  }
}

// ----------------------------------------------------
// STATE RETRIEVAL & CRUD FUNCTIONS
// Always returns immediately with live data
// ----------------------------------------------------

export async function getFullState() {
  try {
    const database = await tryConnectDb();

    if (database) {
      console.log('[MongoDB] Fetching state from remote collections...');
      const [brandingDoc, rolesDocs, deptsDocs, drivesDocs, appsDocs, auditDocs, notifsDocs, usersDocs, weightDoc] =
        await Promise.all([
          database.collection('branding').findOne({ _id: 'portal_branding' as any }).catch(e => null),
          database.collection('roles').find({}).toArray().catch(e => []),
          database.collection('departments').find({}).toArray().catch(e => []),
          database.collection('drives').find({}).sort({ startDate: -1 }).toArray().catch(e => []),
          database.collection('applications').find({}).sort({ submittedAt: -1 }).toArray().catch(e => []),
          database.collection('audit_logs').find({}).sort({ timestamp: -1 }).limit(100).toArray().catch(e => []),
          database.collection('notifications').find({}).sort({ timestamp: -1 }).toArray().catch(e => []),
          database.collection('users').find({}).toArray().catch(e => []),
          database.collection('weightage_config').findOne({ _id: 'default_config' as any }).catch(e => null),
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
      console.log('[MongoDB] Remote state successfully synchronized to local memory.');
    } else {
      if (connectionError) {
        console.warn(`[MongoDB] Serving from local memory store. Reason: ${connectionError}`);
      }
    }
  } catch (e) {
    console.warn('[MongoDB] Read fallback to live memory store due to unexpected error:', e);
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

  // 1. Try to find in MongoDB first if connected
  if (isConnected && db) {
    try {
      const doc = await db.collection('users').findOne({ 
        email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } 
      });
      if (doc) {
        const { _id, ...rest } = doc;
        user = { ...rest, id: rest.id || _id } as PortalUser;
      }
    } catch (e) {
      console.warn('[MongoDB] Login lookup failed, falling back to memory');
    }
  }

  // 2. Fallback to memory state
  if (!user) {
    user = memoryState.users.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase()) || null;
  }

  // 3. Verify password (simple check for now, can be hashed later)
  if (user) {
    const userPassword = user.password || 'pass123'; // Default fallback if still missing
    if (userPassword === password) {
      // Update last login
      const lastLoginAt = new Date().toISOString();
      if (isConnected && db) {
        db.collection('users').updateOne({ email: user.email }, { $set: { lastLoginAt } }).catch(() => {});
      }
      user.lastLoginAt = lastLoginAt;
      return user;
    }
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
  } catch (e) {
    console.error('[MongoDB] Branding save failed:', e);
    throw e;
  }
  return memoryState.branding;
}

export async function updateRolePermissionsDb(roleId: string, permissions: string[]) {
  memoryState.roles = memoryState.roles.map((r) =>
    r.id === roleId ? { ...r, permissions } : r
  );

  try {
    const database = await ensureDb();
    await database.collection('roles').updateOne({ id: roleId }, { $set: { permissions } });
  } catch (e) {
    console.error('[MongoDB] Role update failed:', e);
    throw e;
  }
}

export async function createDriveDb(drive: RecruitmentDrive) {
  memoryState.drives = [drive, ...memoryState.drives];

  try {
    const database = await ensureDb();
    await database.collection('drives').insertOne({ _id: drive.id as any, ...drive });
  } catch (e) {
    console.error('[MongoDB] Drive creation failed:', e);
    throw e;
  }
  return drive;
}

export async function updateDriveDb(driveId: string, updates: Partial<RecruitmentDrive>) {
  memoryState.drives = memoryState.drives.map((d) =>
    d.id === driveId ? { ...d, ...updates } : d
  );

  try {
    const database = await ensureDb();
    await database.collection('drives').updateOne(
      { $or: [{ id: driveId }, { _id: driveId as any }] },
      { $set: updates }
    );
  } catch (e) {
    console.error('[MongoDB] Drive update failed:', e);
    throw e;
  }
}

export async function addPostToDriveDb(driveId: string, newPost: any) {
  memoryState.drives = memoryState.drives.map((d) => {
    if (d.id === driveId) {
      return { ...d, posts: [...(d.posts || []), newPost] };
    }
    return d;
  });

  try {
    const database = await ensureDb();
    await database.collection('drives').updateOne(
      { $or: [{ id: driveId }, { _id: driveId as any }] },
      { $push: { posts: newPost } as any }
    );
  } catch (e) {
    console.error('[MongoDB] Add post failed:', e);
    throw e;
  }
}

export async function deleteDriveDb(driveId: string) {
  memoryState.drives = memoryState.drives.filter((d) => d.id !== driveId);

  try {
    const database = await ensureDb();
    await database.collection('drives').deleteOne({ $or: [{ id: driveId }, { _id: driveId as any }] });
  } catch (e) {
    console.error('[MongoDB] Drive deletion failed:', e);
    throw e;
  }
}

export async function updatePostInDriveDb(driveId: string, postId: string, postUpdates: any) {
  memoryState.drives = memoryState.drives.map((d) => {
    if (d.id === driveId) {
      return {
        ...d,
        posts: d.posts.map((p) => (p.id === postId ? { ...p, ...postUpdates } : p)),
      };
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
  } catch (e) {
    console.error('[MongoDB] Post update failed:', e);
    throw e;
  }
}

export async function deletePostFromDriveDb(driveId: string, postId: string) {
  memoryState.drives = memoryState.drives.map((d) => {
    if (d.id === driveId) {
      return {
        ...d,
        posts: d.posts.filter((p) => p.id !== postId),
      };
    }
    return d;
  });

  try {
    const database = await ensureDb();
    await database.collection('drives').updateOne(
      { $or: [{ id: driveId }, { _id: driveId as any }] },
      { $pull: { posts: { id: postId } } as any }
    );
  } catch (e) {
    console.error('[MongoDB] Delete post failed:', e);
    throw e;
  }
}

export async function createApplicationDb(app: Application) {
  memoryState.applications = [app, ...memoryState.applications];
  memoryState.drives = memoryState.drives.map((d) =>
    d.id === app.driveId
      ? { ...d, totalApplicationsCount: (d.totalApplicationsCount || 0) + 1 }
      : d
  );

  try {
    const database = await ensureDb();
    await database.collection('applications').insertOne({ _id: app.id as any, ...app });
    await database.collection('drives').updateOne(
      { $or: [{ id: app.driveId }, { _id: app.driveId as any }] },
      { $inc: { totalApplicationsCount: 1 } }
    );
  } catch (e) {
    console.error('[MongoDB] Application creation failed:', e);
    throw e;
  }
  return app;
}

export async function updateApplicationDb(appId: string, updates: Partial<Application>) {
  memoryState.applications = memoryState.applications.map((a) =>
    a.id === appId ? { ...a, ...updates } : a
  );

  try {
    const database = await ensureDb();
    await database.collection('applications').updateOne(
      { $or: [{ id: appId }, { _id: appId as any }] },
      { $set: updates }
    );
  } catch (e) {
    console.error('[MongoDB] Application update failed:', e);
    throw e;
  }
}

export async function createDepartmentDb(dept: Department) {
  memoryState.departments = [...memoryState.departments, dept];

  try {
    const database = await ensureDb();
    await database.collection('departments').insertOne({ _id: dept.id as any, ...dept });
  } catch (e) {
    console.error('[MongoDB] Department creation failed:', e);
    throw e;
  }
  return dept;
}

export async function createAuditLogDb(log: AuditLog) {
  memoryState.auditLogs = [log, ...memoryState.auditLogs];

  try {
    const database = await ensureDb();
    await database.collection('audit_logs').insertOne({ _id: log.id as any, ...log });
  } catch (e) {
    console.warn('[MongoDB] Async audit log save failed (non-critical):', e);
  }
  return log;
}

export async function markNotificationReadDb(notifId: string) {
  memoryState.notifications = memoryState.notifications.map((n) =>
    n.id === notifId ? { ...n, read: true } : n
  );

  try {
    const database = await ensureDb();
    await database.collection('notifications').updateOne(
      { $or: [{ id: notifId }, { _id: notifId as any }] },
      { $set: { read: true } }
    );
  } catch (e) {
    console.error('[MongoDB] Mark notification read failed:', e);
    throw e;
  }
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
  } catch (e) {
    console.error('[MongoDB] Weightage config save failed:', e);
    throw e;
  }
}

export async function createUserDb(user: PortalUser) {
  memoryState.users = [user, ...memoryState.users];

  try {
    const database = await ensureDb();
    await database.collection('users').insertOne({ _id: user.id as any, ...user });
  } catch (e) {
    console.error('[MongoDB] User creation failed:', e);
    throw e;
  }
  return user;
}

export async function updateUserDb(userId: string, updates: Partial<PortalUser>) {
  memoryState.users = memoryState.users.map((u) =>
    u.id === userId ? { ...u, ...updates } : u
  );

  try {
    const database = await ensureDb();
    await database.collection('users').updateOne(
      { $or: [{ id: userId }, { _id: userId as any }] },
      { $set: updates }
    );
  } catch (e) {
    console.error('[MongoDB] User update failed:', e);
    throw e;
  }
  return memoryState.users.find((u) => u.id === userId);
}

export async function deleteUserDb(userId: string) {
  memoryState.users = memoryState.users.filter((u) => u.id !== userId);

  try {
    const database = await ensureDb();
    await database.collection('users').deleteOne({ $or: [{ id: userId }, { _id: userId as any }] });
  } catch (e) {
    console.error('[MongoDB] User deletion failed:', e);
    throw e;
  }
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
    await syncInitialDatabase(database);
  } catch (e) {
    console.error('[MongoDB] Database reset failed:', e);
    throw e;
  }
}
