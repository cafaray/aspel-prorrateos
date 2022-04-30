'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const URL = require('url')
const data = require('./data/schemas/sesion')
const {promisify} = require('util')
const findByToken = promisify(data.getUserByToken)

const pool = require('./data/pool')
//console.log('poolConnections is:', pool())

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  fastify.register(require('fastify-multipart'))
  fastify.register(require('fastify-formbody'))
  fastify.addHook('onSend', async (request, reply) => {          
    const requrl = URL.parse(request.url)
    if (requrl.pathname.indexOf('/sec', 0)===0){
      console.info(`reply header x-auth is: ${reply.getHeader('x-auth')}`)
    } else {
      reply.header("x-auth", request.headers["x-auth"])     
    }
  })
  fastify.addHook('preHandler', async (request, reply) => {
    const requrl = URL.parse(request.url)
    console.info(`request.url: ${JSON.stringify(requrl)}`)
    console.info(`indexOf = ${requrl.pathname.indexOf('/sec')}`)
    if (requrl.pathname.indexOf('/sec', 0)===0){
      console.info(`Not security required for ${requrl.pathname}`)
    } else {
      try {
        const token = request.headers["x-auth"]    
        console.info(`x-auth: ${token}`)          
        if (token){
            await findByToken(token)
            .then((data) => {                    
                console.log(`==========    ==========    ==========\n===>secuser.data: ${JSON.stringify(data)}\n==========    ==========    ==========`)
                request.headers['x-user-id'] = data.userId
            })
            .catch((err) => {
                console.log(`Error authenticating user by token: ${err}`)
                reply.status(500).send(`Error authenticating user by token ${token}`)
            })                
        } else {
            console.log(`Security failure, needs to specify x-auth header`)
            reply.status(400).send('Bad request format, "Authorization" header is required.')
        }
      } catch(err) {
        console.log(err)
        reply.status(403).send({ message: 'User not valid.', error: err})
      }
    }
    
  })
  fastify.addHook("onRequest", (req, reply, done) => {
    reply.startTime = Date.now();
    req.log.info({ url: req.raw.url, id: req.id }, "received request");
    done();
  });
  
  fastify.addHook("onResponse", (req, reply, done) => {
    req.log.info(
      {
        url: req.raw.url, // add url to response as well for simple correlating
        statusCode: reply.raw.statusCode,
        durationMs: Date.now() - reply.startTime, // recreate duration in ms - use process.hrtime() - https://nodejs.org/api/process.html#process_process_hrtime_bigint for most accuracy
      },
      "request completed"
    );
    done();
  });
  // Do not touch the following lines
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
  fastify.setNotFoundHandler((req, reply) => {
    if (req.method !== 'GET'){
      reply.status(405)
      return 'Method Not Allowed\n'
    }
    return 'Not Found\n'
  })
}
