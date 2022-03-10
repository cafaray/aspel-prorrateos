'use strict'
const data = require('../../data/schemas/usuario')
const {promisify} = require('util')

const usuarios = promisify(data.getAll)
const suspendidos = promisify(data.getSuspended)
const activos = promisify(data.getActives)
const activaUsuario = promisify(data.setUserActive)
const agregaUsuario = promisify(data.addUser)
const detalleUsuario = promisify(data.getUser)
const cambiaPassword = promisify(data.setUserPhrase)


module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    try{
      const {account, phrase, name, lastname, secondLastName} = request.body
      const user = {account: account, phrase: phrase, name: name, lastname: lastname, secondLastName:secondLastName}
      console.log(`user: ${user}`)
      await agregaUsuario(user)
      .then((data) => {
        reply.status(200).send(data)
      })
      .catch((err) => {
        reply.status(500).send(err)  
      })
    } catch (err) {
      reply.status(500).send(err)
    }
  })
  fastify.put('/', async function (request, reply) {
    try{
      const {user} = request.body
      console.log(`user: ${user}`)
      await activaUsuario(user)
      .then((data) => {
        reply.status(200).send(data)
      })
      .catch((err) => {
        reply.status(500).send(err)  
      })
    } catch (err) {
      reply.status(500).send(err)
    }
  })
  fastify.get('/', async function (request, reply) {
    await usuarios()
    .then((data) => {
      reply.status(200).send(data)
    })
    .catch((err) => {
      reply.status(500).send(err)
    })
  })
  fastify.get('/:account', async function (request, reply) {
    const {account} = request.params
    if (account){
      await detalleUsuario(account)
      .then((data) => {
        reply.status(200).send(data)
      })
      .catch((err) => {
        reply.status(500).send(err)
      })
    } else {
      reply.status(400).send('Bad format. Missing field account!')
    }
  })  
  fastify.post('/:account/phrase', async function (request, reply) {
    const {account} = request.params
    //console.log(`===> request.body= ${request.body}`)
    const {phrase} = request.body
    console.log(`- account: ${account}\n- phrase: ${phrase}`)
    if (account && phrase){
      await cambiaPassword(account, phrase)
      .then((data) => {
        reply.status(200).send(data)
      })
      .catch((err) => {
        reply.status(500).send(err)
      })
    } else {
      reply.status(400).send('Bad format. Missing field account!')
    }
  })  
  fastify.get('/actives', async function (request, reply) {
    await activos()
    .then((data) => {
      reply.status(200).send(data)
    })
    .catch((err) => {
      reply.status(500).send(err)
    })
  })
  fastify.get('/suspendeds', async function (request, reply) {
    await suspendidos()
    .then((data) => {
      reply.status(200).send(data)
    })
    .catch((err) => {
      reply.status(500).send(err)
    })
  })
}
