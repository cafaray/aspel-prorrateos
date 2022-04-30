const pino = require('pino')
const { join } = require('path')

const file = join('/tmp', `${process.pid}-aspel-prorrateos.log`)
console.log('log file located at:', file)
const logger = pino({    
      level: 'info',   
    }, 
    pino.destination(file))

module.exports=logger