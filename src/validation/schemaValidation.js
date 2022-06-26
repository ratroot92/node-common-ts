const path = require("path");
const { ApiError } = require("../error");

const customValidate = async (schema, data) => {
  const asyncRules = [];
  const { value, error } = schema.validate(data, { context: { asyncRules } });
  const asyncErrors = [];
  const all = await Promise.all(
    asyncRules.map(async (rule) => {
      try {
        await rule();
        return rule;
      } catch (error) {
        let parsedStr = error.message.replace(/"/gi, "");
        asyncErrors.push(parsedStr);
        return error;
      }
    })
  );
  return { value, error, asyncErrors };
};

function unescapeSlashes(str) {
  let parsedStr = str.replace(/(^|[^\\])(\\\\)*\\$/, "$&\\");
  parsedStr = parsedStr.replace(/(^|[^\\])((\\\\)*")/g, "$1\\$2");
  try {
    parsedStr = JSON.parse(`"${parsedStr}"`);
    parsedStr = parsedStr.replace(/"/gi, "");
  } catch (e) {
    return str;
  }
  return parsedStr;
}

module.exports = (validationsDir) => async (req, res, next) => {
  try {
    const _method = req.method;
    const _url = req.originalUrl;
    const absPath = path.join(process.cwd(), validationsDir);
    const validationPath = require(absPath);
    if (typeof validationPath[_method] === "object") {
      if (typeof validationPath[_method][_url] === "object") {
        const schema = validationPath[_method][_url];
        const data = req.body;
        const { value, error, asyncErrors } = await customValidate(schema, data);
        if (asyncErrors.length > 0) {
          return res.status(422).send({ errors: asyncErrors, success: false });
        } else if (error !== undefined) {
          const validations = [];
          error.details.forEach(({ path, message, context }) => {
            const { name, regex, value, label, key } = context;
            [path] = path;
            validations.push({
              key: path,
              message: unescapeSlashes(message),
            });
          });
          const payload = { errors: validations, success: false };

          return res.status(422).json(payload);
        } else {
          return next();
        }
      } else {
        return next();
      }
    } else {
      return next();
    }
  } catch (err) {
    return next(ApiError.intervalServerError(err.message));
  }
};
