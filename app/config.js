"use strict";

var config = {}

config.admin = {
    user : process.env.ADMIN_USER || 'admin',
    pass : process.env.ADMIN_PASS || 'admin'
}
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

config.mongo = {
    url: process.env.MONGOLAB_URI || 'mongodb://docker.me:27017/tasks'
}

module.exports = config; 