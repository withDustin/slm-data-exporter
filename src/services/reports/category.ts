import fs from 'fs'
import moment from 'moment'
import { fetchCategories } from '../categories'
import { createXlSXfile } from '../../utils/xlsx'
import { sendNotification } from '../../utils/slack-notification'
import { sendMail } from '../mail'

const EXPORTS_PATH = process.env.EXPORTS_PATH || 'exports'
const REPORT_DATE = moment()
  .format('YYYY-MM-DD')
  .toString()

export const createCategoriesXlSXfileAndSendMail = async () => {
  const MAIL_CATE_SEND_FROM = process.env.MAIL_SEND_FROM || ''
  const MAIL_CATE_SEND_TO = process.env.MAIL_SEND_TO || ''
  const MAIL_CATE_SEND_CC = process.env.MAIL_SEND_CC
  const MAIL_CATE_SEND_BCC = process.env.MAIL_SEND_BCC
  const MAIL_CATE_SUBJECT = process.env.MAIL_SUBJECT || 'Categories list periodically'

  if (!fs.existsSync(EXPORTS_PATH)) {
    await fs.mkdirSync(EXPORTS_PATH, { recursive: false })
  }

  const categoriesData = await fetchCategories({})
  const processedCategories = categoriesData.map((category: any) => {
    const cateName = category.name
    const cateId = category._id
    const cateParentId = category.parentId
    if (cateParentId != null) {
      const cateParent = categoriesData
        .filter((category: any) => category._id == cateParentId)
        .map((cate: any) => cate.name)[0]
      const options = [cateId, cateName, cateParent]
      return options
    } else {
      const options = [cateId, cateName, cateParentId]
      return options
    }
  })
  await createXlSXfile({
    data: processedCategories,
    fileName: `categories-${REPORT_DATE}`,
    title: `categories-${REPORT_DATE}`,
  })
    .catch((err) => {
      sendNotification({
        status: 'danger',
        title: 'Category List Periodically',
        subtitle: 'There was a failure in createXLSXFile.',
      })
      throw err
    })
    .finally(() => {
      console.log('Export Category XLSX Done !')
    })

  await sendMail({
    mailCc: MAIL_CATE_SEND_CC,
    mailBcc: MAIL_CATE_SEND_BCC,
    fileName: `categories${REPORT_DATE}.xlsx`,
    mailFrom: MAIL_CATE_SEND_FROM,
    mailTo: MAIL_CATE_SEND_TO,
    filePath: `./${EXPORTS_PATH}/categories-${REPORT_DATE}.xlsx`,
    subject: MAIL_CATE_SUBJECT,
  }).catch((err) => {
    sendNotification({
      status: 'danger',
      title: 'Categories List Periodically',
      subtitle: 'There was a failure in sendMail.',
    })
    throw err
  })
}
;(async () => {
  try {
    await createCategoriesXlSXfileAndSendMail()
  } catch (err) {
    console.log(err)
    throw err
  } finally {
    const notifitionStatus = 'good'
    const notifitionTitle = ':heavy_check_mark:  Categories list periodically'
    const notifitionSubtitle = ':100: Successed '
    sendNotification({
      status: notifitionStatus,
      subtitle: notifitionSubtitle,
      title: notifitionTitle,
      code: 200,
    })
  }
})()
