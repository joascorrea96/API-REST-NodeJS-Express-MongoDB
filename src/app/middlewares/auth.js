const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')

module.exports = (req, res, next) => {
    /*irá atribuir a constante o token de autenticação*/
    const authHeader = req.headers.authorization

    if(!authHeader)
        return res.status(401).send({ error: 'No token provided' })

    /*irá separar o token em duas partes*/
    const parts = authHeader.split(' ')

    /*irá verificar se o token possui 2 partes*/
    if(!parts.length === 2) {
        return res.status(401).send({ error: 'Token error' })
    }

    /*aqui cada constante irá receber uma parte
    do token. Onde scheme recebe 'bearer', e token
    recebe o valor do token*/
    const [ scheme, token ] = parts

    /*aqui será feita a verificação se a palavra
    'bearer' não está contida na constante 'scheme'
    utilizando o modo regex.*/
    if(!/^Bearer$/i.test(scheme)) 
        return res.status(401).send({ error: 'Token malformatted' })

    /*Aqui será feito verificações com o token gerado
    e o token contido authConfig*/
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        //aqui verifica se há erro com o tokken
        if(err) return res.status(401).send({ error: 'Token invalid' })

        /*irá atribuir a 'userId', 
        o valor de id do usuário, para que
        o comando seja reutilizado em outras
        funções*/
        req.userId = decoded.id

        //chama o proximo passo
        return next()
    })

}