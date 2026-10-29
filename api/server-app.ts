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
  createOtpDb,
  verifyOtpDb,
  createCaptchaDb,
  verifyCaptchaDb,
  updateMailConfigDb,
} from './server-db.js';
import nodemailer from 'nodemailer';
import svgCaptcha from 'svg-captcha';

const app = express();

// ----------------------------------------------------
// EMAIL TRANSPORTER CONFIGURATION
// ----------------------------------------------------
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const state = await getFullState();
    const config = state.mailConfig;

    const user = config?.user || process.env.EMAIL_USER;
    const pass = config?.pass || process.env.EMAIL_PASS;
    const host = config?.host || process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = Number(config?.port || process.env.EMAIL_PORT || 587);
    const fromName = config?.fromName || 'Portal Auth';
    const fromEmail = config?.fromEmail || user;

    if (!user || !pass) {
      console.warn('[Email] SMTP credentials missing. Skipping email send to:', to);
      console.log('[Email Content]:', html);
      return true; // Return true to allow development without real SMTP
    }

    const dynamicTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await dynamicTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('[Email] Failed to send email:', err);
    return false;
  }
}

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

apiRouter.post('/mail-config', async (req, res) => {
  try {
    await updateMailConfigDb(req.body);
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

// ----------------------------------------------------
// AUTH & EMAIL ROUTES
// ----------------------------------------------------

apiRouter.post('/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const stored = await createOtpDb(email, otp);
    if (!stored) throw new Error('Failed to store OTP');

    const sent = await sendEmail(
      email,
      'Portal Registration OTP',
      `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Verification Code</h2>
        <p>Your OTP for portal registration is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; margin: 20px 0;">${otp}</div>
        <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes.</p>
      </div>`
    );

    if (!sent) return res.status(500).json({ error: 'Failed to send email. Check SMTP settings.' });

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await verifyOtpDb(email, otp);
    if (isValid) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/auth/captcha', async (req, res) => {
  try {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 3,
      color: true,
      background: '#f8fafc'
    });
    const captchaId = `cap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await createCaptchaDb(captchaId, captcha.text);
    
    res.json({
      success: true,
      captchaId,
      data: captcha.data
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Login Authentication
apiRouter.post('/login', async (req, res) => {
  try {
    const { email, password, captchaId, captchaText } = req.body;
    
    // Verify Captcha
    if (!captchaId || !captchaText) {
      return res.status(400).json({ success: false, error: 'Captcha is required.' });
    }
    const isCaptchaValid = await verifyCaptchaDb(captchaId, captchaText);
    if (!isCaptchaValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired captcha.' });
    }

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
