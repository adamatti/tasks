const _ = require("lodash"),
	  logFactory = require("../log"),
	  logger = logFactory("persistence"),
	  Promise = require("bluebird"),
	  fs = Promise.promisifyAll(require("fs")),
      config = require("../config"),
      shared = require("./_shared"),
      events = require("events"),
      eventEmitter = new events()
;
let tables = {}

function initTable(tableName){
	return new Promise(function (resolve, reject) {
		if (!_.get(tables,tableName)){
			tables[tableName] = {}
			logger.trace(`Table ${tableName} created`);
		}
		resolve();
	})
}

function doBackup(tables){
	const json = JSON.stringify(tables,null,4);
	return fs.writeFileAsync(config.fileStore,json,"utf-8")
	.then( () => {
		logger.debug(`database saved [file: ${config.fileStore}]`);
	});
}

function restoreDB(){
    return fs.exists(config.fileStore, exists =>{
        if (exists){
            return fs.readFileAsync(config.fileStore,"utf-8")
            .then ( content => {
                tables = JSON.parse(content);
                logger.debug(`database restored [file: ${config.fileStore}]`);
                eventEmitter.emit("ready");
            })
            .catch (error => {
                logger.warn(`Error restoring database. Maybe it is missing? ${error}`);  
            });
        } else {
            logger.info(`No db file to restore [file: ${config.fileStore}]`);
        }
    })     
}

//Main methods
//TODO emit an event when db is ready (if something depends on it)
//TODO check if file exist
restoreDB();

module.exports = {
    on : function(eventName,callback){
        eventEmitter.on(eventName,callback);
    },
	list : function (tableName){		
		return initTable(tableName)
		.then( () => {
			logger.trace(`list [table: ${tableName}]`);
			return tables[tableName];
		})
        .catch(error => {
            logger.error (`error on list ${error}`);
        })
	},

	save : function (tableName,row){
		return initTable(tableName)
		.then( () => {
			const table = tables[tableName];			   
            
            const insert = !_.get(row,"id");
            row = shared.preSave(row);
            if (insert){
                logger.trace(`New id [table: ${tableName}, id: ${row.id}]`);
            } else {
                row = _.merge(tables[tableName][row.id],row);
            }                            
            
			table[row.id] = row;
			//logger.trace("new table: %s", JSON.stringify(table));
			return row;
		}).then( row => {
			return doBackup(tables);
		}).then( () => {
			return row;
		});
	},

	findById: function (tableName,id){
		return initTable(tableName)
		.then( () => {
			return tables[tableName][id];
		});
	},

	remove: function (tableName, id){
		return initTable(tableName)
		.then( () => {
			delete tables[tableName][id];
		});
	}
}