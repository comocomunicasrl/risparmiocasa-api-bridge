const mailjetClient = require('node-mailjet').connect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET
);

export { mailjetClient };
