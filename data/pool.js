'use strict'

const options = require('../configs/dev')
const mysql = require('mysql')
 
function createPool() {
    try {
        options.connectionLimit = 30
        options.acquireTimeout = 2000
        options.waitForConnections = true
        //console.log('getting pool connection for: ', JSON.stringify(options))
        const pool = mysql.createPool(options)
        //console.log(`pool connection is: ${pool} `)
        console.log('got pool connection for: ', options.database)
        return pool
    } catch(err){
        console.log('Some error while getting pool', err)
        return
    }
}
let pool = undefined

module.exports=async function(){ 
    if(pool){
        console.log('pool exists, return current pool')        
    } else {
        console.log('returning new pool')
        pool = createPool()
    }
    return pool 
}