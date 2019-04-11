import axios from 'axios'

const slackToken = `https://hooks.slack.com/services/${process.env.SLACK_TOKEN}`

export function sendNotification(options: {
  data?: string
  status: string
  title: string
  subtitle: string
}) {
  axios.post(slackToken, {
    text: options.title,
    attachments: [
      {
        color: options.status,
        title: options.subtitle,
        text: JSON.stringify(options.data),
      },
    ],
  })
}
