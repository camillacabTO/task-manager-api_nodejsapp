const { setApiKey } = require('@sendgrid/mail')

module.exports = {
  setApiKey(apiKey) {}, // replaces the real function by these ones. Prevents email to be sent
  send() {}
}
