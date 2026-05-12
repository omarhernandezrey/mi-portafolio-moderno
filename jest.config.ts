import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  globals: {
    'ts-jest': { tsconfig: 'tsconfig.jest.json' },
  },
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
    'src/lib/chatbot/*.ts',            // módulos core del chatbot
    'src/config/env.ts',
    '!src/lib/chatbot/providers/**',   // excluir wrappers de APIs externas (no testeables sin llamadas reales)
    '!src/lib/chatbot/groq.ts',        // reexport delegado a llm.ts
    '!src/lib/chatbot/telegram.ts',    // requiere Telegram Bot API real
    '!src/lib/chatbot/email.ts',       // requiere Resend real
    '!src/lib/chatbot/notion.ts',      // requiere Notion API real
    '!src/lib/chatbot/rag.ts',           // requiere HuggingFace + pgvector reales
    '!src/lib/chatbot/llm.ts',           // orquestador que depende de todos los providers
    '!src/lib/chatbot/contactBridge.ts', // bridge a API externa de contacto
    '!src/config/env.ts',                // lector de process.env — requiere vars reales
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: { lines: 70, functions: 70 },
  },
};

export default createJestConfig(config);
