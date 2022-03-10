'use strict'

const {getDbConnection} = require('../connection')
const {SESIONES, USUARIOS} = require('../../configs/tables')
const {promisify} = require('util')
const SQL_QUERY_ALL = `SELECT * FROM ${SESIONES} ORDER BY tmstmp desc`
const SQL_FINDBY_TOKEN = `SELECT idusucon userId, dsusucon cuenta, dsusunom nombre, concat(dsusuape, ' ', dsusuasp) apellidos FROM ${SESIONES} s INNER JOIN ${USUARIOS} u ON s.idusuari = u.idusucon WHERE dstoken = ? AND s.instatus = 'A'`
const message = {err: '', function: '', schema: 'sesion'}

const iniciaSesion = promisify(insertSesion)
const recuperaSesion = promisify(getSessionById)

async function getAll(cb) {
    message.function ='getAll'
    try {
        const dbcon = await getDbConnection()
        dbcon.query(SQL_QUERY_ALL, [], (err, response) => {
            if (err) {
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            response = JSON.stringify(response)
            console.log(`response: ${response}`)
            setImmediate(() => cb(null, response))
        })
    } catch (err) {
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }  finally {
        try {
            dbcon.release()
            console.log(`---> ${message.function}-realeasing session [OK]`)
        } catch(err){}
    }
}
async function startSession(userId, cb) {
    message.function = 'startSession'
    try {
        let sessionId = 0
        await iniciaSesion(userId)
        .then((data) => {
            if (data) {
                console.log(`iniciaSesion.data: ${data}`)
                sessionId = data.insertId                
            }
        })
        .catch((err) => {
            sessionId = -1
            message.err = err
            console.log(message)
            setImmediate(() => cb(err))
        })
        if(sessionId>0){
            await recuperaSesion(sessionId)
            .then((data) => {
                if(data){
                    console.log(`startSession: ${data}`)
                    setImmediate(() => cb(null, data))
                }
            })
            .catch((err) => {
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            })
        } else {
            setImmediate(() => cb(new Error(`Something wrong adding the session. ${sessionId}`)))
        }
    } catch(err) {
        message.err=err
        console.log(message)
        setImmediate(() => cb(err))
    }
}


async function insertSesion(userId, cb) {
    message.function = 'insertSesion'
    try {        
        const dbcon = await getDbConnection()
        dbcon.query(`INSERT INTO ${SESIONES} (dstoken, dtfecini, dtfecfin, instatus, idusuari, tmstmp) VALUES
        (md5(CONCAT(?,CURRENT_TIMESTAMP)), CURRENT_TIMESTAMP, ADDDATE(CURRENT_TIMESTAMP, INTERVAL 4 hour), 'A', ?, CURRENT_TIMESTAMP)`, 
        [userId, userId], (err, result) => {
            if(err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            if (result){
                console.log(`Session Data: ${JSON.stringify(result)}`)
                setImmediate(() => cb(null, result))
            } else {
                throw new Error('Something happen and the session was not created.')
            }
        })
    } catch (err) {
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    } finally {
        try {
            dbcon.release()
            console.log(`---> ${message.function}-realeasing session [OK]`)
        } catch(err){}
    }
}
async function killSession(token, cb) {
    message.function = 'killSession'
    try {        
        const dbcon = await getDbConnection()
        dbcon.query(`UPDATE ${SESIONES} SET instatus = 'C' WHERE dstoken = ?`, 
        [token], (err, result) => {
            if(err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            console.log(`data: ${result}`)
            setImmediate(() => cb(null, {status: 'Ok', message: `Rows affected: ${result.rowsAffected}`}))
        })
    } catch (err) {
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    } finally {
        try {
            dbcon.release()
            console.log(`---> ${message.function}-realeasing session [OK]`)
        } catch(err){}
    }
}

async function getSessionById(idSession, cb) {
    message.function = 'getSessionById'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(`SELECT dstoken, idusuari FROM ${SESIONES} WHERE idnumses = ? AND instatus = 'A';`, [idSession], (err, data) => {
            if(err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            } else {
                if (data){
                    console.log(`Session Data: ${JSON.stringify(data)}`)                        
                    setImmediate(() => cb(null, {token: data[0].dstoken, userId: data[0].idusuari}))
                } else {
                    throw new Error('Something happen and the session was not created.')
                }
            }
        })        
    } catch(err) {
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    } finally {
        try {
            dbcon.release()
            console.log(`---> ${message.function}-realeasing session [OK]`)
        } catch(err){}
    }
}

async function getUserByToken(token, cb) {
    message.function = 'getUserByToken'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FINDBY_TOKEN, [token], (err, data) => {
            if(err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            if (data[0]){
                setImmediate(() => cb(null, {userId: data[0].userId}))
            } else {
                setImmediate(() => cb({userId: -1}))
            }
            dbcon.release()
        })
    } catch(err) {
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    } finally {
        try {
            dbcon.release()
            console.log(`---> ${message.function}-realeasing session [OK]`)
        } catch(err){}
    }
}

module.exports={getAll, startSession, killSession, getUserByToken}