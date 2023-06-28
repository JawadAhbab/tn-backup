import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
export type BackupConfigsExclude = string | { regexp: string }
export type BackupConfigsSave = {
  filename: string
  path: string
  frequency: 'everytime' | 'minutely' | 'hourly' | 'daily' | 'monthly' | 'yearly'
}
export interface BackupConfigs {
  base: string
  excludes: BackupConfigsExclude[]
  includes: string[]
  saves: BackupConfigsSave[]
}

export const backupConfigs = async () => {
  const configpath = path.join(process.cwd(), 'backup.configs.json')
  if (!fs.existsSync(configpath)) {
    return console.log(
      chalk.bgRed.whiteBright(' ERROR '),
      chalk.visible('Could not find'),
      chalk.yellow.bold.italic('backup.configs.json'),
      chalk.visible('file into the'),
      chalk.cyan.bold.italic('root'),
      chalk.visible('folder\n')
    )
  }

  let config: BackupConfigs
  try {
    config = fs.readJSONSync(configpath)
  } catch {
    return console.log(
      chalk.bgRed.whiteBright(' ERROR '),
      chalk.visible('Invalid config file'),
      chalk.red.bold.italic('backup.configs.json\n')
    )
  }

  return config
}
