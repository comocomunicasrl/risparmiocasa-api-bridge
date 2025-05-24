const sendGridClient = require('@sendgrid/mail')
sendGridClient.setApiKey(process.env.SENDGRID_API_KEY)

export default { sendGridClient };