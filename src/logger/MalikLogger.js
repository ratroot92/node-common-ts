class MalikLogger {
  constructor() {
    if (MalikLogger.instance instanceof MalikLogger) {
      return MalikLogger.instance;
    } else {
      //   this.settingsObject = {
      //     background: "#000",
      //     version: Math.floor(Math.random() * 4000),
      //   };
      //   Object.freeze(this.settingsObject);
      Object.freeze(this);
      MalikLogger.instance = this;
    }
  }

  //   get(key) {
  //     return this.settingsObject[key];
  //   }
  logObjectKeysAndValues(obj) {
    try {
      if (Object.keys(obj).length > 0) {
        Object.keys(obj).forEach((key, index) => {
          if (typeof obj[key] === "string") {
            console.log(`key [${key}] has value [${obj[key]}] `);
          } else if (typeof obj[key] === "object") {
            CommonMiddleware.logObjectKeys(obj.keys);
          }
        });
      }
    } catch (err) {
      console.log(err.message);
    }
  }
  logArray(arr) {
    try {
      if (typeof arr === "array") {
        console.table(arr);
      } else {
        throw new Error("invalid array.");
      }
    } catch (err) {
      throw new Error("invalid array.");
    }
  }
}
const malikLogger = new MalikLogger();

export { malikLogger, MalikLogger };
