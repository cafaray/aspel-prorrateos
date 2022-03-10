'use strict'
const data = require('../../data/schemas/unidadnegocio')
const {promisify} = require('util')
const URL = require('url')
const get = promisify(data.getAll)
const getId = promisify(data.getById)
const post = promisify(data.insert)
/*
const getId = promisify(data.getById)
const getByConcept = promisify(data.getByConceptId)
const getBySupplier = promisify(data.getBySupplierId)
const getDetail = promisify(data.getDetails)
const add = promisify(data.add)
const addDetails = promisify(data.addDetails)
*/
module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    try{
      // const uri = URL.parse(request.url, true)
      await get()
      .then((data) => {
        reply.status(200).send(JSON.parse(data))
      })
      .catch((err) => {
        reply.status(500).send(err)
      })      
    } catch(err){
      reply.status(500).send(err)
    }
  })
  fastify.post('/', async function (request, reply) {
    try{
      const unidad = request.body
      if(unidad){
        unidad.userId = request.headers["x-user-id"]
        console.log(`trying to insert ${JSON.stringify(unidad)}`)
        await post(unidad)
        .then((data) => {
          reply.status(200).send(data)
        })
        .catch((err) => {
          reply.status(500).send(err)
        })      
      }
    } catch(err){
      reply.status(500).send(err)
    }
  })  
  fastify.get('/:id', async function (request, reply) {
    try{
      const {id} = request.params
      await getId(id)
      .then((data) => {
        reply.status(200).send(JSON.parse(data))
      })
      .catch((err) => {
        reply.status(500).send(err)
      })      
    } catch(err){
      reply.status(500).send(err)
    }
  })
}
