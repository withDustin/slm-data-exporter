import axios from 'axios'
const request = axios.create({
  baseURL: 'https://api.storelammoc.vn/',
  timeout: 15e3,
  headers: { 'x-access-token': process.env.TOKEN_KEY },
})

export const fetchCategories = async (options: { limit?: number; variantSKU?: string }) => {
  try {
    const response = await request.get(`/v2/categories`, {
      params: {
        ...options,
      },
    })

    return response.data
  } catch (error) {
    throw error
  }
}
