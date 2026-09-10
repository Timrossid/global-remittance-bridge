module.exports = {
  rootDir: '..',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '(src|test)/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  modulePaths: ['<rootDir>'],
  collectCoverageFrom: ['src/**/*.ts'],
  moduleNameMapper: {
    '^@nestjs/config$': '<rootDir>/test/common/mock-nestjs-config.ts',
    '^@stellar/stellar-sdk$': '<rootDir>/test/common/mock-stellar-sdk.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@stellar/stellar-sdk)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/common/setup-tests.ts'],
};
