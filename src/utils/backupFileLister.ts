import fs from 'fs-extra'
import path from 'path'
import { isString } from 'tn-validate'
import { BackupConfigs, BackupConfigsExclude } from './backupConfigs'
type Item = { directory: boolean; fullpath: string; relfolder: string }

export const backupFileLister = (config: BackupConfigs) => {
  const { base, excludes } = config
  const basepath = path.join(process.cwd(), base)
  return recursivelist(basepath, basepath, excludes)
}

const recursivelist = (
  basepath: string,
  ffpath: string,
  excludes: BackupConfigsExclude[]
): Item[] => {
  const list: Item[] = []
  fs.readdirSync(ffpath).forEach((dirent) => {
    const fullpath = path.join(ffpath, dirent)
    const relpath = path.relative(basepath, fullpath)
    const isExcluded = checkExclution(fullpath, excludes)
    if (isExcluded) return

    const isdir = fs.lstatSync(fullpath).isDirectory()
    if (!isdir) return list.push({ directory: false, fullpath, relfolder: path.dirname(relpath) })

    list.push({ directory: true, fullpath, relfolder: relpath + '/' })
    list.push(...recursivelist(basepath, fullpath, excludes))
  })
  return list.sort((a, b) => a.fullpath.length - b.fullpath.length)
}

const checkExclution = (ffpath: string, excludes: BackupConfigsExclude[]) => {
  for (const exclude of excludes) {
    if (isString(exclude)) {
      const excpath = path.join(process.cwd(), exclude)
      if (excpath == ffpath) return true
    } else {
      const regexp = new RegExp(exclude.regexp)
      if (ffpath.match(regexp)) return true
    }
  }
  return false
}
