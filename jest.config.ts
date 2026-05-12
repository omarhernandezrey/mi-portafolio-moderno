import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/unit/**/*.test.ts',
    '**/__tests__/unit/**/*.test.tsx',
    '**/__tests__/integration/**/*.test.ts',
  ],
  testTimeout: 15000,
  collectCoverageFrom: [
    'src/lib/chatbot/**/*.ts',
    'src/config/env.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: { lines: 70, functions: 70 },
  },
};

export default createJestConfig(config);
