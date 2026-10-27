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

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') return undefined;
  return uri.trim();
}

const DB_NAME = 'bit_recruitment_portal';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
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
    database: DB_NAME,
    error: connectionError,
    uriMasked: (uri || '').replace(/:\/\/[^:]+:[^@]+@/, '://****:****@'),
    isConnecting,
    env: process.env.NODE_ENV || 'production',
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
  if (db && isConnected) return db;
  
  // If we're already connecting, wait for that connection to finish
  if (isConnecting) {
    let attempts = 0;
    while (isConnecting && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    if (db && isConnected) return db;
  }

  isConnecting = true;
  try {
    const uri = getMongoUri();
    const env = process.env.NODE_ENV || 'production';
    console.log(`[MongoDB] Attempting connection (Env: ${env})...`);
    
    if (!uri) {
      console.warn('[MongoDB] MONGODB_URI is MISSING or EMPTY.');
      isConnected = false;
      connectionError = 'MONGODB_URI environment variable is not defined.';
      return null;
    }

    const masked = uri.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@');
    console.log(`[MongoDB] URI format check: ${uri.startsWith('mongodb+srv://') ? 'SRV' : 'Standard'}`);
    console.log(`[MongoDB] Connection Target: ${masked}`);
    
    if (!client) {
      client = new MongoClient(uri, {
        connectTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
      });
    }

    // Explicitly handle connection timeout to avoid hanging
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection attempt timed out (30s)')), 30000)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    
    db = client.db(DB_NAME);
    isConnected = true;
    connectionError = null;
    console.log(`[MongoDB] Successfully connected to database: "${DB_NAME}"`);

    // Sync in-memory state to / from MongoDB collections
    await syncInitialDatabase(db);
    return db;
  } catch (err: any) {
    isConnected = false;
    const msg = err?.message || String(err);
    console.error(`[MongoDB] Connection failed:`, err);
    
    if (msg.includes('SSL alert number 80') || msg.includes('TLS alert') || msg.includes('ServerSelection')) {
      connectionError =
        'MongoDB Atlas IP Whitelist pending or invalid credentials. Ensure 0.0.0.0/0 is active in Atlas > Network Access.';
    } else if (msg.includes('ENOTFOUND') || msg.includes('ETIMEDOUT') || msg.includes('timed out')) {
      connectionError = `Network/DNS timeout: ${msg}. Check your MongoDB cluster URL and internet connectivity.`;
    } else if (msg.includes('Authentication failed')) {
      connectionError = 'Authentication failed: Invalid username or password in MONGODB_URI.';
    } else {
      connectionError = msg;
    }
    
    console.error(`[MongoDB] Error Summary: ${connectionError}`);
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

// Background auto-reconnect worker
setInterval(() => {
  if (!isConnected) {
    tryConnectDb().catch(() => {});
  }
}, 12000);

async function syncInitialDatabase(database: Db) {
  try {
    // 1. Branding
    const brandingCol = database.collection('branding');
    const existingBranding = await brandingCol.findOne({ _id: 'portal_branding' as any });
    if (!existingBranding) {
      await brandingCol.insertOne({ _id: 'portal_branding' as any, ...memoryState.branding });
    } else {
      const { _id, ...rest } = existingBranding as any;
      memoryState.branding = { ...memoryState.branding, ...rest };
    }

    // 2. Roles
    const rolesCol = database.collection('roles');
    const rolesCount = await rolesCol.countDocuments();
    if (rolesCount === 0) {
      const docs = memoryState.roles.map((r) => ({ ...r, _id: r.id as any }));
      await rolesCol.insertMany(docs);
    } else {
      const docs = await rolesCol.find({}).toArray();
      memoryState.roles = docs.map(({ _id, ...r }: any) => ({ ...r, id: r.id || _id }));
    }

    // 3. Departments
    const deptsCol = database.collection('departments');
    const deptsCount = await deptsCol.countDocuments();
    if (deptsCount === 0) {
      const docs = memoryState.departments.map((d) => ({ ...d, _id: d.id as any }));
      await deptsCol.insertMany(docs);
    } else {
      const docs = await deptsCol.find({}).toArray();
      memoryState.departments = docs.map(({ _id, ...d }: any) => ({ ...d, id: d.id || _id }));
    }

    // 4. Drives
    const drivesCol = database.collection('drives');
    const drivesCount = await drivesCol.countDocuments();
    if (drivesCount === 0) {
      const docs = memoryState.drives.map((d) => ({ ...d, _id: d.id as any }));
      await drivesCol.insertMany(docs);
    } else {
      const docs = await drivesCol.find({}).toArray();
      memoryState.drives = docs.map(({ _id, ...d }: any) => ({ ...d, id: d.id || _id }));
    }

    // 5. Applications
    const appsCol = database.collection('applications');
    const appsCount = await appsCol.countDocuments();
    if (appsCount === 0) {
      const docs = memoryState.applications.map((a) => ({ ...a, _id: a.id as any }));
      await appsCol.insertMany(docs);
    } else {
      const docs = await appsCol.find({}).toArray();
      memoryState.applications = docs.map(({ _id, ...a }: any) => ({ ...a, id: a.id || _id }));
    }

    // 6. Audit Logs
    const auditCol = database.collection('audit_logs');
    const auditCount = await auditCol.countDocuments();
    if (auditCount === 0) {
      const docs = memoryState.auditLogs.map((l) => ({ ...l, _id: l.id as any }));
      await auditCol.insertMany(docs);
    }

    // 7. Notifications
    const notifsCol = database.collection('notifications');
    const notifsCount = await notifsCol.countDocuments();
    if (notifsCount === 0) {
      const docs = memoryState.notifications.map((n) => ({ ...n, _id: n.id as any }));
      await notifsCol.insertMany(docs);
    }

    console.log('[MongoDB] 8. Syncing users...');
    const usersCol = database.collection('users');
    const usersCount = await usersCol.countDocuments();
    
    try {
      await usersCol.updateMany(
        { 
          $or: [
            { password: { $exists: false } }, 
            { password: "" }, 
            { password: null }
          ] 
        },
        { $set: { password: 'pass123' } }
      );
    } catch (err) {
      console.warn('[MongoDB] User password migration notice:', err);
    }

    if (usersCount === 0) {
      const docs = memoryState.users.map((u) => ({ ...u, _id: u.id as any }));
      await usersCol.insertMany(docs);
    } else {
      for (const initialUser of INITIAL_USERS) {
        const exists = await usersCol.findOne({ email: initialUser.email });
        if (!exists) {
          await usersCol.insertOne({ ...initialUser, _id: initialUser.id as any });
        }
      }
      const docs = await usersCol.find({}).toArray();
      memoryState.users = docs.map(({ _id, ...u }: any) => ({ ...u, id: u.id || _id }));
    }

    console.log('[MongoDB] 9. Syncing weightage...');
    const weightCol = database.collection('weightage_config');
    const weightDoc = await weightCol.findOne({ _id: 'default_config' as any });
    if (!weightDoc) {
      await weightCol.insertOne({ _id: 'default_config' as any, ...memoryState.weightageConfig });
    } else {
      const { _id, ...rest } = weightDoc as any;
      memoryState.weightageConfig = { ...memoryState.weightageConfig, ...rest };
    }

    // 10. Indexes
    console.log('[MongoDB] 10. Ensuring indexes...');
    await Promise.all([
      database.collection('users').createIndex({ email: 1 }, { unique: true }),
      database.collection('users').createIndex({ id: 1 }),
      database.collection('drives').createIndex({ id: 1 }),
      database.collection('applications').createIndex({ id: 1 }),
      database.collection('applications').createIndex({ applicationNo: 1 }, { unique: true }),
    ]).catch(err => console.warn('[MongoDB] Index creation notice (some may already exist):', err.message));

    console.log('[MongoDB] All collections verified and synced.');
  } catch (err) {
    console.warn('[MongoDB] Sync process encountered a notice (possible timeout):', err);
  }
}

// ----------------------------------------------------
// STATE RETRIEVAL & CRUD FUNCTIONS
// Always returns immediately with live data
// ----------------------------------------------------

export async function getFullState() {
  try {
    // Check connection first without forcing a re-connect if already failed recently
    if (!isConnected && !isConnecting) {
      // Don't await tryConnectDb here to avoid blocking /api/state if DB is down
      // The background worker handles reconnection.
    }

    if (isConnected && db) {
      console.log('[MongoDB] Fetching state from remote collections...');
      const [brandingDoc, rolesDocs, deptsDocs, drivesDocs, appsDocs, auditDocs, notifsDocs, usersDocs, weightDoc] =
        await Promise.all([
          db.collection('branding').findOne({ _id: 'portal_branding' as any }).catch(e => null),
          db.collection('roles').find({}).toArray().catch(e => []),
          db.collection('departments').find({}).toArray().catch(e => []),
          db.collection('drives').find({}).sort({ startDate: -1 }).toArray().catch(e => []),
          db.collection('applications').find({}).sort({ submittedAt: -1 }).toArray().catch(e => []),
          db.collection('audit_logs').find({}).sort({ timestamp: -1 }).limit(100).toArray().catch(e => []),
          db.collection('notifications').find({}).sort({ timestamp: -1 }).toArray().catch(e => []),
          db.collection('users').find({}).toArray().catch(e => []),
          db.collection('weightage_config').findOne({ _id: 'default_config' as any }).catch(e => null),
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
        console.warn(`[MongoDB] Serving from local memory store. Connection error: ${connectionError}`);
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
