'use strict'

const {getDbConnection} = require('../connection')
const {UNIDADESNEGOCIO} = require('../../configs/tables')
const SQL_FIND_ALL = `SELECT * FROM ${UNIDADESNEGOCIO} ORDER BY dsunineg;`
const SQL_FINDBY_ID = `SELECT * FROM ${UNIDADESNEGOCIO} WHERE idunineg = ?;`
const SQL_INSERT = `INSERT INTO ${UNIDADESNEGOCIO} (cdabrevi, dsunineg, id_ant, idusuari, tmstmp) 
                                        VALUES (?,?,?,?,CURRENT_TIMESTAMP);`

const message = {err: '', function: '', schema: 'unidadnegocio'}
async function getAll(cb) {
    message.function = 'unidades.getAll'
    try {
        console.log('===> Unidades . Getting connection')
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FIND_ALL, (err, data) => {
            if (err){
                message.err = err
                console.log(err)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            //console.log(`data: ${data}`)
            setImmediate(() => cb(null, data))
        })
    } catch(err){
        message.err = err
        console.log(err)
        setImmediate(() => cb(err))
    } finally {
        try {
            dbcon.release()
            console.log(`---> ${message.function}-realeasing session [OK]`)
        } catch(err){}
    }
}

async function getById(id, cb) {
    message.function = 'unidades.getById'
    try {
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FINDBY_ID, [id], (err, data) => {
            if (err){
                message.err = err
                console.log(err)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            //console.log(`data: ${data}`)
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        message.err = err
        console.log(err)
        setImmediate(() => cb(err))
    } finally {
        try {
            dbcon.release()
            console.log(`---> ${message.function}-realeasing session [OK]`)
        } catch(err){}
    }
}

async function insert(unidad, cb) {
    message.function = 'unidades.insert'
    try {
        const dbcon = await getDbConnection()
        const {shortid, name, previousId, userId} = unidad
        dbcon.query(SQL_INSERT, [shortid, name, previousId, userId ], (err, data) => {
            if (err){
                message.err = err
                console.log(err)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            console.log(`data: ${data}`)
            setImmediate(() => cb(null, {status: 'ok', affectedRows: data.affectedRows}))
        })
    }catch(err){
        message.err = err
        console.log(err)
        setImmediate(() => cb(err))
    } finally {
        try {
            dbcon.release()
            console.log(`---> ${message.function}-realeasing session [OK]`)
        } catch(err){}
    }
}
module.exports={getAll, getById, insert}