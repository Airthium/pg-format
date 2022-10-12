const jestConfig = {
  rootDir: '.',
  testMatch: ['<rootDir>/**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)s?$': '@swc/jest'
  }
}

export default jestConfig
