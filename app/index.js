'use strict';

const log4js = require("log4js"),
      config = require('./config'),
      models = require("./models")
;

log4js.configure(config.log4js);

require("./processors/CrudProcessor").register(models);
require("./processors/RestProcessorV1").register(models);
require("./processors/RestProcessorV2").register(models);
