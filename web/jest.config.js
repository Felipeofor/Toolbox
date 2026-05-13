module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  setupFiles: ['<rootDir>/jest.env.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|svg)$': '<rootDir>/test/__mocks__/styleMock.js'
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  testMatch: ['<rootDir>/test/**/*.test.jsx', '<rootDir>/test/**/*.test.js']
}
