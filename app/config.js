"use strict";

var config = {}

config.log4js = {
    levels:{'[all]': process.env.LOG_LEVEL || 'DEBUG'},
    replaceConsole:true,
    appenders: [
        { "type": "console" }
    ]
}

//Web config
config.admin = {
    user : process.env.ADMIN_USER || 'admin',
    pass : process.env.ADMIN_PASS || 'admin'
}
config.port = process.env.PORT || 3000;
config.expressSessionSecret=process.env.EXPRESS_SESSION_SECRET || 'ssshhhhh';

//Persistence config
config.persistence = {
    generateUpdateDate : (process.env.GENERATE_UPDATE_DATE || "true") == "true" 
}
config.fileStore = process.env.HOME + "/taskTrackerDatabase.json";
config.mongo = {
    url: process.env.MONGOLAB_URI
}

module.exports = config; 