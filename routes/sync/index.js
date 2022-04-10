'use strict'

const data = require('../../data/schemas/syncsae')
const {promisify} = require('util')
const req = require('request')  
const syncSuppliers = promisify(data.syncSuppliers)
const syncConcepts = promisify(data.syncConcepts)
const getSuppliers = promisify(data.getSuppliers)
const getConcepts = promisify(data.getConcepts)

function getRows(data, cb) {
    let rows = '[]'      
    console.log('looking for:', data)
    req(`http://localhost:5001/${data}`, function (error, response, body) {
        console.log('statusCode:', response && response.statusCode)
        if (error) {
            console.log(`error: ${error}`)
            throw error
        } else {
            // console.log('body:', body);
            if (response && response.statusCode===200){
                rows = JSON.parse(body)
                // console.log(`response data: ${JSON.stringify(suppliers)}`)
                setImmediate(() => cb(null, rows))
            }
            setImmediate(() => cb(null, []))
        }
    })   
}
const dataRows = promisify(getRows)

module.exports=async function(fastify, opts) {
    fastify.get('/suppliers', async (request, reply) => {
        try {
            await getSuppliers()
            .then((result) => {
                result = JSON.parse(result)
                reply.status(200).send(result)
            })
            .catch((err) => {
                reply.status(500).send(err)
            })
        }catch(err) {
            console.log('Error getting suppliers from base: ', err)
            reply.status(500).send(err)
        }
    })
    fastify.get('/concepts', async (request, reply) => {
        try {
            await getConcepts()
            .then((result) => {
                result = JSON.parse(result)
                reply.status(200).send(result)
            })
            .catch((err) => {
                reply.status(500).send(err)
            })
        }catch(err) {
            console.log('Error getting suppliers from base: ', err)
            reply.status(500).send(err)
        }
    })    
    fastify.post('/suppliers', async (request, reply) => {
        try {
            let suppliers=[]
            const {from} = request.body
            console.log('proveedores from: ', from)
            let resource = 'proveedores'
            if (from) resource += `?from=${from}`            
            await dataRows(resource)
            .then((result)=>{
                if (result){
                    suppliers = result
                }
            })
            .catch((err) => {
                console.log(`Error getting suppliers: ${err}`)
            })
            
            await syncSuppliers(suppliers)
            .then((response) => {
                console.log(`Data from sincyng suppliers ${JSON.stringify(response)}`)
                reply.status(201).send(response)
            })
            .catch((err) => {
                reply.status(500).send(err)
            })
        } catch (err) {
            reply.status(500).send(err)
        }
    })
    fastify.post('/concepts', async (request, reply) => {
        try {
            let concepts=[]
            await dataRows('conceptos')
            .then((result)=>{
                if (result){
                    concepts = result
                }
            })
            .catch((err) => {
                console.log(`Error getting concepts: ${err}`)
            })
            
            await syncConcepts(concepts)
            .then((response) => {
                console.log(`Data from sincyng concepts ${JSON.stringify(response)}`)
                reply.status(201).send(response)
            })
            .catch((err) => {
                reply.status(500).send(err)
            })
        } catch (err) {
            reply.status(500).send(err)
        }
    })
}
