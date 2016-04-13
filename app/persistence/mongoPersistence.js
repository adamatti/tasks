'use strict';

const pmongo = require('promised-mongo'),
      Promise = require('bluebird').Promise,
      _ = require('lodash'),
      logger = require('log4js').getLogger("mongo"),
      config = require('../config'),
      shared = require("./_shared"),
      events = require("events"),
      eventEmitter = new events()
;
var db = pmongo(config.mongo.url);
checkDatabase(db);

function checkDatabase(db){
    return db.runCommand({ping:1})
    .then(res => {
        if(res.ok) {
            logger.info("Database is up");
            eventEmitter.emit("ready");
        }
    }).catch(err => {
        logger.error("Database is not ok", err);
    });
}

function fromDB(row){
    logger.trace("fromDB",row);
    if (row){
        row.id = row._id;
        delete row["_id"];
    }
    return row;
}

function toDB(row){
    logger.trace("toDB",row);
    if (row){
        row._id = row.id;
        delete row["id"];
    }
    return row;
}

function errorHandler(error){
    logger.error("error: ",error);
}

module.exports = {
    on : function(eventName,callback){
        eventEmitter.on(eventName,callback);
    },
    list : function (tableName){
        logger.trace("list [tableName: %s]",tableName);
        var collection = db.collection(tableName);
        return collection.find().toArray()
        .then(rows => {
            return _.map(rows, row =>{
                return fromDB(row);
            })    
        })
        .catch(errorHandler);
    },
    save : function (tableName,row){
        logger.trace("save [tableName: %s]",tableName);
        var collection = db.collection(tableName);
        row = toDB(shared.preSave(row));
        return collection.save(row)
        .then (row => {
            return fromDB(row);
        })
        .catch(errorHandler);
    },
    findById: function (tableName,id){
        logger.trace("findById [tableName: %s]",tableName);
        var collection = db.collection(tableName);
        return collection.findOne({_id: id})
        .then(row => {
            return fromDB(row);
        })
        .catch(errorHandler);
    },
    remove: function (tableName, id){
        logger.trace("remove [tableName: %s]",tableName);
        var collection = db.collection(tableName);
        return collection.remove({_id: id})
        .then(row => {
            return fromDB(row);
        })
        .catch(errorHandler);
    }
}