const config = require("../config");

module.exports = config.mongo.url ? 
    require("./mongoPersistence") : 
    require("./filePersistence")
;
    