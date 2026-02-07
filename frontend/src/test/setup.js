import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock framer-motion to avoid ESM issues
jest.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: () => {
            return ({ children, ...props }) => children;
        }
    }),
    AnimatePresence: ({ children }) => children,
}));

// Mock Lucide icons as they can be tricky in tests
jest.mock('lucide-react', () => {
    const actual = jest.requireActual('lucide-react');
    return {
        ...actual,
        // Add specific mocks if needed, or just let them be
    };
});

// Mock browser APIs not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
