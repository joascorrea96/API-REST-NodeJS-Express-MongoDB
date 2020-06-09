const fs = require('fs')
const path = require('path')

module.exports = app => {
    /*comando para ler o diretório atual*/
    fs
    .readdirSync(__dirname)
    /*irá buscar todos os arquivos da pasta atual
    que não iniciam com ponto, e não são do tipo
    'index.js'.*/
    .filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
    /*Percorrá os arquivos, importando cada um deles 
    passando o app para da um.*/
    .forEach(file => require(path.resolve(__dirname, file))(app))
}
