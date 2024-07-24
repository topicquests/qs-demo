// jest.config.js
// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts', 'tsx'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest', // Use @vue/vue3-jest to handle .vue files
    '^.+\\.tsx?$': 'ts-jest', // Use ts-jest to handle .ts and .tsx files
    '^.+\\.js$': 'babel-jest', // Use babel-jest to handle .js files
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Resolve @ to src folder
  },
};
