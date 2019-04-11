import moment from 'moment'
import fs from 'fs'
import { generateXLSXOrderData, fetchOrdersSequential } from '../order'
import { createXlSXfile } from '../../utils/xlsx'
import { sendMail } from '../mail'
const EXPORTS_PATH = process.env.EXPORTS_PATH || 'exports'

export async function createXlSXfileAndSendMail() {
  const MAIL_SEND_FROM = process.env.MAIL_SEND_FROM || ''
  const MAIL_SEND_TO = process.env.MAIL_SEND_TO || ''
  const MAIL_SEND_CC = process.env.MAIL_SEND_CC
  const MAIL_SEND_BCC = process.env.MAIL_SEND_BCC
  const MAIL_SUBJECT = process.env.MAIL_SUBJECT || 'Orders Daily Report'
  const DURATION_DAYS_GET_ORDERS = process.env.DURATION_DAYS_GET_ORDERS || 30

  if (!fs.existsSync(EXPORTS_PATH)) {
    await fs.mkdirSync(EXPORTS_PATH, { recursive: false })
  }

  const since = moment()
    .subtract(DURATION_DAYS_GET_ORDERS, 'days')
    .startOf('day')
    .toDate()

  const until = moment()
    .add(-1, 'days')
    .endOf('day')
    .toDate()

  const orderData = await fetchOrdersSequential({
    since,
    until,
  })

  const completedOrders = orderData.completedOrders
  const data = await generateXLSXOrderData(completedOrders)
  const orderDate = moment().add(-1, 'days')
  const fileName = `order-${orderDate.format('YYYY-MM-DD')}`

  await createXlSXfile({
    data,
    fileName: fileName,
    title: `Danh sách đơn hàng hoàn thành ngày ${orderDate.format('DD-MM-YYYY')}`,
  })

  console.log('Export XLSX Done !')

  await sendMail({
    mailCc: MAIL_SEND_CC,
    mailBcc: MAIL_SEND_BCC,
    fileName: `${fileName}.xlsx`,
    mailFrom: MAIL_SEND_FROM,
    mailTo: MAIL_SEND_TO,
    filePath: `./${EXPORTS_PATH}/${fileName}.xlsx`,
    subject: MAIL_SUBJECT,
  })
}

;(async () => {
  try {
    await createXlSXfileAndSendMail()
  } catch (err) {
    console.log(err)
    // send mail, noti
  }
})()
