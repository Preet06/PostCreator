const request = require('supertest');
const app = require('../../src/app');
const dbHandler = require('./setup');
const User = require('../../src/models/User');
const Post = require('../../src/models/Post');
const generationService = require('../../src/services/generationService');

// Mock generation service
jest.mock('../../src/services/generationService');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Post API Integration Tests', () => {
    let authCookie;
    let userId;

    beforeEach(async () => {
        // Clear collections to ensure clean state
        await User.deleteMany({});
        await Post.deleteMany({});

        // Create user directly via model for faster/more reliable setup
        const user = await User.create({
            name: 'Post Tester',
            email: 'post@test.com',
            passwordHash: 'password123' // Pre-save hook will hash
        });
        userId = user._id;

        // Login to get auth cookie
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'post@test.com', password: 'password123' });

        authCookie = loginRes.headers['set-cookie'];
    });

    describe('POST /api/posts', () => {
        it('should create a new post successfully', async () => {
            const postData = {
                content: 'Integration test post content',
                scheduledAt: new Date(Date.now() + 3600000).toISOString(),
                status: 'scheduled'
            };

            const res = await request(app)
                .post('/api/posts')
                .set('Cookie', authCookie)
                .send(postData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.data.content).toEqual(postData.content);
            expect(res.body.data.userId).toEqual(userId.toString());
            expect(res.body.data.status).toEqual('scheduled');

            const post = await Post.findById(res.body.data._id);
            expect(post).toBeTruthy();
            expect(post.content).toEqual(postData.content);
        });

        it('should return 400 for invalid content', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('Cookie', authCookie)
                .send({ content: '' });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('PUT /api/posts/:id', () => {
        it('should update a post successfully', async () => {
            const post = await Post.create({ userId, content: 'Original content' });
            const updateData = { content: 'Updated content', status: 'draft' };

            const res = await request(app)
                .put(`/api/posts/${post._id}`)
                .set('Cookie', authCookie)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.content).toEqual(updateData.content);
        });

        it('should return 404 for non-existent post', async () => {
            const res = await request(app)
                .put('/api/posts/65c1234567890abcdef12345')
                .set('Cookie', authCookie)
                .send({ content: 'Update' });

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /api/posts/:id', () => {
        it('should delete a post', async () => {
            const post = await Post.create({ userId, content: 'To be deleted' });

            const res = await request(app)
                .delete(`/api/posts/${post._id}`)
                .set('Cookie', authCookie);

            expect(res.statusCode).toEqual(200);

            const deletedPost = await Post.findById(post._id);
            expect(deletedPost).toBeNull();
        });
    });

    describe('POST /api/posts/generate', () => {
        it('should generate variations successfully', async () => {
            generationService.generatePostVariations.mockResolvedValue([
                { type: 'original', content: 'v1' },
                { type: 'emoji', content: 'v2' }
            ]);

            const res = await request(app)
                .post('/api/posts/generate')
                .set('Cookie', authCookie)
                .send({ content: 'Test prompt' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/posts/calendar', () => {
        it('should fetch posts for a specific month', async () => {
            const date = new Date();
            await Post.create({
                userId,
                content: 'Calendar post',
                status: 'scheduled',
                scheduledAt: date
            });

            const res = await request(app)
                .get('/api/posts/calendar')
                .set('Cookie', authCookie)
                .query({ month: date.getMonth() + 1, year: date.getFullYear() });

            expect(res.statusCode).toEqual(200);
            const dateKey = date.toISOString().split('T')[0];
            expect(res.body.data[dateKey]).toBeDefined();
        });
    });

    describe('GET /api/posts', () => {
        beforeEach(async () => {
            await Post.create([
                { userId, content: 'Post 1', status: 'scheduled' },
                { userId, content: 'Post 2', status: 'published' }
            ]);
        });

        it('should fetch all posts for the authenticated user', async () => {
            const res = await request(app)
                .get('/api/posts')
                .set('Cookie', authCookie);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toEqual(2);
        });
    });

    describe('DELETE /api/posts/bulk', () => {
        it('should delete multiple posts', async () => {
            const p1 = await Post.create({ userId, content: 'P1' });
            const p2 = await Post.create({ userId, content: 'P2' });

            const res = await request(app)
                .delete('/api/posts/bulk')
                .set('Cookie', authCookie)
                .send({ postIds: [p1._id, p2._id] });

            expect(res.statusCode).toEqual(200);
            expect(res.body.deletedCount).toEqual(2);
        });
    });
});
