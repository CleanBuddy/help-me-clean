module.exports = {
  preset: 'react-native',
  setupFiles: ['./src/__tests__/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|nativewind)',
  ],
  moduleNameMapper: {
    '^@helpmeclean-mobile/shared$': '<rootDir>/src/__mocks__/shared.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
};
