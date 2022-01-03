export default {
  rootDir: '../',
  testMatch: ['<rootDir>/**/*.test.js'],
  transform: {
    '^.+\\.(t|j)s?$': '@swc/jest'
  }
}
