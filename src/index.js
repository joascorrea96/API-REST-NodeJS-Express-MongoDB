const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded( {extended: false } ))

/*aqui é feita a importação do arquivo. Passando
como parâmetro o valor atual de app(express). 
Isso é feito para que o 'app' seja reutilizado 
para não ter que criá-lo novamente*/
require('./app/controllers/index')(app)

app.listen(3000)