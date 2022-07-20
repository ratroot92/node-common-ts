class ApiError {
  constructor(options = {}) {
    this.status = options.status;
    this.name = options.name;
    this.message = options.message ?? {};
    this.data = options.data ?? {};
    this.accessToken = options.accessToken ?? null;
  }

  static badRequest(message) {
    return new ApiError({ status: 400, message });
  }

  static intervalServerError(message) {
    return new ApiError({ status: 500, message });
  }
  static unAuthorized(message) {
    return new ApiError({ status: 401, message });
  }

  static notFoundError(message) {
    console.log("message", message);
    message = message ? message : "notFound";
    return new ApiError({ status: 404, message });
  }
}

module.exports = ApiError;
