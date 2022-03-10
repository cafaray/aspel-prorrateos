'use strict'

const {getDbConnection} = require('../connection')
const {USUARIOS} = require('../../configs/tables')
const {promisify} = require('util')
const schema_sesion = require('./sesion')
const SQL_FINDBY_STATUS = `SELECT * FROM ${USUARIOS} WHERE instatus = ?`
const SQL_FINDBY_USER = `SELECT dsusucon cuenta, dsusunom nombre, concat(dsusuape, ' ', dsusuasp) apellidos FROM ${USUARIOS} WHERE dsusucon = ?`
const SQL_FINDBY_USER_PHRASE = `SELECT idusucon, dsusucon cuenta, dsusunom nombre, concat(dsusuape, ' ', dsusuasp) apellidos FROM ${USUARIOS} WHERE dsusucon = ? AND dsvalcon = md5(?)`

const getData = promisify(executeQuery)
const message = {err: '', function: '', schema: 'usuario'}
const addSession = promisify(schema_sesion.startSession)

async function getAll(cb) {
    message.function='getAll'
    try {
        const dbcon = await getDbConnection()
        dbcon.connect()
        await dbcon.query(`SELECT * FROM ${USUARIOS};`, (err, data) =>{
            if(err){
                console.log(`===> Error: ${err}`)
                setImmediate(() => cb(err))
            }
            console.log(`connection data: ${JSON.stringify(data)}`)    
            setImmediate(() => cb(null, data))
        })
        dbcon.release()
        console.log(`---> ${message.function}-realeasing session [OK]`)
    } catch(err) {
        message.err = err
        console.log(JSON.stringify(message))
        setImmediate(() => cb(err))
    }

}

async function addUser(user, cb) {
    message.function = 'addUser'
    try {
        const dbcon = await getDbConnection()
        const {account, phrase, name, lastname, secondLastName} = user
        dbcon.query(`INSERT INTO ${USUARIOS} (dsusucon, dsvalcon, dsusunom, dsusuape, dsusuasp, instatus, tmstmp)
        VALUES (?,md5(?),?,?,?,?,?);`, [account, phrase, name, lastname, secondLastName, 'A', new Date()], (err, result) => {
            if (err){
                message.err = err
                console.log(JSON.stringify(message))
                setImmediate(() => cb(err))     
            }
            console.log(`query results:\n===>data: ${JSON.stringify(result)}`)
            setImmediate(() => cb(null, {status:'Ok', message: `Rows affected: ${result.affectedRows}`}))
        })        
        dbcon.release()
        console.log(`---> ${message.function}-realeasing session [OK]`)
    } catch (err) {
        message.err = err
        console.log(JSON.stringify(message))
        setImmediate(() => cb(err))
    }
}

async function setUserActive(user, cb) {
    message.function = 'setUserActive'
    try {
        const dbcon = await getDbConnection()
        dbcon.query(`UPDATE ${USUARIOS} SET instatus = ?, tmstmp = ? WHERE idusucon = ?`, ['A', new Date(), user], (err, result) => {
            if (err){
                message.err = err
                console.log(JSON.stringify(message))
                setImmediate(() => cb(err))    
            }
            console.log(`query results:\n===>data: ${JSON.stringify(result)}`)
            setImmediate(() => cb(null, {status:'Ok', message: `Rows affected: ${result.changedRows}`}))
        })        
    } catch (err) {
        message.err = err
        console.log(JSON.stringify(message))
        setImmediate(() => cb(err))
    } finally {
        try {
            dbcon.release()
            console.log(`---> ${message.function}-realeasing session [OK]`)
        } catch(err){}
    }
}

async function setUserSuspend(user, cb) {
    try {
        const dbcon = await getDbConnection()
        dbcon.query(`UPDATE ${USUARIOS} SET instatus = ?, tmstmp = ? WHERE idusucon = ?`, ['S', new Date(), user], (err, result) => {
            if (err){
                message.function = 'setUserSuspend'
                message.err = err
                console.log(JSON.stringify(message))
                setImmediate(() => cb(err))    
            }
            console.log(`query results:\n===>data: ${JSON.stringify(result)}`)
            setImmediate(() => cb(null, {status:'Ok', message: `Rows affected: ${result.changedRows}`}))
        })        
    } catch (err) {
        message.function = 'catch-setUserSuspend'
        message.err = err
        console.log(JSON.stringify(message))
        setImmediate(() => cb(err))
    }
}

async function getSuspended(cb) {
    try {
        await getData(SQL_FINDBY_STATUS, ['S'])
        .then((data) => {
            console.log(`query data: ${data}`)
            setImmediate(() => cb(null, data))
        })
        .catch((err) => {
            message.function = 'getSuspended'
            message.err = err
            console.log(JSON.stringify(message))
            setImmediate(() => cb(err))
        })
    } catch (err) {
        message.function = 'catch-getSuspended'
        message.err = err
        console.log(JSON.stringify(message))
        setImmediate(() => cb(err))
    }
}
async function getActives(cb) {
    try {
        await getData(SQL_FINDBY_STATUS, ['A'])
        .then((data) => {
            console.log(`query data: ${data}`)
            setImmediate(() => cb(null, data))
        })
        .catch((err) => {
            message.function = 'getActives'
            message.err = err
            console.log(JSON.stringify(message))
            setImmediate(() => cb(err))
        })
    } catch (err) {
        message.function = 'catch-getSuspended'
        message.err = err
        console.log(JSON.stringify(message))
        setImmediate(() => cb(err))
    }
}

async function getUser(account, cb) {
    try {
        await getData(SQL_FINDBY_USER, [account])
        .then((data) => {
            console.log(`query data: ${data}`)
            setImmediate(() => cb(null, data))
        })
        .catch((err) => {
            message.function = 'getUser'
            message.err = err
            console.log(JSON.stringify(message))
            setImmediate(() => cb(err))
        })
    } catch (err) {
        message.function = 'catch-getUser'
        message.err = err
        console.log(JSON.stringify(message))
        setImmediate(() => cb(err))
    }
}

async function setUserPhrase(account, phrase, cb) {
    try {
        const SQL_SET_PHRASE = `UPDATE ${USUARIOS} SET dsvalcon = md5(?) WHERE dsusucon = ?;`
        const dbcon = await getDbConnection()
        dbcon.query(SQL_SET_PHRASE, [phrase, account], (err, result) => {
            if(err){
                message.function = 'setUserPhrase'
                message.err = err
                console.log(JSON.stringify(message))
                setImmediate(() => cb(err))    
            }
            console.log(`query results:\n===>data: ${JSON.stringify(result)}`)
            setImmediate(() => cb(null, {status:'Ok', message: `Rows affected: ${result.affectedRows}`}))
        })
    } catch (err) {
        message.function = 'catch-setUserPhrase'
        message.err = err
        console.log(JSON.stringify(message))
        setImmediate(() => cb(err))
    }
}

async function getUserPhrase(account, phrase, cb) {
    message.function = 'getUserPhrase'
    try {
        let userId = -1
        await getData(SQL_FINDBY_USER_PHRASE, [account, phrase])
        .then((data) => {
            console.log(`===> ${message.function} - query data: ${data}`)
            if (data[0]) {
                userId = data[0].idusucon
            } else {
                console.log(`===> ${message.function} - querying data: ${data}`)
                setImmediate(() => cb(new Error(`EC0401.The user or password is incorrect!`), null))
            }
        })
        .catch((err) => {
            message.err = err
            console.log(JSON.stringify(message))
            setImmediate(() => cb(err))
        })
        if (userId>0){
            await addSession(userId)
            .then((data) => {
                console.log(JSON.stringify(data))
                setImmediate(() => cb(null, data))
            })
            .catch((err) => {
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            })
        } else {
            message.err = new Error('No valid user to create session.')
            console.log(message)
            setImmediate(() => cb(message))
        }
    } catch (err) {        
        message.err = err
        console.log(JSON.stringify(message))
        setImmediate(() => cb(err))
    }
}

async function executeQuery(query, params, cb) {
    try {
        const dbcon = await getDbConnection()
        dbcon.connect()    
        await dbcon.query(query, params, (err, data) =>{
            if(err){
                console.log(`===> Error: ${err}`)
                setImmediate(() => cb(err))
            }
            console.log(`connection data: ${JSON.stringify(data)}`)    
            setImmediate(() => cb(null, data))
        })
    } catch(err) {
        message.err = err
        console.log(`${message.function} - Error in catch:\n${err}`)
        setImmediate(() => cb(err))
    } finally {
        try {
            dbcon.release()
            console.log(`${message.function} - connection released: ${dbcon}`)
        } catch(err){}
    }
}
module.exports={
    getAll, getSuspended, getActives, setUserActive, setUserSuspend, addUser, getUser, setUserPhrase, getUserPhrase
}