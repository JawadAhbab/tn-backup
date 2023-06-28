const builtins = require('builtin-modules')
const pkg = require('./package.json')
const typescript = require('rollup-plugin-typescript2')

const clilist = [
  {
    input: './src/cli.ts',
    outname: 'cli.js',
  },
]

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...builtins,
]

const tsplug = function (declaration = false, useTsconfigDeclarationDir = true) {
  return typescript({
    useTsconfigDeclarationDir,
    tsconfigOverride: {
      compilerOptions: {
        declaration,
      },
    },
  })
}

const getClifiles = function (list, watch, template = { output: {} }) {
  let entries = []
  const outdir = watch ? './.watch/dist/' : './dist/'

  list.forEach((info) => {
    let entry = { ...template }
    entry.input = info.input
    entry.output.file = outdir + info.outname
    entry.output.banner = '#!/usr/bin/env node\n'
    entries.push(entry)
  })

  return entries
}

module.exports = {
  clilist,
  external,
  tsplug,
  getClifiles,
}
