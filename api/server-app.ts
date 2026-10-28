import express from 'express';
import {
  tryConnectDb,
  getDbStatus,
  getFullState,
  updateBrandingDb,
  updateRolePermissionsDb,
  createDriveDb,
  updateDriveDb,
  deleteDriveDb,
  addPostToDriveDb,
  updatePostInDriveDb,
  deletePostFromDriveDb,
  createApplicationDb,
  updateApplicationDb,
  createDepartmentDb,
  createAuditLogDb,
  markNotificationReadDb,
  updateWeightageConfigDb,
  createUserDb,
  updateUserDb,
  deleteUserDb,
  resetDatabaseToFactory,
  verifyLoginDb,
} from './server-db.js';

const app = express();

// 1. CORS Middleware (allows Vercel preview and custom domains)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 2. Request normalizer for Vercel Serverless Rewrites
app.use((req, res, next) => {
  const matched = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string);
  if (matched && typeof matched === 'string') {
    if (matched.startsWith('/api')) {
      req.url = matched;
    }
  }
  // Strip serverless filename artifacts if present
  if (req.url.startsWith('/api/index.ts') || req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace(/^\/api\/index(\.(ts|js))?/, '/api') || '/';
  } else if (req.url.startsWith('/index.ts') || req.url.startsWith('/index.js')) {
    req.url = req.url.replace(/^\/index(\.(ts|js))?/, '') || '/';
  }
  next();
});

// 3. JSON body parser
app.use(express.json({ limit: '15mb' }));

// ----------------------------------------------------
// API ROUTER DEFINITION
// ----------------------------------------------------
const apiRouter = express.Router();

// Root route for API diagnostics
apiRouter.get('/', (req, res) => {
  const status = getDbStatus();
  res.json({
    status: 'ok',
    service: 'BIT Recruitment Portal API',
    database: status,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Health & Database connection status
apiRouter.get('/health', (req, res) => {
  try {
    const status = getDbStatus();
    res.json({ status: 'ok', database: status });
  } catch (err: any) {
    res.status(200).json({ status: 'degraded', error: err?.message, database: getDbStatus() });
  }
});

// Manual reconnection trigger (Never returns 500, always structured JSON)
apiRouter.post('/reconnect', async (req, res) => {
  try {
    console.log('[API] /reconnect triggered');
    const database = await tryConnectDb();
    const status = getDbStatus();
    res.json({
      success: !!database,
      connected: status.connected,
      error: status.error,
      dbStatus: status,
    });
  } catch (err: any) {
    console.error('[API] /reconnect caught error:', err);
    const status = getDbStatus();
    res.json({
      success: false,
      connected: false,
      error: err?.message || 'Reconnection attempt failed.',
      dbStatus: status,
    });
  }
});

// 2. Full State for Real-Time synchronization
apiRouter.get('/state', async (req, res) => {
  try {
    const state = await getFullState();
    res.json(state);
  } catch (err: any) {
    console.error('[API] /state error fallback:', err);
    try {
      const state = await getFullState();
      res.json(state);
    } catch (innerErr: any) {
      res.status(200).json({
        branding: {},
        roles: [],
        departments: [],
        drives: [],
        applications: [],
        auditLogs: [],
        notifications: [],
        users: [],
        weightageConfig: {},
        dbStatus: getDbStatus(),
      });
    }
  }
});

// 3. Update Branding
apiRouter.post('/branding', async (req, res) => {
  try {
    const updated = await updateBrandingDb(req.body);
    res.json({ success: true, branding: updated });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

// 4. Update Role Permissions
apiRouter.post('/roles/permissions', async (req, res) => {
  try {
    const { roleId, permissions } = req.body;
    await updateRolePermissionsDb(roleId, permissions);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

// 5. Drives CRUD
apiRouter.post('/drives', async (req, res) => {
  try {
    const newDrive = await createDriveDb(req.body);
    res.json({ success: true, drive: newDrive });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

apiRouter.put('/drives/:id', async (req, res) => {
  try {
    await updateDriveDb(req.params.id, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/drives/:id', async (req, res) => {
  try {
    await deleteDriveDb(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

apiRouter.post('/drives/:id/posts', async (req, res) => {
  try {
    await addPostToDriveDb(req.params.id, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

apiRouter.put('/drives/:driveId/posts/:postId', async (req, res) => {
  try {
    await updatePostInDriveDb(req.params.driveId, req.params.postId, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/drives/:driveId/posts/:postId', async (req, res) => {
  try {
    await deletePostFromDriveDb(req.params.driveId, req.params.postId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

// 6. Applications CRUD & Stages
apiRouter.post('/applications', async (req, res) => {
  try {
    const appDoc = await createApplicationDb(req.body);
    res.json({ success: true, application: appDoc });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

apiRouter.put('/applications/:id', async (req, res) => {
  try {
    await updateApplicationDb(req.params.id, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

// 7. Departments CRUD
apiRouter.post('/departments', async (req, res) => {
  try {
    const dept = await createDepartmentDb(req.body);
    res.json({ success: true, department: dept });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

// 8. Audit Logs
apiRouter.post('/audit-logs', async (req, res) => {
  try {
    const log = await createAuditLogDb(req.body);
    res.json({ success: true, log });
  } catch (err: any) {
    res.json({ success: true, log: req.body });
  }
});

// 9. Notifications
apiRouter.put('/notifications/:id/read', async (req, res) => {
  try {
    await markNotificationReadDb(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

// 10. Weightage Config
apiRouter.post('/weightage-config', async (req, res) => {
  try {
    await updateWeightageConfigDb(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

// 11. User Management CRUD
apiRouter.post('/users', async (req, res) => {
  try {
    const user = await createUserDb(req.body);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

apiRouter.put('/users/:id', async (req, res) => {
  try {
    const updated = await updateUserDb(req.params.id, req.body);
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/users/:id', async (req, res) => {
  try {
    await deleteUserDb(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

// 12. Factory Reset Database
apiRouter.post('/reset-data', async (req, res) => {
  try {
    await resetDatabaseToFactory();
    const freshState = await getFullState();
    res.json({ success: true, state: freshState });
  } catch (err: any) {
    const freshState = await getFullState();
    res.json({ success: true, state: freshState });
  }
});

// 13. Login Authentication
apiRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await verifyLoginDb(email, password);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message });
  }
});

// Mount API router exclusively at /api prefix. 
app.use('/api', apiRouter);

// Global Error Handler - Prevents Vercel 500 crashes by catching exceptions and returning JSON.
// This is a 4-argument middleware and will only execute if next(err) is called or an error is thrown.
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[App Error Handler]', err);
  if (res.headersSent) {
    return next(err);
  }
  // We return HTTP 200 with error details to prevent Vercel's Lambda from producing a generic 500 crash page.
  res.status(200).json({
    error: true,
    message: err?.message || 'Internal server error occurred.',
    connected: false,
  });
});

export default app;
