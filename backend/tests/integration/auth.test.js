const request = require('supertest');
const app = require('../../src/app');
const dbHandler = require('./setup');
const User = require('../../src/models/User');
const crypto = require('crypto');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Auth API Integration Tests', () => {
    const mockUser = {
        name: 'Integration Test User',
        email: 'test@integration.com',
        password: 'password123'
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(mockUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body.email).toEqual(mockUser.email);
            expect(res.body.name).toEqual(mockUser.name);
            expect(res.body).not.toHaveProperty('passwordHash');

            const user = await User.findOne({ email: mockUser.email });
            expect(user).toBeTruthy();
            expect(user.name).toEqual(mockUser.name);
        });

        it('should return 400 if user already exists', async () => {
            // First registration
            await request(app).post('/api/auth/register').send(mockUser);

            const res = await request(app)
                .post('/api/auth/register')
                .send(mockUser);

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toMatch(/already exists/i);
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'only@email.com' });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').send(mockUser);
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: mockUser.email,
                    password: mockUser.password
                });

            expect(res.statusCode).toEqual(200);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.body.email).toEqual(mockUser.email);
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: mockUser.email,
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toMatch(/invalid/i);
        });
    });

    describe('GET /api/auth/me', () => {
        let authCookie;

        beforeEach(async () => {
            await request(app).post('/api/auth/register').send(mockUser);
            const loginRes = await request(app).post('/api/auth/login').send({
                email: mockUser.email,
                password: mockUser.password
            });
            authCookie = loginRes.headers['set-cookie'];
        });

        it('should fetch user profile with valid cookie', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', authCookie);

            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toEqual(mockUser.email);
        });

        it('should return 401 without cookie', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Password Reset Flow', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').send(mockUser);
        });



        it('should return 404 if user not found for forgot password', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@test.com' });

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should reset password with valid token', async () => {
            const rawToken = 'testtoken123';
            const hashedToken = crypto
                .createHash('sha256')
                .update(rawToken)
                .digest('hex');

            await User.findOneAndUpdate(
                { email: mockUser.email },
                {
                    resetPasswordToken: hashedToken,
                    resetPasswordExpire: Date.now() + 3600000
                }
            );

            const res = await request(app)
                .put(`/api/auth/reset-password/${rawToken}`)
                .send({ password: 'newpassword456' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.headers['set-cookie']).toBeDefined();

            const user = await User.findOne({ email: mockUser.email });
            const isMatch = await user.comparePassword('newpassword456');
            expect(isMatch).toBe(true);
        });

        it('should return 400 for invalid or expired token', async () => {
            const res = await request(app)
                .put('/api/auth/reset-password/invalidtoken')
                .send({ password: 'newpassword456' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toMatch(/invalid or expired/i);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout and clear cookie', async () => {
            await request(app).post('/api/auth/register').send(mockUser);
            const loginRes = await request(app).post('/api/auth/login').send({
                email: mockUser.email,
                password: mockUser.password
            });
            const cookie = loginRes.headers['set-cookie'];

            if (!cookie) {
                throw new Error('Login failed: No cookie returned');
            }

            const res = await request(app)
                .post('/api/auth/logout')
                .set('Cookie', cookie);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/token=(none|;)/i);
        });
    });
});
