import { fetchProductsSequential } from '../product'
import { createXlSXfile } from '../../utils/xlsx'
import moment from 'moment-timezone'
import fs from 'fs'
import { sendNotification } from '../../utils/slack-notification'
import { sendMail } from '../mail'

moment.tz.setDefault('Asia/Ho_Chi_Minh')
const EXPORTS_PATH = process.env.EXPORTS_PATH || 'exports'
const REPORT_DATE = moment()
  .format('YYYY-MM-DD')
  .toString()

const createProductXlSXfileAndSendMail = async () => {
  const MAIL_PRODUCT_SEND_FROM = process.env.MAIL_SEND_FROM || ''
  const MAIL_PRODUCT_SEND_TO = process.env.MAIL_SEND_TO || ''
  const MAIL_PRODUCT_SEND_CC = process.env.MAIL_SEND_CC
  const MAIL_PRODUCT_SEND_BCC = process.env.MAIL_SEND_BCC
  const MAIL_PRODUCT_SUBJECT = process.env.MAIL_SUBJECT || 'Update Product List'

  if (!fs.existsSync(EXPORTS_PATH)) {
    await fs.mkdirSync(EXPORTS_PATH, { recursive: false })
  }

  const productsData = await fetchProductsSequential({ perPage: 50 })

  await createXlSXfile({
    data: productsData,
    fileName: `products-${REPORT_DATE}`,
    title: `products-${REPORT_DATE}`,
  })
    .catch((err) => {
      sendNotification({
        status: 'danger',
        title: 'Update Product List',
        subtitle: 'There was a failure in createXLSXFile.',
      })
      throw err
    })
    .finally(() => {
      console.log('Export XLSX Done !')
    })

  await sendMail({
    mailCc: MAIL_PRODUCT_SEND_CC,
    mailBcc: MAIL_PRODUCT_SEND_BCC,
    fileName: `products${REPORT_DATE}.xlsx`,
    mailFrom: MAIL_PRODUCT_SEND_FROM,
    mailTo: MAIL_PRODUCT_SEND_TO,
    filePath: `./${EXPORTS_PATH}/products-${REPORT_DATE}.xlsx`,
    title: MAIL_PRODUCT_SUBJECT,
  }).catch((err) => {
    sendNotification({
      status: 'danger',
      title: 'Product List Periodically',
      subtitle: 'There was a failure in sendMail.',
    })
    throw err
  })
}
;(async () => {
  try {
    await createProductXlSXfileAndSendMail()
  } catch (err) {
    console.log(err)
    throw err
  } finally {
    const notifitionStatus = 'good'
    const notifitionTitle = ':heavy_check_mark:  Product list periodically'
    const notifitionSubtitle = ':100: Successed '
    sendNotification({
      status: notifitionStatus,
      subtitle: notifitionSubtitle,
      title: notifitionTitle,
      code: 200,
    })
  }
})()
