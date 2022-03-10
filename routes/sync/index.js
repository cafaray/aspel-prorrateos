'use strict'

const data = require('../../data/schemas/syncsae')
const {promisify} = require('util')
const req = require('request')  
const syncSuppliers = promisify(data.syncSuppliers)
const syncConcepts = promisify(data.syncConcepts)

function getRows(data, cb) {
    let rows = '[]'      
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
    fastify.post('/suppliers', async (request, reply) => {
        try {
            let suppliers=[]
            await dataRows('proveedores')
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
