module.exports = {
  singleQuote: true,
  semi: false,
  useTabs: false,
  tabWidth: 2,
  printWidth: 120,
  arrowParens: 'always',
  importOrder: ['^(react/(.*)$)|^(react$)', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [require('@trivago/prettier-plugin-sort-imports')],
}
