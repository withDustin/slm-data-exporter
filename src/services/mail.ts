import nodemailer from 'nodemailer'

export async function sendMail(options: {
  mailFrom: string
  mailTo: string
  mailCc?: any
  mailBcc?: any
  subject: string
  fileName?: string
  filePath?: string
}) {
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
      accessToken: process.env.MAIL_ACCESS_TOKEN,
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

  transporter.verify(function(error, success) {
    if (error) {
      console.log(error)
    } else {
      console.log('Server is ready to take our messages')
    }
  })

  let mailMessage = await transporter.sendMail({
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
  })
}
