module.exports = {
  rootDir: '.',
  testMatch: ['<rootDir>/**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)s?$': '@swc/jest'
  }
}
