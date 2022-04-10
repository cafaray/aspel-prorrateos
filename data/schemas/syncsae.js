'use strict'

const {getDbConnection} = require('../connection')
const poolConnections = require('../pool')
const {PROVEEDORES, CONCEPTOS} = require('../../configs/tables')
const {promisify} = require('util')
const SQL_SYNC_SUPPLIERS = `INSERT INTO ${PROVEEDORES} 
(idcvesup,dsnomsup,dsrfcsup,dscurpsu,dsctacon,idtipter,idtipope,cdstatus) VALUES 
(trim(?),IFNULL(?, ''),IFNULL(?, ''),IFNULL(?, ''),IFNULL(?, ''),?,?,?);`
const SQL_SYNC_CONCEPTS = `INSERT INTO ${CONCEPTOS} 
(idnumcto,dsnomcto,dstipcto,dsctacon,inautori,insigno,cdstatus) VALUES 
(?,?,IFNULL(?, ''),IFNULL(?, ''),?,?,?)`
const SQL_FIND_ALL_SUPPLIERS = `SELECT idcvesup CLAVE,dsnomsup NOMBRE,dsrfcsup RFC,dscurpsu CURP,cdstatus STATUS 
    FROM ${PROVEEDORES} ORDER BY CLAVE`
const SQL_FIND_ALL_CONCEPTS = `SELECT idnumcto ID,dsnomcto CONCEPTO,dstipcto TIPO,dsctacon CUENTA,cdstatus STATUS
    FROM ${CONCEPTOS} ORDER BY ID`

const message = {function: '', schema:'syncsae', err:''}

const addSupplier = promisify(insertSupplier)
const addConcept = promisify(insertConcept)
const getConnection = promisify(getConnectionFromPool)
const deleteSuppliers = promisify(deleteAllSuppliers)

async function getConnectionFromPool(pool, cb){
    if(pool){
        pool.getConnection(function (err, connection){
            if(err){
                console.log('error getting connection from the pool\n', err)
                setImmediate(() => cb(err))
            } else {
                setImmediate(() => cb(null, connection))
            }
        })
    } else {
        setImmediate(() => cb(new Error('No pool connection found!')))
    }
}


async function insertConcept(concept, dbcon, cb) {
    message.function = 'insertConcept'
    try{
        const {conceptId, name, type, account,auth,symbol,status} = concept
        console.log(`trying to insert concept: ${conceptId} - ${name}`)        
        dbcon.query(SQL_SYNC_CONCEPTS, [conceptId, name, type, account, auth, symbol, status], (err, data) => {
            if(err){
                console.log(err)
                message.err = err
                setImmediate(() => cb(err))
            }
            console.log(`insertConcept: ${JSON.stringify(data)}`)
            setImmediate(() => cb(null, data.affectedRows))
        })
    } catch(err){
        console.log(err)
        message.err = err
        setImmediate(() => cb(err))
    }    
}
async function insertSupplier(supplier, dbcon, cb) {
    message.function = 'insertSupplier'
    try{
        console.log(`trying to insert supplier: ${supplier.supplierId} - ${supplier.name}`)
        const {supplierId,name,rfc,curp,account,type,typeOper,status} = supplier
        dbcon.query(SQL_SYNC_SUPPLIERS, [supplierId,name,rfc,curp,account,type,typeOper,status], (queryerr, data) => {
            if(queryerr){
                console.log(`***> Error inserting supplier: ${supplier.supplierId}\n${queryerr}`)
                message.err = queryerr
                setImmediate(() => cb(queryerr))
            }
            console.log(`insertSupplier: ${JSON.stringify(data)}`)
            setImmediate(() => cb(null, data.affectedRows))
        })
    } catch(err){
        console.log(err)
        message.err = err
        setImmediate(() => cb(err))
    }    
}

async function getSuppliers(cb) {
    message.function = 'getSuppliers'
    try {
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FIND_ALL_SUPPLIERS, (err, data) => {
            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            //console.log(`data: ${data}`)
            setImmediate(() => cb(null, data))
        })
        dbcon.release()

    } catch(err) {
        console.log(err)
        message.err = err
        setImmediate(() => cb(err))
    }
}
async function getConcepts(cb) {
    message.function = 'getConcepts'
    try {
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FIND_ALL_CONCEPTS, (err, data) => {
            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            //console.log(`data: ${data}`)
            setImmediate(() => cb(null, data))
        })
        dbcon.release()

    } catch(err) {
        console.log(err)
        message.err = err
        setImmediate(() => cb(err))
    }
}

async function deleteAllSuppliers() {
    err.function = 'deleteAllSuppliers'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(`DELETE FROM ${PROVEEDORES};`, (err, data) => {
            if (err){
                console.log('Error deleting data:', err)
                err.message = err
                setImmediate(() => cb(err))
            }
            console.log('It seems everything goes well deleting providers:', data)
            setImmediate(() => cb(null, data))
        })
    } catch(err){
        console.log('Exception deleting suppliers:', err)
        message.err = err
        setImmediate(() => cb(err))
    }
}

async function syncSuppliers(suppliers, cb) {
    message.function = 'syncSuppliers'
    try{
        const pool = await poolConnections()        
        let rows =0, missing = 0
        await deleteSuppliers()
        .then((data) => {
            console.log('Suppliers were removed from table, going ahead ...')
        })
        .catch((err) => {
            console.log('Error sincyng suppliers', err)
            setImmediate(() => cb(err))
        })
        await Promise.all(suppliers.map(async (supplier) => {            
            const {CLAVE, STATUS, NOMBRE, RFC, CURP, TIP_TERCERO, TIP_OPERA, CUENTA_CONTABLE} = supplier
            const record = {supplierId:CLAVE,name: NOMBRE,rfc: RFC,curp: CURP,account:CUENTA_CONTABLE,type:TIP_TERCERO,typeOper:TIP_OPERA,status:STATUS}
            let dbcon            
            await getConnection(pool)
            .catch((err) => {
                console.log(`Error getting connection from pool: ${err}`)
            })
            .then((connection) => {
                dbcon = connection
            })            
            if (dbcon){
                await addSupplier(record, dbcon)
                .then((data) => {                    
                    if(data) rows += data
                    dbcon.release()
                })  
                .catch((err) => {
                    missing+=1
                })  
            }
        }))
        setImmediate(() => cb(null, {status: 'ok', affectedRows: rows, missingRows: missing}))
    } catch(err){
        console.log(err)
        message.err = err
        setImmediate(() => cb(err))
    }
}

async function syncConcepts(concepts, cb) {
    message.function = 'synConcepts'
    try{
        const pool = await poolConnections()
        let rows =0, missing = 0
        await Promise.all(concepts.map(async (concept) => {            
            let dbcon = undefined
            await getConnection(pool)
            .catch((err) => {
                console.log(`Error getting connection from pool: ${err}`)
            })
            .then((connection) => {
                dbcon = connection
            })            
            if (dbcon){
                const {NUM_CPTO, DESCR, TIPO, CUEN_CONT, AUTORIZACION, SIGNO, STATUS} = concept
                concept = {conceptId:NUM_CPTO, name:DESCR, type:TIPO, account:CUEN_CONT,auth:AUTORIZACION,symbol:SIGNO,status:STATUS}        
                await addConcept(concept, dbcon)
                .then((data) => {
                    if(data) rows+=data
                    dbcon.release()
                })            
                .catch((err) => {
                    console.log(`error inserting concept ${concept.conceptId}:\n===> ${err}`)
                    missing+=1
                })
            }
        }))
        // console.log(`rowsAffected: ${rows}, missing: ${missing}`)
        setImmediate(() => cb(null, {status: 'ok', rowsAffected: rows, missing: missing}))
    } catch(err){
        console.log(err)
        message.err = err
        setImmediate(() => cb(err))
    }
}

module.exports={syncConcepts, syncSuppliers, getConcepts, getSuppliers}