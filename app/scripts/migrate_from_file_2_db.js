'use strict';

const models = require("../models"),
      file = require("../persistence/filePersistence"),
      mongo = require("../persistence/mongoPersistence"),
      logger = require("log4js").getLogger("migrate"),
      Promise = require("bluebird"),
      _ = require("lodash")
;
var ready = {}
function doMigration (){
    if (ready.file && ready.mongo){
        return Promise.resolve({})
        .then( () =>{
            logger.info("Started");
            return Promise.all(_.map(models, model =>{
                return file.list(model.endpoint)
                .then(rows => {
                    return Promise.all(_.map(rows,row =>{
                        return mongo.save(model.endpoint,row);
                    }))
                })
            }))
        })
        .then( () => {
            logger.info("Migration complete");
            process.exit()
        })
        .catch(error => {
            logger.error("Error: ",error);
        })
    }
}

mongo.on("ready", () => {
    logger.trace("mongo ready");
    ready.mongo = true;
    doMigration();
});
file.on("ready", () => {
    logger.trace("file ready");
    ready.file = true;
    doMigration();
})

