const models = require("./models");

if (process.env.NEW_RELIC_LICENSE_KEY){
    require("newrelic");
}

require("./processors/CrudProcessor").register(models);
require("./processors/RestProcessorV1").register(models);
require("./processors/RestProcessorV2").register(models);
