import axios from 'axios'

const slackToken = `https://hooks.slack.com/services/${process.env.SLACK_TOKEN}`

export const sendNotification = (options: {
  message?: string
  code?: number
  status: string
  title: string
  subtitle: string
}) => {
  axios.post(slackToken, {
    text: options.title,
    attachments: [
      {
        color: options.status,
        title: options.subtitle,
        text: options.message,
      },
    ],
  })
}
