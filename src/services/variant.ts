import axios from 'axios'
if (process.env.NODE_ENV === 'development') {
    require('dotenv').config()
}


const request = axios.create({
    baseURL: 'https://api.storelammoc.vn',
    timeout: 15e3,
    headers: {'x-access-token': process.env.TOKEN_KEY},
});



export async function getVariantByIds(ids: string[]) {
    try {
        const response = await request.post(`/v1/variants`, {
            variants: ids
        })
        return response.data
    } catch (e) {
        throw e
    }
}
