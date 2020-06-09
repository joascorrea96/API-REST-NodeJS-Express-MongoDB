const express = require('express')
const bcrypt = require('bcryptjs')
/*'jsonwebtoken' é um gerador de token*/
const jwt = require('jsonwebtoken')

const crypto = require('crypto')

const mailer = require("../../modules/mailer")

const authConfig = require('../../config/auth')

/*Aqui será importado o módulo 'User'*/
const User = require('../models/User')
const { response } = require('express')


/*a constante receberá um método de 'express'
que servirá para definir as rotas do usuário*/
const router = express.Router()


function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

/*Aqui será definida a rota de cadastro('/register') 
com o 'post' passando como segundo parâmetro o comando 'async'
para poder utilizar as promises utilizando o método
'async/await'*/
router.post('/register', async(req, res) => {
    /*puxará o email contido em 'req.body' e criará uma
    constante*/
    const { email } = req.body

    try {
        /*'findOne' irá buscar o registro definido
        como 'unique' dentro da tabela. E será feito
        o teste se o usuário atual já possui o cadastro*/
        if(await User.findOne({ email }))
        return res.status(400).send( {error: 'User already exists'} )

        /*aqui é feita a atribuição dos dados
        passados pelo usuário, para a constante.*/
        const user = await User.create(req.body)

        /*irá definir a senha do usuário atual sendo
        'undefined'*/
        user.password = undefined

        /*aqui é retornado ao servidor o valor de 'user', 
        e um token para que permita ao usuário ser logado
        assim que efetuar o cadastro.*/
        return res.send({
            user, 
            token: generateToken({ id: user.id })
        })
    } catch (err){
        /*Aqui é retornado uma mensagem de erro, 
        passando qual o status, e enviando a mensagem.*/
        return res.status(400).send( {error: 'Registration failed'} )
    }
})

//aqui será feita a autenticação(login) do usuário atual
router.post('/authenticate', async(req, res) => {
    /*aqui é feita atribuição do email e da senha 
    contido no cadastro atual.*/
    const { email, password } = req.body;

    /*atribui a constante se o usuário contém cadastro 
    no banco, Passando o email, e a senha. */
    const user = await User.findOne({ email }).select('+password')

    /*aqui é feita a autenticação do usuário. Se false,
    retorna uma mensagem de erro*/
    if(!user) 
        return res.status(400).send({ error: 'user not found' })

        /*aqui será feito a comparação de criptografia, 
        testando se elas não se coincidem. Passando a 
        senha cadastrada e a senha atual.*/
    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password' })

    /*comando para a senha não ser retornada
    de maneira visível ao usuário*/
    user.password = undefined

    /*'jwt.sign' é uma string de código que terá
    a finalidade de permitir, ou não, o usuário
    de efetuar o login na aplicação e se manter
    conectado.'*/
    const token = jwt.sign({ id: user.id }, authConfig.secret, {
        /*O comando define quando o token vai expirar(1 dia)*/
        expiresIn: 86400,
    })
    
    /*caso feito login com sucesso, o login e
    o token são enviados ao servidor*/
    res.send({ user, token: generateToken({ id: user.id })})

})

/*rota de 'esqueci minha senha'*/
router.post('/forgot_password', async(req, res) => {
    /*puxará o email contido em 'req.body' e criará uma
    constante*/
    const { email } = req.body

    try {
        /*Atribui a 'user' a verificação de o email
        atual estar contido na base de dados.*/
        const user = await User.findOne({ email })

        //Se não encontrar..
        if(!user)
            return res.status(400).send({ error: 'User not found.' })

    /*Gerar um token para que somente o usuário
    atual tenha a permissão de alterar a senha.
    Passando um valor aleatório de 20 caracteres
    utilizando o sistema hexadecimal.*/ 
    const token = crypto.randomBytes(20).toString('hex')

    //irá definir o tempo de expiração do token.
    const now = new Date()
        //Uma hora a mais após a geração do token
        now.setHours(now.getHours() + 1)

        /*Agora é feita a alteração do usuário
        que gerou o token, utilizando mongo.*/
        await User.findByIdAndUpdate(user.id, {
            '$set': {
            //passará o token atual gerado
            passwordResetToken: token,
            //passará a data atual
            passwordResetExpires: now,
            }
            }, { new: true, useFindAndModify: false }
        )
        
        /*enviar email*/
        mailer.sendMail({
            to: email,
            from: "krausermancha@gmail.com",
            /*Irá definir o diretório que está contido o template*/
            template: 'auth/forgot_password',
            /*Irá passar para a template o valor do token*/
            context: { token }
        }, (err) => {
            if(err) {
                return res.status(400).send({ error: 'Cannot send forgot password email' })
            }

            
            return res.send()
        })
        

    } catch (err) {
        res.status(400).send({ error: 'Error on forgot password, try again.' })
    }
})

//rota de alteração de senha
router.post('/reset_password', async(req, res) => {
    const { email, token, password } = req.body

    try {
        /*comando mongoose para verificar a existencia
        dos campos*/
        const user = await User.findOne({ email })
        .select('+passwordResetToken passwordExpires')

        if(!user)
        return res.status(400).send({ error: 'User not found' })

        //irá verificar se o token recebido é diferente do token contido no banco
        if(token !== user.passwordResetToken)
        return res.status(400).send({ error: 'Token invalid' })

        const now = new Date()

        //verifica se o tempo limite do token foi expirado
        if(now > user.passwordResetExpires)
        return res.status(400).send({ error: 'Token expired, generate a new one'})

        //alteração da senha, caso passar pelos erros
        user.password = password

        //salvar o usuario atualizado
        await user.save()

        res.send()

    } catch (err) {
        res.status(400).send({ error: 'cannot reset password, try again' })
    }
})

/*aqui é repassado para o 'app' os comandos
da rota de cadastro, utilizando o prefixo '/auth'*/
module.exports = app => app.use('/auth', router)