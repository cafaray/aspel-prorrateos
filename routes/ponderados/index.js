'use strict'
const data = require('../../data/schemas/ponderado')
const {promisify} = require('util')
const URL = require('url')
const get = promisify(data.getAll)
const getId = promisify(data.getById)
const getByConcept = promisify(data.getByConceptId)
const getBySupplier = promisify(data.getBySupplierId)
const getDetail = promisify(data.getDetails)
const add = promisify(data.add)
const del = promisify(data.del)
const addDetails = promisify(data.addDetails)
const getBySupplierConcept = promisify(data.getBySupplierConcept)
const setDetail = promisify(data.updateDetail)
const delDetail = promisify(data.deleteDetail)
const addDetail = promisify(data.addDetail)

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    try {
      const porcentage = request.body
      if (porcentage){
        console.log(`userId: ${request.headers["x-user-id"]}`)
        porcentage.userId = request.headers["x-user-id"]
        console.log(`porcentage: ${JSON.stringify(porcentage)}`)
        await add(porcentage)
        .then((data) => {
          reply.status(201).send(data)
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
      } else {
        reply.status(400).send('Bad format. Missing requirement field.')
      }
    } catch(err) {
      reply.status(500).send(err)
    }
  })
  fastify.delete('/', async function(request, reply) {
    try{
      const {percentageId} = request.body
      if(percentageId) {
        console.log(`percentage to remove: ${JSON.stringify(percentageId)}`)
        await del(percentageId)
        .then((data) => {
          reply.status(200).send(data)
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
      } else {
        reply.status(400).send('Missing one requiered field')
      }
    }catch(err){
      reply.status(500).send(err)
    }
  })
  fastify.get('/', async function (request, reply) {
    try{
      const uri = URL.parse(request.url, true)
      // console.log(`query: ${JSON.stringify(uri.query)}`)
      // console.log(`query lenght: ${Object.keys(uri.query).length}`)
      const isQueryParams = (Object.keys(uri.query).length>0)
      if (isQueryParams){
        const {concept, supplier} = uri.query     
        console.log(`query params:\n\tconcept: ${concept}\n\tsupplier: ${supplier}`)
        if(supplier && concept) {
          await getBySupplierConcept(supplier, concept)
          .then((data) => {
            reply.status(200).send(JSON.parse(data))
          })
          .catch((err) => {
            reply.status(500).send(err)
          })        
        } else if(supplier) {
          await getBySupplier(supplier)
          .then((data) => {
            reply.status(200).send(JSON.parse(data))
          })
          .catch((err) => {
            reply.status(500).send(err)
          })
        } else if (concept) {
          await getByConcept(concept)
          .then((data) => {
            reply.status(200).send(JSON.parse(data))
          })
          .catch((err) => {
            reply.status(500).send(err)
          })
        } else {
          reply.status(400).send(`Bad format request. Missing a required field.`)
        }
      } else {
        await get()
        .then((data) => {
          const response = JSON.parse(data)
          reply.status(200).send(response)
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
      }
    } catch(err){
      reply.status(500).send(err)
    }
  })
  fastify.post('/:id', async function (request, reply) {
    const {id} = request.params
    try{
      const items = request.body
      console.log(`items: ${items}`)
      const details = {id: id, items: items}
      await addDetails(details)
      .then((data) => {
        reply.status(200).send(data)
      })      
      .catch((err) => {
        reply.status(500).send(err)
      })
    } catch(err){
      reply.status(500).send(err)
    }
  })
  fastify.get('/:id', async function (request, reply) {
    const {id} = request.params
    try{
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
  fastify.get('/:id/details', async function (request, reply) {
    const {id} = request.params
    try{
      await getDetail(id)
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
  fastify.put('/:id/details', async function (request, reply) {
    const {id} = request.params
    try{
        const body = request.body
        await setDetail(id, body)
        .then((data) => {
          reply.status(201).send(data)
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
    } catch(err){
      reply.status(500).send(err)
    }
  })
  fastify.delete('/:id/details', async function (request, reply) {
    const {id} = request.params
    try{
        const body = request.body
        await delDetail(id, body)
        .then((data) => {
          reply.status(201).send(data)
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
    } catch(err){
      reply.status(500).send(err)
    }
  })
  fastify.post('/:id/details', async function (request, reply) {
    const {id} = request.params
    try{
        const body = request.body
        await addDetail(id, body)
        .then((data) => {
          reply.status(201).send(data)
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
    } catch(err){
      reply.status(500).send(err)
    }
  })  
}
