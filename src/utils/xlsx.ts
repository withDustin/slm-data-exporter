import moment from 'moment';
import path from 'path'
import * as xlsx from "node-xlsx";
import fs from "fs";

export function createXlSXfile(option: { data: any[][], dirName: string }) {
    const date = moment().add(-1, 'days').format('DD-MM-YYYY').toString()
    var buffer = xlsx.build([{data: option.data, name: 'Report ' + date}])
    fs.writeFileSync(path.resolve(option.dirName, 'abc.xlsx'), buffer, {flag: 'w+'})
    console.log('Export XLSX Done !')
}