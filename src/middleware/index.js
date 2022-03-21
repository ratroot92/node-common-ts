/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-useless-constructor */
const { malikLogger, MalikLogger } = require('../logger')

class CommonMiddleware extends MalikLogger {
    constructor() {
        super()
    }

    inspectRequestBody(req, res, next) {
        MalikLogger.inspectObject(req.body)
        return next()
    }

    logRequestBody(req, res, next) {
        console.log('\x1b[32m==============================\x1b[32m')
        console.log('\n')
        const { body } = req
        if (Object.keys(body).length > 0) {
            Object.keys(body).forEach((key, index) => {
                if (body[key].constructor.name === 'String') {
                    console.log(`\x1b[33m[${index}] => key [${key}] value [${body[key]}]\x1b[33m`)
                } else if (body[key].constructor.name === 'Object' && Object.keys(body[key]).length > 0) {
                    MalikLogger.logObject(key, body[key], index)
                } else if (body[key].constructor.name === 'Array') {
                    MalikLogger.logArray(key, body[key], index)
                }
            })
            console.log('\x1b[32m==============================\x1b[32m')

            return next()
        }

        console.log('\x1b[32m==============================\x1b[32m')

        return next()
    }
}

const commonMiddleware = new CommonMiddleware()

module.exports = { commonMiddleware, CommonMiddleware }
