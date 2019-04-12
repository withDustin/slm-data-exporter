import axios from 'axios'
import lodash from 'lodash'

const request = axios.create({
  baseURL: 'https://api.storelammoc.vn',
  timeout: 15e3,
  headers: { 'x-access-token': process.env.TOKEN_KEY },
})

const PRODUCTS_REPORT_COLUMNS = [
  'Tên sản phẩm',
  'Hãng sản xuất',
  'SKU',
  'Tồn kho',
  'Giá',
  'Tên',
  'Khối lượng',
]

export async function fetchProducts(options: {
  page?: number
  perPage?: number
  categoryId?: string
}): Promise<{ products: any[]; pages: number }> {
  try {
    const response = await request.get(`/v2/products`, {
      params: {
        ...options,
      },
    })

    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchProductsSequential = async ({
  productsList = [],
  page = 0,
  perPage,
}: {
  productsList?: any[]
  page?: number
  perPage: number
}): Promise<any[]> => {
  const data = await fetchProducts({ page, perPage })
  const { products = [], pages = 0 } = data || {}
  const processedProducts = lodash.flatten(
    products.map((product) => {
      const name = product.name
      const manufacturer = product.manufacturer
      const otherDetails = [name, manufacturer]

      const productItem = product.variants.map((item: any) => {
        const instock = item.inStock
        const price = item.price
        const name = item.name
        const sku = item.sku
        const weight = item.weight
        return {
          sku,
          instock,
          price,
          name,
          weight,
        }
      })

      return productItem.map((item: any) => [
        ...otherDetails,
        item.sku,
        item.instock,
        item.price,
        item.name,
        item.weight,
      ])
    }),
  )

  if (page < pages) {
    console.log(page * perPage)
    return await fetchProductsSequential({
      page: page + 1,
      perPage,
      productsList: productsList.concat(processedProducts),
    })
  }
  productsList.unshift(PRODUCTS_REPORT_COLUMNS)
  return productsList
}
