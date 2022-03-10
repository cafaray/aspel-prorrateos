'use strict'

const {getDBInstance} = require('./configs/connection')
const tables = require('./configs/tables')

const test = async () => {
    const dbcon = await getDBInstance()
    //console.log(dbcon)
    try{
        dbcon.query(`SELECT SUBSTRING(CAST(fecha_doc as VARCHAR(24)) FROM 1 FOR 10) fecha, fecha_doc, tip_doc, trim(cve_doc) documento,trim(cve_clpv) proveedor 
            FROM ${tables.COMPRAS}         
            WHERE fecha_doc >= '2021-12-01'
            ORDER BY FECHA_DOC DESC`, (err,data) => {            
            if (err){
                console.log(`Error querying: ${err}`)
                return
            }
            console.log(data)
            return
        })
    } catch(err){
        console.log(`Error querying: ${err}`)
        return
    }
}
test()
