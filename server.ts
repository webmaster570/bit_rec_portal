import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
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
} from './server/db';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use((req, res, next) => {
    if (!req.path.startsWith('/assets')) {
      console.log(`[Server] ${req.method} ${req.path}`);
    }
    next();
  });

  app.use(express.json({ limit: '15mb' }));

  // Initial database connection attempt (non-blocking)
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'production'}`);
  tryConnectDb().then(() => {
    console.log('[Server] Database sync completed or initial attempt finished.');
  }).catch((err) => {
    console.error('[Server] Database connection error during startup:', err);
  });

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------
  const apiRouter = express.Router();

  // Debug middleware for API
  apiRouter.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
  });

  // 0. Diagnostic routes
  apiRouter.get('/ping', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
  
  // 1. Health & Database connection status
  apiRouter.get('/health', (req, res) => {
    const status = getDbStatus();
    res.json({ status: 'ok', database: status });
  });

  // 2. Full State for Real-Time synchronization
  apiRouter.get('/state', async (req, res) => {
    try {
      const state = await getFullState();
      res.json(state);
    } catch (err: any) {
      console.warn('[API] /api/state error:', err?.message);
      const fallback = await getFullState();
      res.json(fallback);
    }
  });

  // 3. Update Branding
  apiRouter.post('/branding', async (req, res) => {
    try {
      const updated = await updateBrandingDb(req.body);
      res.json({ success: true, branding: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Update Role Permissions
  apiRouter.post('/roles/permissions', async (req, res) => {
    try {
      const { roleId, permissions } = req.body;
      await updateRolePermissionsDb(roleId, permissions);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Drives CRUD
  apiRouter.post('/drives', async (req, res) => {
    try {
      const newDrive = await createDriveDb(req.body);
      res.json({ success: true, drive: newDrive });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.put('/drives/:id', async (req, res) => {
    try {
      await updateDriveDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.delete('/drives/:id', async (req, res) => {
    try {
      await deleteDriveDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/drives/:id/posts', async (req, res) => {
    try {
      await addPostToDriveDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.put('/drives/:driveId/posts/:postId', async (req, res) => {
    try {
      await updatePostInDriveDb(req.params.driveId, req.params.postId, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.delete('/drives/:driveId/posts/:postId', async (req, res) => {
    try {
      await deletePostFromDriveDb(req.params.driveId, req.params.postId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Applications CRUD & Stages
  apiRouter.post('/applications', async (req, res) => {
    try {
      const appDoc = await createApplicationDb(req.body);
      res.json({ success: true, application: appDoc });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.put('/applications/:id', async (req, res) => {
    try {
      await updateApplicationDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Departments CRUD
  apiRouter.post('/departments', async (req, res) => {
    try {
      const dept = await createDepartmentDb(req.body);
      res.json({ success: true, department: dept });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
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
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Weightage Config
  apiRouter.post('/weightage-config', async (req, res) => {
    try {
      await updateWeightageConfigDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. User Management CRUD
  apiRouter.post('/users', async (req, res) => {
    try {
      const user = await createUserDb(req.body);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.put('/users/:id', async (req, res) => {
    try {
      const updated = await updateUserDb(req.params.id, req.body);
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.delete('/users/:id', async (req, res) => {
    try {
      await deleteUserDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
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
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Global ping for diagnostics
  app.get('/ping', (req, res) => res.send('pong'));

  // ----------------------------------------------------
  // VITE OR STATIC ASSETS MIDDLEWARE
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // More robust path resolution for Vercel lambdas and local execution
    let distPath = '';
    if (__filename.endsWith('.cjs')) {
      // Bundled output in dist/server.cjs
      distPath = __dirname;
    } else if (__dirname.includes('api')) {
      // Running from api/index.ts source
      distPath = path.join(__dirname, '..', 'dist');
    } else {
      // Running from root server.ts
      distPath = path.join(__dirname, 'dist');
    }
    
    console.log(`[Server] Detected distPath: ${distPath}`);
    console.log(`[Server] __dirname: ${__dirname}`);
    
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[Server] Error sending index.html from ${indexPath}:`, err);
          res.status(404).send('Static assets not found. Please run "npm run build" first.');
        }
      });
    });
  }

  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`[Server] Recruitment Portal Server running on http://0.0.0.0:${PORT}`);
    });
  }

  return app;
}

// For Vercel, we need to export the app itself or a promise of it
export const appPromise = startServer();

// Standard Vercel Node.js handler
export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
