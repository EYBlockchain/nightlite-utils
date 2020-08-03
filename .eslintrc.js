module.exports = {
  extends: "./node_modules/cod-scripts/eslint.js",
  globals: {
    'BigInt':true
  },
  rules: {
    'no-restricted-syntax': 'off',
    'no-plusplus': 'off',
    'no-bitwise': 'off',
    'no-constant-condition': 'off',
  }
};
