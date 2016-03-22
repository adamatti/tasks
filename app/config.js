"use strict";

var config = {}
config.port = process.env.PORT || 3000;
//config.fileStore = "c:/temp/database.json";
config.fileStore = "/tmp/database.json";

module.exports = config; 