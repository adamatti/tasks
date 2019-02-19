const 
    models = require("./models"),
    http = require("http"),
    logger = require("./log")("index"),
    app = require("./web").app,
    config = require("./config")
;

if (process.env.NEW_RELIC_LICENSE_KEY){
    require("newrelic");
}

const server = http.createServer(app)

const startPromise = new Promise(async function(resolve, reject){
    await require("./persistence").startPromise
    await require("./processors/CrudProcessor").register(models);
    await require("./processors/RestProcessorV1").register(models);
    await require("./processors/RestProcessorV2").register(models);

	server.listen(config.port, error =>{
		logger.info(`App started [port: ${config.port}]`);
		resolve(error)
	});
})

module.exports = {
    startPromise,
    server
}