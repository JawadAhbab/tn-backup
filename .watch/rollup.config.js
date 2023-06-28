const { clilist, external, tsplug, getClifiles } = require('../rollup.preset')

module.exports = [{
  input: './src/index.ts',
  output: {
    file: './.watch/dist/index.js',
    format: 'cjs'
  },
  external,
  plugins: [tsplug(true, false)]
},
...getClifiles(clilist, true, {
  output: { format: 'cjs' },
  external,
  plugins: [tsplug()]
})]
