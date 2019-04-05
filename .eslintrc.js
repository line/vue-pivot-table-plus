module.exports = {
  root: true,
  env: {
    browser: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2018
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  plugins: [
    'vue'
  ],
  rules: {
    'indent': [1, 2],
    'vue/html-indent': [1, 2],
    'camelcase': 0,
    'vue/no-use-v-if-with-v-for': 0,
    'no-unmodified-loop-condition': 0
  }
}
