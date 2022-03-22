/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
const multer = require('multer')
const ApiError = require('../error/error')
const { FileSystemUtils } = require('../fileSystemUtils')
const { MalikLogger } = require('../logger')
const { MulterUtils } = require('../multer')

class CommonMiddleware extends MalikLogger {
    static constructorTypes = ['String', 'Number', 'Array', 'Object']
    constructor() {
        super()
    }

    inspectRequestBody(req, res, next) {
        MalikLogger.inspectObject(req.body)
        return next()
    }

    ensureBodyHas(key, type = '') {
        return (req, res, next) => {
            try {
                const { body } = req
                if (body[key] !== '' && body[key] !== undefined && body[key] !== null) {
                    if (type === '') {
                        if (body[key].constructor.name === 'String') {
                            req.body[key] = body[key].trim()
                            return next()
                        }
                    } else {
                        if (CommonMiddleware.constructorTypes.includes(type)) {
                            if (body[key].constructor.name === type) {
                                if (body[key].constructor.name === 'String') {
                                    req.body[key] = body[key].trim()
                                    return next()
                                } else if (body[key].constructor.name === 'Number') {
                                    req.body[key] = Number(body[key].trim())
                                    return next()
                                }
                            } else {
                                throw new Error(`param '${key}' has a type '${body[key].constructor.name}' expected '${type}' `)
                            }
                        } else {
                            throw new Error('invalid constructor type')
                        }
                    }

                    return next()
                }
                throw new Error(`param '${key}' is required`)
            } catch (err) {
                return next(ApiError.badRequest(err.message))
            }
        }
    }

    ensureBodyHasMany(bodyParamsList = []) {
        return (req, res, next) => {
            try {
                const { body } = req
                if (bodyParamsList.constructor.name === 'Array') {
                    if (bodyParamsList.length > 0) {
                        if (Object.keys(body).length) {
                            const bodyParamsList = Object.keys(body)
                            const missing = bodyParamsList.reduce((missingParams, el) => {
                                if (bodyParamsList.includes(el) === false) {
                                    missingParams.push(el)
                                }
                                return missingParams
                            }, [])
                            if (missing.length === 0) return next()
                            throw new Error(`incomplete request body ${missing.length > 1 ? 'params' : 'param'} [${[...missing]}] are required`)
                        }
                    } else {
                        throw new Error('params array is empty')
                    }
                }
                throw new Error('invalid params array')
            } catch (err) {
                return next(ApiError.badRequest(err.message))
            }
        }
    }

    handleFormData(mediaKey, destination) {
        return async (req, res, next) => {
            await FileSystemUtils.createPathIfNotExist(destination)
            const upload = new MulterUtils({
                destination,
                mediaKey,
            }).uploadSingle()
            return upload(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    return next(err.message)
                }
                if (err) {
                    return next(err.message)
                }
                req.body[mediaKey] = req.file
                return next()
            })
        }
    }

    logRequestBody(req, next) {
        const { body } = req
        if (Object.keys(body).length > 0) {
            Object.keys(body).forEach((key, index) => {
                if (body[key].constructor.name === 'String') {
                } else if (body[key].constructor.name === 'Object' && Object.keys(body[key]).length > 0) {
                    MalikLogger.logObject(key, body[key], index)
                } else if (body[key].constructor.name === 'Array') {
                    MalikLogger.logArray(key, body[key], index)
                }
            })

            return next()
        }

        return next()
    }
    ensurePathVar(pathVar = 'id', type) {
        return async (req, res, next) => {
            try {
                if (req.params.id.split('').includes(':')) {
                    throw new Error(`path variable '${pathVar}' is required`)
                } else {
                    const re = /^[0-9a-fA-F]{24}$/
                    if (re.test(req.params[pathVar]) === false) throw new Error(`path variable '${pathVar}' is not a valid ObjectId`)
                    else {
                        return next()
                    }
                }
            } catch (err) {
                return next(ApiError.badRequest(err.message))
            }
        }
    }
    ensureQueryParams(queryParamsList = []) {
        return async (req, res, next) => {
            try {
                if (Object.keys(req.query).length === 0) {
                    throw new Error(`query params are required`)
                } else {
                    if (queryParamsList.constructor.name === 'Array' && queryParamsList.length > 0) {
                        const querParamsList = Object.keys(req.query)
                        const missing = queryParamsList.reduce((missingParams, el) => {
                            if (querParamsList.includes(el) === false) {
                                missingParams.push(el)
                            }
                            return missingParams
                        }, [])
                        if (missing.length === 0) return next()
                        throw new Error(`incomplete request body ${missing.length > 1 ? 'params' : 'param'} [${[...missing]}] are required`)
                    } else {
                        throw new Error(`path variable '${queryParamsList}' is required`)
                    }
                }
            } catch (err) {
                return next(ApiError.badRequest(err.message))
            }
        }
    }
}

const commonMiddleware = new CommonMiddleware()

module.exports = { commonMiddleware, CommonMiddleware }
