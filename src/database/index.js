//importação do 'mongoose' para manipular o banco
const mongoose = require('mongoose')

/*aqui é criado um banco de dados chamado 'noderest'
passando como segundo parâmetro alguns comandos que vão servir
para realizar a conexão com o mongo*/
mongoose.connect("mongodb://localhost/noderest", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});


//define qual a classe a ser utilizada pelo mongoose
mongoose.Promise = global.Promise


//aqui será exportado a constante 'mongoose'
module.exports = mongoose