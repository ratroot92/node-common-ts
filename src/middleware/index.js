import { malikLogger, MalikLogger } from "../logger";

class CommonMiddleware extends MalikLogger {
  #req;
  #res;
  #next;
  constructor(req, res, next) {
    super();
    this.#req = req;
    this.#res = res;
    this.#next = next;
  }

  static logRequestBody(req, res, next) {
    if (Object.keys(req).length > 0) {
      Object.keys(req).forEach((key, index) => {
        if (typeof req[key] === "string")
          console.log(`key [${key}] has value [${req[key]}] `);
        else if (typeof req[key] === "object") {
          this.logObjectKeys(req[key]);
        } else if (typeof req[key] === "array") {
        }
      });
    }
  }
}

commonMiddleware = new CommonMiddleware();

export { commonMiddleware, CommonMiddleware };
