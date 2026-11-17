import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

// La transformación la hace el SWC de `next/jest`, no ts-jest: el bloque
// `globals['ts-jest']` que había aquí era configuración muerta (T-24).
// `tsconfig.jest.json` sigue existiendo, pero como config de TYPECHECK de
// los tests (`npx tsc -p tsconfig.jest.json`), no de transformación.
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
    'src/lib/chatbot/payments.ts',       // helpers de pago (onboarding) — con test unitario
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: { lines: 70, functions: 70 },
  },
};

export default createJestConfig(config);
