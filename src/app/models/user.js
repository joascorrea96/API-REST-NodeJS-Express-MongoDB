/*aqui é atribuida a constante o valor de 'database'*/
const mongoose = require('../../database')

/*importação da biblio 'bcrypt', que servirá para 
criptrografar a senha do usuário*/
const bcrypt = require('bcryptjs')

/*este comando atribuido a constante, servirá
para definir os campos da tabela*/
const UserSchema = new mongoose.Schema({
    //'name' será do tipo string, e obrigatório.
    name: {
        type: String,
        require: true
    },
    /*'email' será uma string, única, obrigatória
    e convertido em minúsculas.*/
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    /*'password' será do tipo string, obrigatório
    e terá o valor oculto quando selecionada.*/
    password: {
        type: String,
        required: true,
        select: false
    },

    /*Local onde será salva o token gerado para
    recuperação de senha*/
    passwordResetToken: {
        type: String,
        select: false
    },

    //guarda a data de expiração do token
    passwordResetExpires: {
        type: Date,
        select: false
    },

    /*representa a data que o registro foi criado. 
    Passando os valores tipo 'date', e como default 
    a data atual.*/
    createdAt: {
        type: Date,
        default: Date.now
    }
})

/*o método 'pre' é uma função do 'mongoose' que
define o que vai acontecer antes de salvar o objeto
no banco*/
UserSchema.pre('save', async function(next) {
    /*'hash' informa que a senha será em cerquilha. 
    E o valor '10' indica quantas vezes o 'hash' 
    será gerado.*/
    const hash = await bcrypt.hash(this.password, 10)

    /*'this' se refere ao objeto que está sendo salvado 
    ao banco de dados*/
    this.password = hash

    next()
})

/*aqui é atribuída um valor a constante, passando como
parâmetro o model 'User', e o schema a ser utilizado.*/
const User = mongoose.model('User', UserSchema)

//aqui será exportado o 'User'.
module.exports = User;
