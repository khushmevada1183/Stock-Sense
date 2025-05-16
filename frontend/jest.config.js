module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/cypress/e2e/',
    '<rootDir>/cypress/support/',
    '<rootDir>/cypress/fixtures/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/cypress/e2e/',
    '/cypress/support/',
    '/cypress/fixtures/',
    '/public/'
  ],
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/api/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/utils/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/cypress/unit/**/*.test.{js,jsx,ts,tsx}'
  ]
}; 