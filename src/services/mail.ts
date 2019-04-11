import nodemailer, { SentMessageInfo } from 'nodemailer'
import { sendNotification } from '../utils/slack-notification'

const MAX_TIME_RETRY_SEND_MAIL = process.env.MAX_TIME_RETRY_SEND_MAIL || 3
export async function sendMail(
  options: {
    mailFrom: string
    mailTo: string
    mailCc?: any
    mailBcc?: any
    subject: string
    fileName?: string
    filePath?: string
  },
  retryCount = 0,
): Promise<SentMessageInfo> {
  try {
    console.log('Start send mail to', options.mailTo)
    let transporterOptions: any = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USER,
        clientId: process.env.MAIL_CLIENT_ID,
        clientSecret: process.env.MAIL_CLIENT_SECRET,
        refreshToken: process.env.MAIL_REFRESH_TOKEN,
        accessToken: '123', //process.env.MAIL_ACCESS_TOKEN,
        expires: process.env.MAIL_EXPIRES,
        //       accessUrl:
      },
    }

    if (process.env.NODE_ENV === 'development') {
      const testAccount = await nodemailer.createTestAccount()
      transporterOptions = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }
    }
    const transporter = nodemailer.createTransport(transporterOptions)

    await transporter.verify()

    return await transporter.sendMail(
      {
        from: options.mailFrom,
        to: options.mailTo,
        bcc: options.mailBcc,
        cc: options.mailCc,
        subject: options.subject,
        attachments: [
          {
            filename: options.fileName,
            path: options.filePath,
          },
        ],
      },
      function(err, info) {
        const notifitionStatus = 'success'
        const notifitionTitle = ':heavy_check_mark:     Daily Report Orders'
        const notifitionSubtitle = ':100: Successed '
        sendNotification({
          status: notifitionStatus,
          subtitle: notifitionSubtitle,
          title: notifitionTitle,
        })
      },
    )
  } catch (err) {
    console.log(retryCount)
    if (retryCount < MAX_TIME_RETRY_SEND_MAIL) {
      return await sendMail(options, retryCount + 1)
    }

    const notifitionStatus = 'danger'
    const notifitionTitle = ':no_entry: Orders Daily Report'
    const notifitionSubtitle = 'There was a failure.'
    sendNotification({
      data: err,
      status: notifitionStatus,
      subtitle: notifitionSubtitle,
      title: notifitionTitle,
    })
  }
}
