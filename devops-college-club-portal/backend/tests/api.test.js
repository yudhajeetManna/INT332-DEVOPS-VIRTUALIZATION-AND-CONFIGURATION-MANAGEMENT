/**
 * Backend API Tests
 * These tests use supertest against the Express app.
 * The DB connection is attempted; tests that require DB will be skipped
 * gracefully if no DB is available (CI without MySQL).
 */
const request = require('supertest');

// Set test env vars before requiring app
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_NAME = process.env.DB_NAME || 'college_club_db';
process.env.DB_USER = process.env.DB_USER || 'club_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'club_pass123';

let app;
let sequelize;
let dbAvailable = false;

beforeAll(async () => {
  try {
    const models = require('../src/models');
    sequelize = models.sequelize;
    await sequelize.authenticate();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }
  app = require('../src/server');
}, 15000);

afterAll(async () => {
  if (sequelize) {
    try { await sequelize.close(); } catch {}
  }
});

// ── Health Check (no DB needed) ──────────────────────────────────────────────
describe('Health Check', () => {
  it('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('time');
  });
});

// ── Auth Input Validation (no DB needed for 400s) ────────────────────────────
describe('Auth Input Validation', () => {
  it('POST /api/auth/register - missing all fields returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/auth/register - missing password returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login - empty body returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/auth/login - missing password returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' });
    expect(res.statusCode).toBe(400);
  });
});

// ── Auth Guard (no token = 401) ───────────────────────────────────────────────
describe('Auth Guard - Protected Routes', () => {
  const protectedRoutes = [
    { method: 'get', path: '/api/clubs' },
    { method: 'get', path: '/api/events' },
    { method: 'get', path: '/api/history' },
    { method: 'get', path: '/api/notifications' },
    { method: 'get', path: '/api/admin/dashboard' },
    { method: 'get', path: '/api/admin/users' },
    { method: 'get', path: '/api/admin/clubs' },
    { method: 'get', path: '/api/members' },
    { method: 'get', path: '/api/club/events' },
  ];

  protectedRoutes.forEach(({ method, path }) => {
    it(`${method.toUpperCase()} ${path} - no token returns 401`, async () => {
      const res = await request(app)[method](path);
      expect(res.statusCode).toBe(401);
    });
  });
});

// ── Role Guard (wrong role = 403) ─────────────────────────────────────────────
describe('Role Guard - Admin Routes with non-admin token', () => {
  const jwt = require('jsonwebtoken');
  const studentToken = jwt.sign(
    { id: 999, email: 'student@test.com', role: 'student', name: 'Test Student' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  it('GET /api/admin/dashboard - student token returns 403', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('POST /api/admin/create-club - student token returns 403', async () => {
    const res = await request(app)
      .post('/api/admin/create-club')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ club_name: 'Test', category: 'Technology' });
    expect(res.statusCode).toBe(403);
  });

  it('DELETE /api/admin/user/1 - student token returns 403', async () => {
    const res = await request(app)
      .delete('/api/admin/user/1')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// ── DB-dependent tests ────────────────────────────────────────────────────────
describe('Auth Flow (requires DB)', () => {
  const testEmail = `jest_${Date.now()}@test.com`;

  it('POST /api/auth/register - creates user and returns token', async () => {
    if (!dbAvailable) return console.log('  ⚠️  Skipped: no DB');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest User', email: testEmail, password: 'testpass123', role: 'student' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('student');
  });

  it('POST /api/auth/register - duplicate email returns 409', async () => {
    if (!dbAvailable) return console.log('  ⚠️  Skipped: no DB');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest User', email: testEmail, password: 'testpass123' });
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/login - invalid credentials returns 401', async () => {
    if (!dbAvailable) return console.log('  ⚠️  Skipped: no DB');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/auth/login - valid credentials returns token', async () => {
    if (!dbAvailable) return console.log('  ⚠️  Skipped: no DB');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'testpass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('GET /api/auth/me - valid token returns user', async () => {
    if (!dbAvailable) return console.log('  ⚠️  Skipped: no DB');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'testpass123' });
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testEmail);
  });
});
