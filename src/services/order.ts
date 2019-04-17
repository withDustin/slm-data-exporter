import axios from 'axios'
import moment from 'moment'
import lodash from 'lodash'
import { getVariantsByIds } from './variant'

const ORDER_REPORT_COLUMNS = [
  'Mã đơn hàng',
  'Ngày tạo',
  'Ngày hoàn thành',
  'SĐT khách hàng',
  'Tên khách hàng',
  'SKU',
  'Tên sản phẩm',
  'Số lượng',
  'Đơn giá',
  'Trạng thái',
]

const request = axios.create({
  baseURL: 'https://api.storelammoc.vn/orders',
  timeout: 15e3,
  headers: { 'x-access-token': process.env.TOKEN_KEY },
})

export const fetchOrders = async (options: {
  since: Date
  until: Date
  limit?: number
}): Promise<{ hasMore: boolean; customerAgencyOrders: any[] }> => {
  try {
    const response = await request.get(`/customerAgencies/agencies/57e7af98b52ee4d36dc6c7c8`, {
      params: {
        apiVersion: 2,
        ...options,
      },
    })

    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      const err = new Error(error.response.data.message) as Error & { code: string }
      err.code = error.response.data.code
      throw err
    }

    throw error
  }
}

export const generateXLSXOrderData = async (orders: any[]) => {
  try {
    const variantIds = lodash.flatten(
      orders.map((order) => {
        return order.items.map((item: any) => item.variant.id)
      }),
    )

    const variants = await getVariantsByIds(variantIds)
    const variantEntities = lodash.keyBy(variants, '_id')
    const processedOrders = lodash.flatten(
      orders.map((order) => {
        const orderCreatedAt = moment(new Date(order.createdAt)).format('DD-MM-YYYY HH:mm')
        const orderUpdatedAt = moment(new Date(order.updatedAt)).format('DD-MM-YYYY HH:mm')
        const orderDetails = [
          `CO${order.id}`,
          orderCreatedAt,
          orderUpdatedAt,
          order.customerInfo.phone,
          order.customerInfo.name,
        ]

        const itemsDetails = (order.items || []).map((item: any) => {
          const sku = lodash.get(variantEntities, `${lodash.get(item, 'variant.id')}.sku`)
          const name =
            lodash.get(item, 'product.name') + ' (' + lodash.get(item, 'variant.name') + ')'
          return {
            sku,
            name,
            quantity: item.quantity,
            price: item.price,
          }
        })

        return itemsDetails.map((item: any) => [
          ...orderDetails,
          item.sku,
          item.name,
          item.quantity,
          item.price,
          order.status,
        ])
      }),
    )
    processedOrders.unshift(ORDER_REPORT_COLUMNS)

    return processedOrders
  } catch (err) {
    const error = new Error('generateXLSXOrderData failure')
    throw error
  }
}

export const fetchOrdersSequential = async ({
  prevOrders = [],
  since,
  until,
  limit = 20,
}: {
  prevOrders?: any[]
  since: Date
  until: Date
  limit?: number
}): Promise<{ completedOrders: any[] }> => {
  const data = await fetchOrders({ since, limit, until })

  const { hasMore = false, customerAgencyOrders = [] } = data || {}

  if (hasMore === true) {
    const lastUntil = lodash.last(customerAgencyOrders).createdAt

    return await fetchOrdersSequential({
      prevOrders: prevOrders.concat(customerAgencyOrders),
      until: lastUntil,
      since,
    })
  }

  const completedOrders = prevOrders.filter((prevOrder) => {
    if (
      prevOrder.status === 'COMPLETED' &&
      moment(prevOrder.updatedAt).format('DD-MM-YYYY') ===
        moment()
          .add(-1, 'days')
          .format('DD-MM-YYYY')
    )
      return true
    else return false
  })

  return {
    completedOrders,
  }
}
