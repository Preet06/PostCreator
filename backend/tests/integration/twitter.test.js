const request = require('supertest');
const app = require('../../src/app');
const dbHandler = require('./setup');
const User = require('../../src/models/User');
const axios = require('axios');

// Use jest.mock for axios
jest.mock('axios');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Twitter API Integration Tests', () => {
    let authCookie;
    let userId;

    beforeEach(async () => {
        const user = { name: 'Twitter Tester', email: 'twitter@test.com', password: 'password123' };
        await request(app).post('/api/auth/register').send(user);
        const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
        authCookie = loginRes.headers['set-cookie'];

        const dbUser = await User.findOne({ email: user.email });
        userId = dbUser._id;
    });

    describe('GET /api/twitter/connect', () => {
        it('should return a valid Twitter OAuth URL and set cookies', async () => {
            const res = await request(app)
                .get('/api/twitter/connect')
                .set('Cookie', authCookie);

            expect(res.statusCode).toEqual(200);
            expect(res.body.url).toContain('https://twitter.com/i/oauth2/authorize');
            expect(res.body.url).toContain('client_id');
            expect(res.headers['set-cookie']).toBeDefined(); // state and verifier
        });
    });

    describe('GET /api/twitter/callback', () => {
        it('should handle callback and store tokens', async () => {
            // First get the state/verifier cookies
            const connectRes = await request(app)
                .get('/api/twitter/connect')
                .set('Cookie', authCookie);

            const cookies = connectRes.headers['set-cookie'];

            // Mock Twitter Token Exchange
            axios.post.mockResolvedValue({
                data: {
                    access_token: 'mock-access-token',
                    refresh_token: 'mock-refresh-token',
                    expires_in: 7200
                }
            });

            // Mock Twitter User Info
            axios.get.mockResolvedValue({
                data: {
                    data: {
                        id: '12345',
                        username: 'mocktwitter'
                    }
                }
            });

            // Extract state from cookie
            const stateCookie = cookies.find(c => c.includes('twitter_oauth_state'));
            const state = stateCookie.split('=')[1].split(';')[0];

            const callbackRes = await request(app)
                .get(`/api/twitter/callback?code=abc&state=${state}`)
                .set('Cookie', [...cookies, ...authCookie]);

            expect(callbackRes.statusCode).toEqual(302); // Redirect back to frontend
            expect(callbackRes.headers.location).toContain('status=success');

            const user = await User.findById(userId);
            expect(user.twitterTokens.accessToken).toEqual('mock-access-token');
            expect(user.twitterTokens.username).toEqual('mocktwitter');
        });
    });
});
