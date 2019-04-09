import axios from "axios";
import moment from "moment";
import lodash from "lodash";
import { getVariantByIds } from "./variant";
import * as xlsx from "node-xlsx";
import fs, { watchFile } from "fs";
import path from "path";
const ORDER_REPORT_HEADERS = [
  "Mã đơn hàng",
  "Ngày tạo",
  "Ngày hoàn thành",
  "SĐT khách hàng",
  "Tên khách hàng",
  "SKU",
  "Tên sản phẩm",
  "Số lượng",
  "Đơn giá",
  "Trạng thái"
];

if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const request = axios.create({
  baseURL: "https://api.storelammoc.vn/orders",
  timeout: 15e3,
  headers: { "x-access-token": process.env.TOKEN_KEY }
});

export async function fetchOrders(options: {
  since: Date;
  until: Date;
  limit?: number;
}): Promise<{ hasMore: boolean; customerAgencyOrders: any[] }> {
  try {
    const response = await request.get(
      `/customerAgencies/agencies/57e7af98b52ee4d36dc6c7c8`,
      {
        params: {
          apiVersion: 2,
          ...options
        }
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

export const generateXLSXOrderData = async (orders: any[]) => {
  const variantIds = lodash.flatten(
    orders.map(order => {
      return order.items.map((item: any) => item.variant.id);
    })
  );

  const variants = await getVariantByIds(variantIds);
  const variantEntities = lodash.keyBy(variants, "_id");
  let processedOrders = lodash.flatten(
    orders.map(order => {
      let orderCreatedAt = moment(new Date(order.createdAt)).format(
        "DD-MM-YYYY HH:mm"
      );
      let orderUpdatedAt = moment(new Date(order.updatedAt)).format(
        "DD-MM-YYYY HH:mm"
      );
      const orderDetails = [
        `CO${order.id}`,
        orderCreatedAt,
        orderUpdatedAt,
        order.customerInfo.phone,
        order.customerInfo.name
      ];

      const itemsDetails = (order.items || []).map((item: any) => {
        const sku = lodash.get(
          variantEntities,
          `${lodash.get(item, "variant.id")}.sku`
        );
        const name =
          lodash.get(item, "product.name") +
          " (" +
          lodash.get(item, "variant.name") +
          ")";
        return {
          sku,
          name,
          quantity: item.quantity,
          price: item.price
        };
      });

      return itemsDetails.map((item: any) => [
        ...orderDetails,
        item.sku,
        item.name,
        item.quantity,
        item.price,
        order.status
      ]);
    })
  );
  processedOrders.unshift(ORDER_REPORT_HEADERS);

  return processedOrders;
};

export const fetchOrderDataRecursion = async ({
  prevOrders = [],
  since,
  until,
  limit = 20
}: {
  prevOrders?: any[];
  since: Date;
  until: Date;
  limit?: number;
}): Promise<{ completedOrders: any[] }> => {
  const data = await fetchOrders({ since, limit, until });

  const { hasMore = false, customerAgencyOrders = [] } = data || {};

  if (hasMore === true) {
    const lastUntil = lodash.last(customerAgencyOrders).createdAt;

    return await fetchOrderDataRecursion({
      prevOrders: prevOrders.concat(customerAgencyOrders),
      until: lastUntil,
      since
    });
  }

  const completedOrders = prevOrders.filter(prevOrder => {
    if (
      prevOrder.status === "COMPLETED" &&
      moment(prevOrder.updatedAt).format("DD-MM-YYYY") ===
        moment()
          .add(-1, "days")
          .format("DD-MM-YYYY")
    )
      return true;
    else return false;
  });

  return {
    completedOrders
  };
};

export const filterOrderData = async ({
  data: []
}: {
  data: [];
}): Promise<any> => {};
