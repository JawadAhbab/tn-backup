import path from 'path'
import { time } from 'tn-time'
import { BackupConfigsSave } from './backupConfigs'

export const backupPath = (save: BackupConfigsSave) => {
  const { filename, frequency } = save
  const maxtime = 6307200000000 // 200 years

  const moment = time()
  let dispdate: string
  let dateid: number

  if (frequency === 'everytime') {
    dispdate = moment.format('dd.mm.Y-HH.ii.ss')
    const roundtime = new Date(moment.format('d-M-Y H:i:s')).getTime()
    dateid = Math.round((maxtime - roundtime) / 1000)
  } else if (frequency === 'minutely') {
    dispdate = moment.format('dd.mm.Y-HH.ii')
    const roundtime = new Date(moment.format('d-M-Y H:i')).getTime()
    dateid = Math.round((maxtime - roundtime) / (1000 * 60))
  } else if (frequency === 'hourly') {
    dispdate = moment.format('dd.mm.Y-HH.00')
    const roundtime = new Date(moment.format('d-M-Y H:{00}')).getTime()
    dateid = Math.round((maxtime - roundtime) / (1000 * 60 * 60))
  } else if (frequency === 'daily') {
    dispdate = moment.format('dd.mm.Y')
    const roundtime = new Date(moment.format('d-M-Y')).getTime()
    dateid = Math.round((maxtime - roundtime) / (1000 * 60 * 60 * 24))
  } else if (frequency === 'monthly') {
    dispdate = moment.format('MM-Y')
    const roundtime = new Date(moment.format('1-M-Y')).getTime()
    dateid = Math.round((maxtime - roundtime) / (1000 * 60 * 60 * 24 * 30))
  } else if (frequency === 'yearly') {
    dispdate = moment.format('Y')
    const roundtime = new Date(moment.format('1-{Jan}-Y')).getTime()
    dateid = Math.round((maxtime - roundtime) / (1000 * 60 * 60 * 24 * 364))
  }

  const savepath = path.join(save.path, dateid + `-${filename}-` + dispdate + '.zip')
  return path.isAbsolute(savepath) ? savepath : path.join(process.cwd(), savepath)
}
