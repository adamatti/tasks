"use strict";

var config = {}
config.port = process.env.PORT || 3000;
config.fileStore = process.env.HOME + "/taskTrackerDatabase.json";
config.expressSessionSecret=process.env.EXPRESS_SESSION_SECRET || 'ssshhhhh';

config.log4js = {
    levels:{'[all]': process.env.LOG_LEVEL || 'DEBUG'},
    replaceConsole:true,
    appenders: [
        { "type": "console" }
    ]
}

module.exports = config; 