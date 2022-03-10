'use strict'

const {getDbConnection} = require('../connection')
const {PONDERADOS, PONDERADODETALLES, PROVEEDORES, CONCEPTOS, UNIDADESNEGOCIO} = require('../../configs/tables')
const SQL_FIND_ALL = `SELECT idnumpon id, dsnombre name, cdnrocon conceptId, c.dsnomcto concept, trim(cdcvepro) supplierId,  s.dsnomsup supplier
                    FROM ${PONDERADOS} p INNER JOIN ${PROVEEDORES} s ON trim(p.cdcvepro) = trim(s.idcvesup)
                    INNER JOIN ${CONCEPTOS} c ON p.cdnrocon = c.idnumcto`
const SQL_FINDBY_ID = `SELECT idnumpon id, dsnombre name, cdnrocon conceptId, c.dsnomcto concept, trim(cdcvepro) supplierId,  s.dsnomsup supplier
                    FROM ${PONDERADOS} p INNER JOIN ${PROVEEDORES} s ON trim(p.cdcvepro) = trim(s.idcvesup)
                    INNER JOIN ${CONCEPTOS} c ON p.cdnrocon = c.idnumcto 
                    WHERE p.idnumpon = ?`
const SQL_FINDBY_IDSUPPLIER = `SELECT idnumpon id, dsnombre name, cdnrocon conceptId, c.dsnomcto concept, trim(cdcvepro) supplierId,  s.dsnomsup supplier
                    FROM ${PONDERADOS} p INNER JOIN ${PROVEEDORES} s ON trim(p.cdcvepro) = trim(s.idcvesup)
                    INNER JOIN ${CONCEPTOS} c ON p.cdnrocon = c.idnumcto
                    WHERE trim(p.cdcvepro) = ?`
const SQL_FINDBY_SUPPLIER = `SELECT idnumpon id, dsnombre name, cdnrocon conceptId, c.dsnomcto concept, trim(cdcvepro) supplierId,  s.dsnomsup supplier
                    FROM ${PONDERADOS} p INNER JOIN ${PROVEEDORES} s ON trim(p.cdcvepro) = trim(s.idcvesup)
                    INNER JOIN ${CONCEPTOS} c ON p.cdnrocon = c.idnumcto
                    WHERE s.dsnomsup LIKE (?)`                    
const SQL_FINDBY_IDCONCEPT = `SELECT idnumpon id, dsnombre name, cdnrocon conceptId, c.dsnomcto concept, trim(cdcvepro) supplierId,  s.dsnomsup supplier
                    FROM ${PONDERADOS} p INNER JOIN ${PROVEEDORES} s ON trim(p.cdcvepro) = trim(s.idcvesup)
                    INNER JOIN ${CONCEPTOS} c ON p.cdnrocon = c.idnumcto
                    WHERE p.cdnrocon = ?`
const SQL_FINDBY_CONCEPT = `SELECT idnumpon id, dsnombre name, cdnrocon conceptId, c.dsnomcto concept, trim(cdcvepro) supplierId,  s.dsnomsup supplier
                    FROM ${PONDERADOS} p INNER JOIN ${PROVEEDORES} s ON trim(p.cdcvepro) = trim(s.idcvesup)
                    INNER JOIN ${CONCEPTOS} c ON p.cdnrocon = c.idnumcto
                    WHERE c.dsnomcto LIKE(?);`                    
const SQL_FINDBY_SUPPLIER_CONCEPT = `SELECT idnumpon id, dsnombre name, cdnrocon conceptId, c.dsnomcto concept, trim(cdcvepro) supplierId,  s.dsnomsup supplier
                    FROM ${PONDERADOS} p INNER JOIN ${PROVEEDORES} s ON trim(p.cdcvepro) = trim(s.idcvesup)
                    INNER JOIN ${CONCEPTOS} c ON p.cdnrocon = c.idnumcto
                    WHERE s.dsnomsup LIKE (?) AND c.dsnomcto LIKE(?);`                                        
const SQL_FIND_DETAILS = `SELECT idnumpon id, dsctacon account, p.idunineg businessUnitId, u.dsunineg businessUnit, flporuni percentage 
                        FROM ${PONDERADODETALLES} p INNER JOIN ${UNIDADESNEGOCIO} u ON p.idunineg = u.idunineg
                        WHERE p.idnumpon = ?`
const SQL_DELETEBY_ID = `DELETE FROM ${PONDERADOS} WHERE idnumpon = ?`
const SQL_DELETEBY_ID_DETAIL = `DELETE FROM ${PONDERADODETALLES} WHERE idnumpon = ? AND idunineg = ? AND dsctacon=?;`
const SQL_DELETEBY_ID_DETAILS = `DELETE FROM ${PONDERADODETALLES} WHERE idnumpon = ?`
const SQL_INSERT = `INSERT INTO ${PONDERADOS} (dsnombre, cdnrocon, cdcvepro, idusuari, tmstmp) VALUES (?,?,?,?,CURRENT_TIMESTAMP)`
const SQL_INSERT_DETAIL = `INSERT INTO ${PONDERADODETALLES} (idnumpon, dsctacon, idunineg, flporuni, tmstmp) VALUES (?,?,?,?,CURRENT_TIMESTAMP)`
const SQL_UPDATE_DETAIL = `UPDATE ${PONDERADODETALLES} SET flporuni=? WHERE idnumpon=? AND dsctacon=? AND idunineg = ?;`
const message = {err:'', function:'', schema:'ponderados'}

const {promisify} = require('util')
const agregaDetalle = promisify(addDetail)
const eliminaDetalles = promisify(deleteDetails)

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
            //console.log(`data: ${data}`)
            setImmediate(() => cb(null, data))
        })
        dbcon.release()
    } catch(err){
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
            //console.log(`data: ${data}`)
            setImmediate(() => cb(null, data))
        })
        dbcon.release()
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

async function getBySupplierId(supplierId, cb) {
    message.function = 'getBySupplierId'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FINDBY_SUPPLIER, [`%${supplierId}%`], (err, data) => {
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
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

async function getByConceptId(conceptId, cb) {
    message.function = 'getByConceptId'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FINDBY_CONCEPT, [`%${conceptId}%`], (err, data) => {
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
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}
async function getBySupplierConcept(supplier, concept, cb) {
    message.function = 'getBySupplierId'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FINDBY_SUPPLIER_CONCEPT, [`%${supplier}%`, `%${concept}%`], (err, data) => {
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
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}
async function getDetails(id, cb) {
    message.function = 'getDetails'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(SQL_FIND_DETAILS, [id], (err, data) => {
            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            console.log(`data: ${data}`)
            setImmediate(() => cb(null, data))
        })
        dbcon.release()
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

async function del(id, cb) {
    message.function = 'del'
    try{
        let isError = false
        await eliminaDetalles(id)
        .then((data) => {
            console.log(`data: ${data}`)
        })
        .catch((err) => {
            isError = true
            message.err = err
            console.log(message)
        })
        if(!isError){
            const dbcon = await getDbConnection()
            dbcon.query(SQL_DELETEBY_ID, [id], (err, data) => {
                if (err){
                    message.err = err
                    console.log(message)
                    setImmediate(() => cb(err))
                }
                if(data){
                    data = JSON.stringify(data)
                    console.log(`data: ${data}`)
                    setImmediate(() => cb(null, {status: 'ok', affectedRows: data.affectedRows}))
                } else {
                    setImmediate(() => cb(null, {status: 'ko', affectedRows: '-1'}))
                }            
            })
            try{
                dbcon.release()
            } catch(err) {}
        } else {
            setImmediate(() => cb(null, {status: 'ko', affectedRows: '-1'}))
        }
        
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    } 
}

async function deleteDetail(id, detail, cb) {
    message.function = 'deleteDetail'
    try {
        const dbcon = await getDbConnection()
        const {businessAreaId, baseAccount} = detail
        dbcon.query(SQL_DELETEBY_ID_DETAIL, [id, businessAreaId, baseAccount], (err, data) => {
            if (err) {
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            console.log(`data: ${data}`)
            setImmediate(() => cb(null, {status: 'ok'}))
        })
        dbcon.release()
    } catch (err) {
        message.err=err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

async function deleteDetails(id, cb) {
    message.function = 'deleteDetails'
    try{
        const dbcon = await getDbConnection()
        dbcon.query(SQL_DELETEBY_ID_DETAILS, [id], (err, data) => {
            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            if(data){
                data = JSON.stringify(data)
                console.log(`data: ${data}`)
                setImmediate(() => cb(null, {status: 'ok', affectedRows: data.affectedRows}))
            } else {
                setImmediate(() => cb(null, {status: 'ko', affectedRows: '-1'}))
            }            
        })
        dbcon.release()
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

async function add(ponderado, cb) {
    message.function = 'add'
    try{
        const dbcon = await getDbConnection()        
        const {name, concept, supplier, userId} = ponderado
        console.log(`name: ${name}, concept: ${concept}, supplier: ${supplier}, userId: ${userId}`)
        dbcon.query(SQL_INSERT, [name, concept, supplier, userId], (err, data) => {
            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            if(data){
                data = JSON.stringify(data)
                console.log(`data: ${data}`)
                setImmediate(() => cb(null, {status: 'ok', affectedRows: data.affectedRows}))
            } else {
                setImmediate(() => cb(null, {status: 'ko', affectedRows: '-1'}))
            }            
        })
        dbcon.release()
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

/***
 * ponderados.addDetails
 * Receives an array with object's detail of a "ponderado"
 * idnumpon, dsctacon, idunineg, flporuni, tmstmp
 */
async function addDetails(details, cb) {
    message.function = 'addDetails'
    try{
        console.log(`======================================== ***** =========================================
        \nDetails to insert:\n${JSON.stringify(details)}\n
        ======================================== ***** =========================================`)
        const {id, items} = details
        console.log(`id: ${id}, items: ${items}`)
        let affectedRows = 0, fail = {}
        await Promise.all(items.map(async (item) => {
            console.log(`preparing call to agregaDetalle(${id}, ${JSON.stringify(item)})`)
            await agregaDetalle(id, item)
            .then((data) => {
                console.log(`Promise-data: ${JSON.stringify(data)}`)    
                affectedRows += data.affectedRows
            })
            .catch((err) => {
                fail = {item: item, err: err}
            })
        }))
        setImmediate(() => cb(null, {status: 'ok', affectedRows: affectedRows, fail: fail}))
        dbcon.release()
    } catch(err){
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

async function addDetail(id, item, cb) {
    try {
        const dbcon = await getDbConnection()
        console.log(`==> promise for ${JSON.stringify(item)}`)
        const {baseAccount, businessAreaId, percentage} = item
        console.log(`<=== promise for ${baseAccount}, ${businessAreaId}, ${percentage}`)
        dbcon.query(SQL_INSERT_DETAIL, [id, baseAccount, businessAreaId, percentage], (err, data) => {
            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            if(data){
                // console.log(`<== result for ${JSON.stringify(item)} = ${JSON.stringify(data)}`)
                // data = JSON.stringify(data)
                // console.log(`insert-data: ${data}`)
                setImmediate(() => cb(null, {status: 'ok', affectedRows: data.affectedRows}))
            } else {
                setImmediate(() => cb(null, {status: 'ko', affectedRows: '-1'}))
            }            
        })        
        dbcon.release()
    } catch(err) {
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}
async function updateDetail(id, item, cb) {
    try{
        const dbcon = await getDbConnection()
        // console.log(`==> promise for ${JSON.stringify(item)}`)
        const {baseAccount, businessAreaId, percentage} = item
        console.log(`id, item`, id, item)
        dbcon.query(SQL_UPDATE_DETAIL, [percentage, id, baseAccount, businessAreaId], (err, data) => {      

            if (err){
                message.err = err
                console.log(message)
                setImmediate(() => cb(err))
            }
            if(data){
                // console.log(`<== result for ${JSON.stringify(item)} = ${JSON.stringify(data)}`)
                // data = JSON.stringify(data)
                // console.log(`insert-data: ${data}`)
                setImmediate(() => cb(null, {status: 'ok', affectedRows: data.affectedRows}))
            } else {
                setImmediate(() => cb(null, {status: 'ko', affectedRows: '-1'}))
            }            
        })        
        dbcon.release()
    } catch(err) {
        message.err = err
        console.log(message)
        setImmediate(() => cb(err))
    }
}

module.exports={
    getAll, getById, getByConceptId, getBySupplierId, getDetails, add, addDetails, del, deleteDetail, getBySupplierConcept, updateDetail, addDetail
}