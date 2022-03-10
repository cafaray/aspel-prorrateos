'use strict'
const data = require('../../data/schemas/sesion')
const {promisify} = require('util')
const sesiones = promisify(data.getAll)
// const registraSesion = promisify(data.insertSesion)

module.exports = async function (fastify, opts) {
  /*
  fastify.post('/', async function (request, reply) {
    try {
      const {userId} = request.body
      await registraSesion(userId)
      .then((data) => {
        if(data){
          data = JSON.parse(data)
          reply.status(200).send(data)
        }
        reply.status(204)
        return
      })
      .catch((err) => {
        reply.status(500).send(err)  
      })
    } catch(err) {
      reply.status(500).send(err)
    }
  })
  */
  fastify.get('/', async function (request, reply) {
    try {
      await sesiones()
      .then((data) => {
        if(data){
          data = JSON.parse(data)
          reply.status(200).send(data)
        }
        reply.status(204)
        return
      })
      .catch((err) => {
        reply.status(500).send(err)  
      })
    } catch(err) {
      reply.status(500).send(err)
    }
  })
}
