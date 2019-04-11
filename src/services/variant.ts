import axios from 'axios'
import lodash from 'lodash'

const request = axios.create({
  baseURL: 'https://api.storelammoc.vn',
  timeout: 15e3,
  headers: { 'x-access-token': process.env.TOKEN_KEY },
})

export async function getVariantsByIds(ids: string[]) {
  try {
    let variants = []
    const length = ids.length
    let loopIdx = 0
    const maxPerProcess = 100
    const loopCount = Math.round(length / maxPerProcess + 0.49)

    while (loopIdx < loopCount) {
      const processingIds = ids.slice(loopIdx * maxPerProcess, (loopIdx + 1) * maxPerProcess)

      const response = await request.post(`/v1/variants`, {
        variants: processingIds,
      })
      variants.push(response.data)
      loopIdx++
    }
    // console.log(variants)
    return lodash.flatten(variants)
  } catch (e) {
    throw e
  }
}
