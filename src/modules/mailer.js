const path = require('path')

const nodemailer = require("nodemailer")

const hbs = require('nodemailer-express-handlebars')

const { host, port, user, password } = require("../config/mail.json")
const { extname } = require('path')

const transport = nodemailer.createTransport({
    host,
    port,
    auth: {
      user, 
      pass: password 
    }
})

transport.use('compile', hbs({
    viewEngine: {
      defaultLayout: undefined,
      partialsDir: path.resolve('./src/resources/mail/')
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
  }));
  

module.exports = transport
