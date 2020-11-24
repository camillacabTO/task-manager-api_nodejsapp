const sgMail = require('@sendgrid/mail')

const apiKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(apiKey)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'millacab@gmail.com',
    subject: 'Thanks for joining in!',
    text: `'Welcome to the Task Manager App, ${name}. Feel free to share some feedback and let know if you experience any trouble`
  })
}

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'millacab@gmail.com',
    subject: 'Your account has been canceled',
    text: `Dear ${name}, thanks for using our Task Manager application. We are sad to see you leaving. Let us know how we can improve our services`
  })
}

module.exports = { sendWelcomeEmail, sendCancellationEmail }
