import * as dotenv from 'dotenv'
import axios from "axios";
import moment from 'moment'
import {type} from "os";

dotenv.config();

var since = moment().startOf('day').subtract(1, 'days').format()
var untill = moment().endOf('day').subtract(1, 'days').format()
var filter = {
    params: {
        apiVersion: 2,
        limit: 5,
        since: since,
        until: untill
    }
};


const instance = axios.create({
    baseURL: 'https://api.storelammoc.vn/orders/',
    timeout: 15e3,
    headers: {'x-access-token': process.env.TOKEN_KEY},
});


export function getData(options: { since: Date, util: Date, limit?: number }) {
    try {
        // if (moment(since).isValid()) {
        //     throw new Error('since_error')
        // }
        return instance.get(`/customerAgencies/agencies/57e7af98b52ee4d36dc6c7c8`, {
            params: {
                apiVersion: 2,
                ...options
            }
        })
    } catch (error) {
        throw error
    }
}

