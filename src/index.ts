import fs from "fs";
import path from "path";
import moment from "moment";
import {
  generateXLSXOrderData,
  fetchOrderDataRecursion
} from "./services/order";
import { createXlSXfile } from "./utils/xlsx";

if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const DIR_NAME = process.env.DIR_NAME || "exports";

(async () => {
  console.log("\n\n\n");
  if (!fs.existsSync(DIR_NAME)) {
    await fs.mkdirSync(DIR_NAME, { recursive: false });
  }

  const since = moment()
    .add(-10, "days")
    .startOf("day")
    .toDate();

  const until = moment()
    .add(-1, "days")
    .endOf("day")
    .toDate();

  const orderData = await fetchOrderDataRecursion({
    since,
    until
  });

  const completedOrders = orderData.completedOrders;
  const data = await generateXLSXOrderData(completedOrders);
  const orderDate = moment().add(-1, "days");
  createXlSXfile({
    data,
    fileName: `order-${orderDate.format("YYYY-MM-DD")}`,
    title: `Danh sách đơn hàng hoàn thành ngày ${orderDate.format(
      "DD-MM-YYYY"
    )}`
  });
})();
