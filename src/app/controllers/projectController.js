const express = require('express')
const authMiddleware = require('../middlewares/auth')

const Project = require("../models/Project")
const Task = require("../models/Task")
const { Router } = require('express')

const router = express.Router()

router.use(authMiddleware)

//rota de listagem de projetos
router.get('/', async (req, res) => {
    try {
        /*atribuição dos projetos á constante, junto com as informações
        do usuario*/
        const projects = await Project.find().populate('user')

        //retorna todos os projetos
        return res.send({ projects })
    } catch (err) {
        return res.status(400).send({ error: 'Error loading projects' })
    }
})

//rota de listagem de um projeto
router.get("/:projectId", async (req, res) => {
    try {
        /*buscará um determinado projeto, da lista de projetos
        através do id*/
        const project = await Project.findById(req.params.projectId).populate('user')

        return res.send({ project })
    } catch (err) {
        return res.status(400).send({ error: 'Error loading project' })
    }
})

//rota de criação do projeto
router.post('/', async(req, res) => {
    try {
        //irá destruturar os campos de usuários, e criar novas constantes
        const { title, description, tasks } = req.body

        /*atribuirá á constante um novo user(projeto) criado, passando os
        campos 'title' e 'discription'*/
        const project = await Project.create({ title, description, user: req.userId })
        //irá percorrer o campo 'task'
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id })
            
            await projectTask.save()
            
            project.tasks.push(projectTask)
        }))

        //salvar as tasks no banco de dados
        await project.save()

        return res.send({ project })
    } catch (err) {
        return res.status(400).send({ error: 'Error creating new project '})
    }
})

//rota de alteração/atualização do projeto
router.put('/:projectId', async (req, res) => {
    try {
        //irá destruturar os campos de usuários, e criar novas constantes
        const { title, description, tasks } = req.body

        /*atribuirá á constante um novo user(projeto) criado, passando os
        campos 'title' e 'discription'*/
        const project = await Project.findByIdAndUpdate(req.params.projectId, { 
            title, 
            description
        }, { new: true }) //'new:true' irá retornar o objeto atualizado.

        project.tasks = []
        await Task.remove({ project: project._id })


        //irá percorrer o campo 'task'
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id })
            
            await projectTask.save()
            
            project.tasks.push(projectTask)
        }))

        //salvar as tasks no banco de dados
        await project.save()

        return res.send({ project })
    } catch (err) {
        return res.status(400).send({ error: 'Error updating new project '})
    }
})

//rota de deletar projeto
router.delete('/:projectId', async (req, res) => {
    try {
        //remove o projeto 
        await Project.findOneAndRemove(req.params.projectId)

        return res.send()
    } catch (err) {
        return res.status(400).send({ error: 'Error deleting project' })
    }
})

module.exports = app => app.use('/projects', router)