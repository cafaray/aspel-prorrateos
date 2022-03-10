'use strict'

const data = require('../../data/schemas/cuentaimpuesto')
const {promisify} = require('util')

const cuentasImpuesto = promisify(data.getAll)
const cuentaImpuesto = promisify(data.getById)
const actualizaCuentaImpuesto = promisify(data.setById)

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    try{
      await cuentasImpuesto()
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
fastify.put('/:id', async function (request, reply) {
  try {    
    const {id}=request.params
    const {account, description, status='A'} = request.body
    const cuentaImpuesto = {id: id, account: account, description: description, status: status}
    console.log(`index.cuentaImpuesto: ${cuentaImpuesto}`)
    await actualizaCuentaImpuesto(cuentaImpuesto)    
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
  try{
    console.log(`\n\n===> headers: \n${JSON.stringify(request.headers)}`)
    const {id} = request.params
    const token = request.headers["x-auth"]
    const userId = request.headers["x-user-id"]
    
    await cuentaImpuesto(id)
    .then((data) => {
      //reply.header('x-auth', token) 
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