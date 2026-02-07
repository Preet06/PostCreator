const { protect } = require('../../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');

jest.mock('jsonwebtoken');
jest.mock('../../src/models/User');

describe('AuthMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            cookies: {},
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should call next if token is valid (cookie)', async () => {
        req.cookies.token = 'valid-token';
        jwt.verify.mockReturnValue({ id: 'user123' });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ _id: 'user123', email: 'test@test.com' })
        });

        await protect(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user._id).toBe('user123');
    });

    it('should call next if token is valid (header)', async () => {
        req.headers.authorization = 'Bearer valid-token';
        jwt.verify.mockReturnValue({ id: 'user123' });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ _id: 'user123', email: 'test@test.com' })
        });

        await protect(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no token found', async () => {
        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('no token') });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
        req.cookies.token = 'invalid-token';
        jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('token failed') });
    });

    it('should return 401 if user not found in database', async () => {
        req.cookies.token = 'valid-token';
        jwt.verify.mockReturnValue({ id: 'missing' });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('user not found') });
    });
});
