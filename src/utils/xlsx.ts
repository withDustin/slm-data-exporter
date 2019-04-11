import path from 'path'
import * as xlsx from 'node-xlsx'
import fs from 'fs'

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const EXPORTS_PATH = process.env.DIR_NAME || 'exports'

export function createXlSXfile(options: { data: any[][]; fileName: string; title: string }) {
  const data = options.data
  data.unshift([options.title.toUpperCase()], [])
  const range = { s: { c: 0, r: 0 }, e: { c: data[3].length - 1, r: 0 } }
  const XLSXOption = { '!merges': [range] }

  const buffer = xlsx.build([{ data: options.data, name: 'Report ' }], XLSXOption)


  return fs.writeFileSync(path.resolve(EXPORTS_PATH, `${options.fileName}.xlsx`), buffer, {
    flag: 'w+',
  })
}
