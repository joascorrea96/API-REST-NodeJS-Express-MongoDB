/*### Arquivo responsável pela recuperação de senhas ### */

/*importação da lib 'path', que tem a finalidade
de trabalhar com caminhos.*/
const path = require('path')

const nodemailer = require("nodemailer")

/*irá importar essa lib que tem a finalidade
de lidar com arquivos em 'html'*/
const hbs = require('nodemailer-express-handlebars')

/*irá importar os dados do arquivo 'mail'*/
const { host, port, user, password } = require("../config/mail.json")
const { extname } = require('path')

/*irá atribuir ao o objeto os valores importados*/
const transport = nodemailer.createTransport({
    host,
    port,
    auth: {
      user, 
      pass: password 
    }
})

/*define o uso e manipulação do método 'handlabers'*/
transport.use('compile', hbs({
    viewEngine: {
      defaultLayout: undefined,
      partialsDir: path.resolve('./src/resources/mail/')
    },
    /*Define onde ficará as templates de email*/
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
  }));
  






/*irá exportar o objeto.*/
module.exports = transport