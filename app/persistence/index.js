'use strict';
const config = require("../config"),
      file = require("./filePersistence"),
      mongo = require("./mongoPersistence")
;

//module.exports = config.mongo.url ? mongo : file;
module.exports = file;
    