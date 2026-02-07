export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(framer-motion|lucide-react)/)',
    ],
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/main.jsx',
        '!src/test/**',
        '!src/api/**',
    ],
    testMatch: [
        '<rootDir>/src/**/*.test.{js,jsx}',
    ],
    moduleFileExtensions: ['js', 'jsx'],
};
