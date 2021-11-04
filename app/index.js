const
  models = require('./models');
const http = require('http');
const logger = require('./log')('index');
const app = require('./web').app;
const config = require('./config');

const server = http.createServer(app);

const startPromise = new Promise(async function(resolve, reject) {
  await require('./persistence').startPromise;
  await require('./web/processors/CrudProcessor').register(models);
  await require('./web/processors/RestProcessorV1').register(models);
  await require('./web/processors/RestProcessorV2').register(models);

  server.listen(config.port, (error) =>{
    logger.info(`App started [port: ${config.port}]`);
    resolve(error);
  });
});

module.exports = {
  startPromise,
  server,
};
