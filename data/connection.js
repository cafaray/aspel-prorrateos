'use strict'

const options = require('../configs/dev')
const mysql = require('mysql')
const poolConnections = require('./pool')
async function getDbConnection() {
    //const connection = mysql.createConnection(options)
    let connection
    const pool = await poolConnections()
    const promise = new Promise((resolve, reject) => {
        pool.getConnection((err, con) => {
            if(err){
                reject(err)
            }
            resolve(con)
        })
        
    })
    await promise
    .then((con) => {
        connection = con
    })
    .catch((err) => {
        console.log(`error getting connection from pool ${err}`)
    })    
    console.log(`connection is: ${connection}`)
    return connection
}

/*
const {promisify} = require('util')
const getPoolConnection = promisify(getDBPoolConnection)
let pool = undefined
const poolConnections = getPoolConnection()
poolConnections
.then((mypool) => {
    //console.log('data pool', mypool)
    pool = mypool
})
.catch((err) => {
    console.log('error getting pool', err)
})

function getDBPoolConnection(cb) {
    options.connectionLimit = 30
    console.log(`creating pool for: ${JSON.stringify(options)}`)
    const pool = mysql.createPool(options)
    console.log(`pool connection is: ${pool} `)
    // .getConnection(function (err, connection){
    //    if (err) console.log('***** >>> Error getting connection pool:', err)        
    //    if (connection){ 
    //        console.log('connection done')
    //        connection.release()
    //    }
    //})}
    setImmediate(() => cb(null, pool))
}
*/
module.exports={
    getDbConnection //, getDBPoolConnection, pool
} 