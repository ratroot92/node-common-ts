const multer = require("multer");
const path = require("path");
const { isNumeric } = require("../helpers/checks");
const ApiError = require("../error/api.error");
const logging = require("../helpers/logging");
const Exam = require("../classes/Exams/Exams");
const stringUtils = require("../utils/string.utils");
const fileSystemUtils = require("../utils/fileSystemUtils");
const regexUtils = require("../utils/regex.utils");
const { Mcq } = require("../classes/Mcq/Mcq");

const NAMESPACE = "commonMiddleware";
const commonMiddlewares = {
  logRequestBody: (req, res, next) => {
    try {
      console.log("=================================");
      Object.keys(req.body).forEach((key, index) => {
        console.log(`[${index}] ==> [${key}] = [${req.body[key]}]`);
      });
      console.log("=================================");
      next();
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },
  routeInfo: (req, res, next) => {
    logging.debug(NAMESPACE, `[${req.url}]`);
    next();
  },
  attachParams: async (req, res, next) => {
    try {
      req.locals = {};
      if (Object.keys(req.params).length !== 0) {
        Object.entries(req.params).forEach(([key, value]) => {
          req.locals[key] = isNumeric(value) ? parseInt(value, 10) : value;
        });
      } else {
        throw new Error("params are missing ");
      }

      next();
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  },

  verifyExam: async (req, res, next) => {
    logging.debug(NAMESPACE, "[verifyExam]");
    try {
      const { id } = req.locals;
      if (!id) return next(ApiError.badRequest("Exam Id is required."));
      const isValid = stringUtils.isNumeric(id);
      if (!isValid) return next(ApiError.badRequest("Exam Id is not valid."));
      const exist = await Exam.examExist(id);
      if (exist) {
        req.locals.exam = await Exam.examById(req.locals.id);
        return next();
      }
      return next(ApiError.badRequest(`Exam with id ${id} does not exist`));
    } catch (e) {
      return next(ApiError.badRequest(e.message));
    }
  },
  parseParamToPrimitiveType: (param) => (req, res, next) => {
    try {
      if (req.locals[param] === "true") {
        req.locals[param] = true;
      } else if (req.locals[param] === "false") {
        req.locals[param] = false;
      } else if (req.locals[param] === "0") {
        req.locals[param] = 0;
      } else if (req.locals[param] === "1") {
        req.locals[param] = 1;
      }
      return next();
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },
  verifyQuestion: async (req, res, next) => {
    logging.debug(NAMESPACE, "[verifyQuestion]");
    try {
      const { questionId } = req.locals;
      if (!questionId) return next(ApiError.badRequest("Mcq Id is required."));
      const isValid = stringUtils.isNumeric(questionId);
      if (!isValid) return next(ApiError.badRequest("Mcq Id is not valid."));
      const exist = await Mcq.questionExist(questionId);
      if (exist) return next();
      return next(
        ApiError.badRequest(`Mcq with id ${questionId} does not exist`)
      );
    } catch (e) {
      return next(ApiError.badRequest(e.message));
    }
  },
  /**
   *
   * @param {*} param
   * @param {*} type  ["string","number"]
   * @returns
   */
  ensureParamExistInRequestBody: (param, type) => (req, res, next) => {
    try {
      if (
        !req.body[param] &&
        req.body[param] !== 0 &&
        req.body[param] !== "0"
      ) {
        return next(
          ApiError.badRequest(`Param '${param}' does not exist in body. `)
        );
      }

      if (type === "int") {
        if (stringUtils.isNumeric(req.body[param])) {
          req.body[param] = parseInt(req.body[param], 10);
          return next();
        }

        return next(ApiError.badRequest(`Param '${param} should be number.`));
      }
      if (type === "object") {
        if (
          typeof req.body[param] === "object" &&
          Object.keys(req.body[param].length > 0) &&
          req.body[param] !== null
        ) {
          return next();
        }
        return next(ApiError.badRequest(`Param '${param} should be object.`));
      }

      if (type === "array") {
        if (Array.isArray(req.body[param]) && req.body[param].length > 0) {
          return next();
        }
        // if (typeof req.body[param] === 'string') {
        //   req.body[param] = JSON.parse(req.body[param]);
        //   return next();
        // }

        return next(ApiError.badRequest(`Param '${param} should be array.`));
      }
      if (type === "email") {
        if (regexUtils.EMAIL_REGEX.test(req.body[param])) return next();
        return next(
          ApiError.badRequest(`Param '${param} shoud be a valid email.`)
        );
      }
      if (type === "both") {
        if (
          typeof req.body[param] === "string" ||
          stringUtils.isNumeric(req.body[param])
        ) {
          return next();
        }
        return next(
          ApiError.badRequest(
            `Param '${param} shoud be either string or number..`
          )
        );
      }
      if (type === "string") {
        if (
          typeof req.body[param] === "string" &&
          !stringUtils.isNumeric(req.body[param])
        ) {
          // req.body[param] = stringUtils.cleanMysqlString(req.body[param]);
          return next();
        }

        return next(ApiError.badRequest(`Param '${param} shoud be a string.`));
      }
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },
  ensureObjectHasKeys: (param, keys) => (req, res, next) => {
    try {
      if (keys && keys.length > 0) {
        if (Object(req.body[param].length > 0)) {
          Object.keys(
            req.body[param].forEach((key) => {
              keys.include(key);
            })
          );
        } else {
          throw new Error(`Param ${param} is required`);
        }
      } else {
        throw new Error("keys [] is required.");
      }
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },
  ensureParamExistInRequestLocalilty: (param, type) => (req, res, next) => {
    try {
      if (req.params[param] === "") {
        return next(
          ApiError.badRequest(
            `Param '${param}' does not exist in request locality. `
          )
        );
      }

      if (type === "int") {
        if (stringUtils.isNumeric(req.params[param])) {
          req.params[param] = parseInt(req.params[param], 10);
          return next();
        }

        return next(ApiError.badRequest(`Param '${param} should be number.`));
      }

      if (type === "array") {
        if (Array.isArray(req.params[param]) && req.params[param].length > 0) {
          return next();
        }

        return next(ApiError.badRequest(`Param '${param} should be array.`));
      }
      if (type === "string") {
        if (
          typeof req.params[param] === "string" &&
          !stringUtils.isNumeric(req.params[param])
        ) {
          // req.params[param] = stringUtils.cleanMysqlString(req.params[param]);
          return next();
        }

        return next(ApiError.badRequest(`Param '${param} shoud be a string.`));
      }

      return next(ApiError.badRequest("No  param type matched."));
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },
  ensureParamIsOneOfBodyLocality:
    (param, allowedValues) => (req, res, next) => {
      try {
        if (param) {
          if (stringUtils.isNumeric(param)) {
            param = Number(param);
          }
          if (Array.isArray(allowedValues) && allowedValues.length) {
            if (!allowedValues.includes(req.body[param])) {
              throw new Error(
                `Param '${param}' could have one of following '${[
                  ...allowedValues,
                ]}' .`
              );
            } else {
              return next();
            }
          } else {
            return next(
              ApiError.badRequest(
                `Param '${req.body[param]}' has invalid value.`
              )
            );
          }
        } else {
          return next(
            ApiError.badRequest(`Param '${req.body[param]}' is required.`)
          );
        }
      } catch (err) {
        return next(ApiError.intervalServerError(err.message));
      }
    },

  ensureParamIsOneOfInRequestLocality:
    (param, allowedValues) => (req, res, next) => {
      try {
        if (param) {
          if (stringUtils.isNumeric(param)) {
            param = Number(param);
          }
          if (Array.isArray(allowedValues) && allowedValues.length) {
            if (!allowedValues.includes(req.locals[param])) {
              throw new Error(
                `Param '${param}' could have one of following '${[
                  ...allowedValues,
                ]}' .`
              );
            } else {
              return next();
            }
          } else {
            return next(
              ApiError.badRequest(
                `Param '${req.locals[param]}' has invalid value.`
              )
            );
          }
        } else {
          return next(
            ApiError.badRequest(`Param '${req.locals[param]}' is required.`)
          );
        }
      } catch (err) {
        return next(ApiError.intervalServerError(err.message));
      }
    },

  allowedParamsInRequestBody: (paramList) => (req, res, next) => {
    try {
      if (paramList.length) {
        paramList.forEach((param) => {
          if (!req.body[param])
            throw new Error(`Param '${param}' does not exist.`);
        });
      }
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },
  parseFormData: (uploadFileName, uploadFileDir, imageStartName) => {
    const storage = multer.diskStorage({
      destination: uploadFileDir,
      // destination(req, file, cb) {
      //   cb(null, uploadFileDir);
      // },
      filename(req, file, cb) {
        cb(
          null,
          `${imageStartName}_${Date.now()}${path.extname(file.originalname)}`
        );
      },
    });
    const upload = multer({
      storage,
      // fileFilter(req, file, callback) {
      //   const ext = path.extname(file.originalname);
      //   if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      //     return callback(new Error('Only images are allowed'));
      //   }
      //   callback(null, true);
      // },
      limits: { fileSize: 3000000 },
    }).single(uploadFileName);
    return (req, res, next) => {
      try {
        return upload(req, res, async (err) => {
          if (err instanceof multer.MulterError) {
            throw new Error(err.message);
            // A Multer error occurred when uploading.
          } else if (err) {
            throw new Error(err.message);
            // An unknown error occurred when uploading.
          } else {
            if (!req.file)
              return next(ApiError.badRequest("failed to find any file."));
            const { filename } = req.file;
            req.body.media = `${uploadFileDir}/${filename}`;
            req.body.media = stringUtils.addDomainToPath(
              req.body.media,
              path.join(__dirname, "../../")
            );
            // await fileSystemUtils.unlinkFile(`${uploadFileDir}/${filename}`);
            return next();
          }
        });
      } catch (err) {
        return next(ApiError.intervalServerError(err.message));
      }
    };
  },
  parseStringParamToArray: (param) => (req, res, next) => {
    try {
      req.body[param] = JSON.parse(req.body[param]);
      return next();
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },
  applyCache: (key) => async (req, res, next) => {
    try {
      if (key === "") throw new Error("Key is required.");
      const data = await req.redis.get(key);
      if (data !== null) {
        req.cache.isCached = true;
        req.cache[key] = JSON.parse(data);
      } else {
        req.cache.isCached = false;
      }
      return next();
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },

  exists: (model, paramName, entityName) => async (req, res, next) => {
    try {
      if (req.locals[paramName]) {
        const entity = await model.byId(req.locals[paramName]);
        if (entity) {
          req.locals[entityName] = entity;
          return next();
        }

        return next(ApiError.badRequest(`${entityName} not found.`));
      }
      return next(ApiError.badRequest(`invalid ${entityName} id.`));
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },
  cacheMcqs: async (req, res, next) => {
    try {
      const data = await Mcq.getAllQuestions();
      await req.redis.set(
        Mcq.redisKey,
        JSON.stringify(data),
        "EX",
        60 * 60 * 24
      );
      // await req.redis.expire(Mcq.redisKey, 0);
      return next();
    } catch (err) {
      return next(ApiError.intervalServerError(err.message));
    }
  },
};

module.exports = commonMiddlewares;
