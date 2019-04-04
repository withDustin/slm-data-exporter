import {getData} from "./services";
import fs from 'fs';
import path from 'path';
import * as xlsx from 'node-xlsx';
import moment from "moment";
import {config} from "dotenv";

console.log('\n\n\n\n');
let header = ['So Phieu Xuat', 'Ngay', 'Ma Khach Hang', 'Ten Khach Hang', 'Ma Hang', 'Ten Hang', 'So Luong', 'Don Gia', 'Thanh Tien', 'Trang Thai'];

(async () => {
    const since = moment().startOf('day').subtract(1, 'days').toDate()

    const util = moment().endOf('day').subtract(1, 'days').toDate()
    const a = await getData({since, limit: 1000, util})

    let rawData = a.data.customerAgencyOrders;
    let data = []
    console.log(JSON.stringify(rawData[0], null, '\t'))


    for (let i in rawData) {
        for (let x in rawData[i].items) {
            let singleData = []
            singleData.push(rawData[i]._id, rawData[i].createdAt, rawData[i].customerInfo.phone, rawData[i].customerInfo.name, rawData[i].items[x].variant.id, rawData[i].items[x].product.name + ' - ' + rawData[i].items[x].variant.name, rawData[i].items[x].quantity, rawData[i].items[x].price, rawData[i].items[x].quantity * rawData[i].items[x].price, rawData[i].status)
            data.push(singleData)
        }
    }
    data.unshift(header)
    console.log(data)
    var buffer = xlsx.build([{data: data, name: 'kjhk'}]);
    let date = moment().startOf('day').format('DDMMYYYY').toString()
    let dirWriteFile = `${__dirname}/exportData/abc.xlsx`
    let dir = path.join(__dirname, `/exportData/`)
// let data[]



    if (!fs.existsSync(path.join(__dirname, `/exportData/`))) {
        fs.mkdirSync(dir, {recursive: false})
        fs.writeFileSync(dir, {flag: 'w+'})
    } else {
        fs.writeFileSync(dirWriteFile, buffer, {flag: 'w+'})
    }
})();



