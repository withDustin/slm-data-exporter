import * as dotenv from 'dotenv'
import axios from "axios";
import moment from 'moment';
import lodash from 'lodash';
import path from "path";
import * as xlsx from "node-xlsx";
import fs from "fs";
import {config} from "dotenv";
import {getVariantByIds} from "./variant";


const xlsxHeader = ['Phieu Xuat', 'Ngay', 'Ma Khach Hang', 'Ten Khach Hang', 'Ma Hang', 'Ten Hang', 'So Luong', 'Don Gia', 'Trang Thai'];

const since = moment(new Date('04/01/2019').toISOString()).startOf('day').toDate()
const util = moment().add(-1, 'days').endOf('day').toDate()

console.log(util)

const date = moment().subtract(1, 'days').format('DD-MM-YYYY').toString()

// let dirWriteFile = `${__dirname}/exportData/Order-Report-` + date + `.xlsx`
let dirWriteFile = path.resolve('src/exportData/', 'abc.xlsx')
if (process.env.NODE_ENV === 'development') {
    require('dotenv').config()
}

const request = axios.create({
    baseURL: 'https://api.storelammoc.vn/orders',
    timeout: 15e3,
    headers: {'x-access-token': process.env.TOKEN_KEY},
});

export async function getData(options: { since: Date, util: Date, limit?: number }) {
    try {
        const response = await request.get(`/customerAgencies/agencies/57e7af98b52ee4d36dc6c7c8`, {
            params: {
                apiVersion: 2,
                ...options
            }
        })
        return response.data
    } catch (error) {
        throw error
    }

}

export async function processData() {
    const a = await getData({since, limit: 10000, util})
    let rawData = a.customerAgencyOrders;
    let data = []

    let variantIds = []
    for (let z in rawData) {
        for (let y in rawData[z].items) {
            let item = rawData[z].items[y];
            variantIds.push(item.variant.id)
        }
    }

    const variants = await getVariantByIds(variantIds);
    const variantEntities = lodash.keyBy(variants, '_id')

    for (let i in rawData) {
        let order = rawData[i]
        for (let x in rawData[i].items) {
            let itemData = []
            let item = rawData[i].items[x];
            let productLink = 'https://storelammoc.vn/products/' + item.product.id + '?variantId=' + item.variant.id
            let itemName = item.product.name + ' ( ' + item.variant.name + ' )'
            let orderCreatedAt = moment(new Date(order.createdAt)).format('DD-MM-YYYY HH:mm')
            itemData.push('CO' + order._id, orderCreatedAt, order.customerInfo.phone, order.customerInfo.name, lodash.get(variantEntities, `${item.variant.id}.sku`), itemName, item.quantity, item.price, order.status,)
            data.push(itemData)
        }
    }

    data.unshift(xlsxHeader)
    // console.log(JSON.stringify(rawData[0], null, '\t'))

    return data
}


//check hasmore = true ? loop
// check exist file in index ( when start up)
//get orders, process orders => array data excell, exportxlsx