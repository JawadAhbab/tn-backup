const pkg = require('./package.json')
const { clilist, external, tsplug, getClifiles } = require('./rollup.preset')

module.exports = [
  {
    input: './src/index.ts',
    output: { file: pkg.main, format: 'cjs' },
    external,
    plugins: [tsplug(true)],
  },
  ...getClifiles(clilist, false, {
    output: { format: 'cjs' },
    external,
    plugins: [tsplug()],
  }),
]
