import Zip from 'adm-zip'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import bytes from 'bytes'
import prettyms from 'pretty-ms'
import { backupConfigs } from './utils/backupConfigs'
import { backupFileLister } from './utils/backupFileLister'
import { backupPath } from './utils/backupPath'
console.clear()
run()

async function run() {
  const config = await backupConfigs()
  if (!config) return

  const startzip = new Date().getTime()
  const zip = new Zip()
  const filelist = backupFileLister(config)
  filelist.forEach(({ directory, fullpath, relfolder }) => {
    if (directory) return zip.addFile(relfolder, null)
    zip.addLocalFile(fullpath, relfolder === '.' ? '' : relfolder)
  })

  const size = zip.getEntries().map((en) => en.getData().length).reduce((a, b) => a + b, 0) // prettier-ignore
  const comSize = zip.getEntries().map((en) => en.getCompressedData().length).reduce((a, b) => a + b, 0) // prettier-ignore
  const comPercent = (comSize * 100) / size

  config.saves.forEach((save) => {
    const savepath = backupPath(save)
    fs.ensureDirSync(path.dirname(savepath))
    zip.writeZip(savepath)
  })
  const endzip = new Date().getTime()

  console.log()
  console.log(chalk.bgGreen.black('       Backup Successful       '), '\n')
  console.log(chalk.bold('    Files       '), chalk.dim(':'), filelist.filter(i => !i.directory).length) // prettier-ignore
  console.log(chalk.bold('    Folders     '), chalk.dim(':'), filelist.filter(i => i.directory).length) // prettier-ignore
  console.log(chalk.bold('    Time        '), chalk.dim(':'), chalk.red.bold(prettyms(endzip - startzip))) // prettier-ignore
  console.log(chalk.bold('    Saves       '), chalk.dim(':'), config.saves.length) // prettier-ignore
  console.log(chalk.bold('    Size        '), chalk.dim(':'), bytes(size, { unitSeparator: ' ', fixedDecimals: true })) // prettier-ignore
  console.log(chalk.bold('    Zipped      '), chalk.dim(':'), bytes(comSize, { unitSeparator: ' ', fixedDecimals: true })) // prettier-ignore
  console.log(chalk.bold('    Ratio       '), chalk.dim(':'), comPercent.toFixed(2) + ' %') // prettier-ignore

  const barsize = 31
  const bars = Math.round((comPercent / 100) * barsize)
  console.log('\n' + chalk.bgWhite(' '.repeat(bars)) + chalk.bgGrey(' '.repeat(barsize - bars)))
  console.log()
}
