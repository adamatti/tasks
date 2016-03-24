"use strict";

var config = {}
config.port = process.env.PORT || 3000;
//config.fileStore = "c:/temp/database.json";
config.fileStore = process.env.HOME + "/taskTrackerDatabase.json";

module.exports = config; 