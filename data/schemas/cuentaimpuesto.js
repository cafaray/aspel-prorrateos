'use strict'

const {getDbConnection} = require('../connection')
const {CUENTASIMPUESTO} = require('../../configs/tables')

const message = {err: '', function : '', schema: 'cuentaimpuesto'}
const SQL_FIND_ALL = `SELECT cdcueimp id, dscuenta cuenta, dsdescue impuesto FROM ${CUENTASIMPUESTO} ORDER BY tmstmp desc`
const SQL_FINDBY_ID = `SELECT cdcueimp id,  dscuenta cuenta, dsdescue impuesto FROM ${CUENTASIMPUESTO} WHERE cdcueimp = ? ORDER BY tmstmp desc`
const SQL_UPDATEBY_ID = `UPDATE ${CUENTASIMPUESTO} SET dscuenta=?, dsdescue=?, instatus = ?, tmstmp = CURRENT_TIMESTAMP WHERE cdcueimp = ?;`


/***
 * setById: upgrade a record in table CUENTASIMPUESTO
 * id: the identifiaction of the record
 * cuentaImpuesto: an object with properties: cuenta, descuento, and status
 * returns the affected rows
 */
async function setById(cuentaImpuesto, cb) {
    message.function='setById'
    try{
        const dbcon = await getDbConnection()
        console.log(`json.cuentaImpuesto: ${JSON.stringify(cuentaImpuesto)}`)
        // console.log(`cuentaImpuesto.account: ${cuentaImpuesto.account}, cuentaImpuesto.description: ${cuentaImpuesto.description}, cuentaImpuesto.status: ${cuentaImpuesto.status}, id: ${cuentaImpuesto.id}`)
        dbcon.query(SQL_UPDATEBY_ID, [cuentaImpuesto.account, cuentaImpuesto.description, cuentaImpuesto.status, cuentaImpuesto.id], (err, data) => {
            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            if (data){
                console.log(`data: ${JSON.stringify(data)}`)
                setImmediate(() => cb(null, {status: 'ok', message:`Rows affected: ${data.affectedRows}`}))
            } else {
                setImmediate(() => cb(null, {status: 'ko', message:`Something went wrong and te record was not updated!`}))
            }
        })
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

async function getAll(cb) {
    message.function = 'getAll'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FIND_ALL, [], (err, data) => {
            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            console.log(`data: ${data}`)
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

async function getById(id, cb) {
    message.function = 'getById'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FINDBY_ID, [id], (err, data) => {
            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            console.log(`data: ${data}`)
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

module.exports={getAll, getById, setById}