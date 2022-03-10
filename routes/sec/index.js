'use strict'

const data = require('../../data/schemas/usuario')
const dataSession = require('../../data/schemas/sesion')
const {promisify} = require('util')
const iniciaSesion = promisify(data.getUserPhrase)
const cierraSesion = promisify(dataSession.killSession)

module.exports = async function (fastify, opts) {
    fastify.get('/', async function (request, reply) {
      return { prorrateos: 'active' }
    })
    fastify.post('/login', async function (request, reply) {    
      //console.log(`===> request.body= ${request.body}`)
      const {user, password} = request.body
      console.log(`- account: ${user}\n- phrase: ${password}`)
      if (user && password){
        iniciaSesion(user, password)
        .then((data) => {          
          reply.header('x-auth', data.token)
          reply.header('x-user-id', data.userId)
          const response = {token: data.token}
          reply.status(200).send(response)
        })
        .catch((err) => {
          console.log(`===> Something happen calling login.\nerr: ${err}, message: ${err.message}`)
          reply.status(500).send(err)
        })
      } else {
        reply.status(400).send('Bad format. Missing fields!')
      }
    })  
    fastify.post('/logout', async function (request, reply) {
        try {
            const {session} = request.body
            console.log(`session: ${session}`)
            if (session){
                await cierraSesion(session)
                .then((data) => {
                  console.log(`logout-data: ${JSON.stringify(data)}`)
                    reply.status(204)
                })
                .catch((err) => {
                    reply.status(500).send(err)
                })
            }else{
                reply.status(400).send('Bad format. Missing required fields!')
            }
        } catch(err) {
            reply.status(500).send(err)
        }
    })
  }
  