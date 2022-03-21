const fs = require('fs')
const util = require('util')

const promisified = {
    existsAsync: util.promisify(fs.exists),
    mkdirAsync: util.promisify(fs.mkdir),
    unlinkAsync: util.promisify(fs.unlink),
}

class FileSystemUtils {
    constructor() {}

    static async createPathIfNotExist(dirPath) {
        try {
            if (!dirPath) throw new Error('dirPath is required.')

            if (!(await promisified.existsAsync(dirPath))) {
                await promisified.mkdirAsync(dirPath, { recursive: true })
                return true
            }

            return false
        } catch (err) {
            throw new Error(err.message)
        }
    }

    static async deleteFile(filePath) {
        try {
            if (!filePath) throw new Error('filePath is required.')

            if ((await promisified.existsAsync(filePath)) === true) {
                await promisified.unlinkAsync(filePath)
                return true
            }

            return false
        } catch (err) {
            throw new Error(err.message)
        }
    }
}

const fileSystemUtils = new FileSystemUtils()
module.exports = { fileSystemUtils, FileSystemUtils }
