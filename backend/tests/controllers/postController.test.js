const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const postController = require('../../src/controllers/postController');
const Post = require('../../src/models/Post');
const JobQueue = require('../../src/models/JobQueue');

// Mock generation service
jest.mock('../../src/services/generationService', () => ({
    generatePostVariations: jest.fn().mockResolvedValue(['v1', 'v2', 'v3'])
}));

let mongoServer;
const app = express();
app.use(express.json());

const reqUser = { _id: new mongoose.Types.ObjectId() };
let currentUser = reqUser;

// Mock auth middleware for testing
app.use((req, res, next) => {
    req.user = currentUser;
    next();
});

app.post('/api/posts/generate', postController.generateVariations);
app.post('/api/posts', postController.createPost);
app.get('/api/posts', postController.getMyPosts);
app.get('/api/posts/calendar', postController.getCalendarPosts);
app.delete('/api/posts/bulk', postController.bulkDeletePosts);
app.put('/api/posts/:id', postController.updatePost);
app.delete('/api/posts/:id', postController.deletePost);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Post.deleteMany({});
    await JobQueue.deleteMany({});
    currentUser = reqUser; // Reset
});

describe('postController', () => {
    describe('POST /api/posts/generate', () => {
        it('should generate variations successfully', async () => {
            const res = await request(app)
                .post('/api/posts/generate')
                .send({ content: 'Generate this' });
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(['v1', 'v2', 'v3']);
        });

        it('should return 400 if content too long', async () => {
            const res = await request(app)
                .post('/api/posts/generate')
                .send({ content: 'a'.repeat(501) });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/posts', () => {
        it('should create a new post and enqueue a job if scheduled', async () => {
            const scheduledDate = new Date(Date.now() + 100000);
            const res = await request(app)
                .post('/api/posts')
                .send({
                    content: 'Test post',
                    status: 'scheduled',
                    scheduledAt: scheduledDate.toISOString()
                });

            expect(res.statusCode).toBe(201);
            const queueEntry = await JobQueue.findOne({ postId: res.body.data._id });
            expect(queueEntry).not.toBeNull();
        });

        it('should create a draft WITHOUT enqueuing a job', async () => {
            const res = await request(app)
                .post('/api/posts')
                .send({ content: 'Draft post', status: 'draft' });
            expect(res.statusCode).toBe(201);
            const queueEntry = await JobQueue.findOne({ postId: res.body.data._id });
            expect(queueEntry).toBeNull();
        });

        it('should return 400 if scheduled time in past', async () => {
            const res = await request(app).post('/api/posts').send({
                content: 'fail',
                status: 'scheduled',
                scheduledAt: new Date(Date.now() - 10000).toISOString()
            });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/posts', () => {
        it('should get posts with search/filter', async () => {
            await Post.create([
                { content: 'Matching', status: 'published', userId: reqUser._id },
                { content: 'Other', status: 'draft', userId: reqUser._id }
            ]);
            const res = await request(app).get('/api/posts?search=match&status=published');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
        });
    });

    describe('PUT /api/posts/:id', () => {
        it('should update post and queue', async () => {
            const post = await Post.create({ content: 'Old', userId: reqUser._id });
            const newDate = new Date(Date.now() + 20000);
            const res = await request(app)
                .put(`/api/posts/${post._id}`)
                .send({
                    content: 'Updated',
                    status: 'scheduled',
                    scheduledAt: newDate.toISOString()
                });
            expect(res.statusCode).toBe(200);
            const queueEntry = await JobQueue.findOne({ postId: post._id });
            expect(queueEntry).not.toBeNull();
        });

        it('should return 401 if not owner', async () => {
            const post = await Post.create({ content: 'p', userId: new mongoose.Types.ObjectId() });
            const res = await request(app).put(`/api/posts/${post._id}`).send({ content: 'h' });
            expect(res.statusCode).toBe(401);
        });

        it('should return 404 for missing post', async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app).put(`/api/posts/${id}`).send({ content: 'f' });
            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/posts/:id', () => {
        it('should delete post', async () => {
            const post = await Post.create({ content: 'p', userId: reqUser._id });
            const res = await request(app).delete(`/api/posts/${post._id}`);
            expect(res.statusCode).toBe(200);
        });

        it('should return 401 if not owner', async () => {
            const post = await Post.create({ content: 'p', userId: new mongoose.Types.ObjectId() });
            const res = await request(app).delete(`/api/posts/${post._id}`);
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/posts/calendar', () => {
        it('should return grouped posts', async () => {
            const date = new Date(Date.UTC(2025, 0, 15, 12, 0, 0));
            await Post.create({
                content: 'Jan Post',
                scheduledAt: date,
                status: 'scheduled',
                userId: reqUser._id
            });
            const res = await request(app).get('/api/posts/calendar?month=1&year=2025');
            expect(res.statusCode).toBe(200);
            expect(res.body.data['2025-01-15']).toBeDefined();
        });
    });

    describe('DELETE /api/posts/bulk', () => {
        it('should delete multiple', async () => {
            const p1 = await Post.create({ content: 'P1', userId: reqUser._id });
            const p2 = await Post.create({ content: 'P2', userId: reqUser._id });
            const res = await request(app)
                .delete('/api/posts/bulk')
                .send({ postIds: [p1._id, p2._id] });
            expect(res.statusCode).toBe(200);
            expect(res.body.deletedCount).toBe(2);
        });

        it('should return 400 for invalid ids', async () => {
            const res = await request(app).delete('/api/posts/bulk').send({ postIds: 'invalid' });
            expect(res.statusCode).toBe(400);
        });
    });
});
