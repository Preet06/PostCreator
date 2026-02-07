// Mock Winston Logger
jest.mock('winston', () => ({
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        printf: jest.fn(),
        colorize: jest.fn(),
        json: jest.fn(),
    },
    createLogger: jest.fn().mockReturnValue({
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }),
    transports: {
        Console: jest.fn(),
        File: jest.fn(),
    },
}));

// Mock Azure Application Insights
jest.mock('applicationinsights', () => ({
    setup: jest.fn().mockReturnThis(),
    setAutoDependencyCorrelation: jest.fn().mockReturnThis(),
    setAutoCollectRequests: jest.fn().mockReturnThis(),
    setAutoCollectPerformance: jest.fn().mockReturnThis(),
    setAutoCollectExceptions: jest.fn().mockReturnThis(),
    setAutoCollectDependencies: jest.fn().mockReturnThis(),
    setAutoCollectConsole: jest.fn().mockReturnThis(),
    setUseDiskRetryCaching: jest.fn().mockReturnThis(),
    start: jest.fn(),
    defaultClient: {
        trackEvent: jest.fn(),
        trackException: jest.fn(),
        trackMetric: jest.fn(),
        trackTrace: jest.fn(),
        trackDependency: jest.fn(),
    },
}));

// Set environment variables for testing
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.TWITTER_CLIENT_ID = 'test-client-id';
process.env.TWITTER_CLIENT_SECRET = 'test-client-secret';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';
