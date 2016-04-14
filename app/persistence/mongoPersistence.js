'use strict';

const Promise = require('bluebird').Promise,
      _ = require('lodash'),
      logger = require('log4js').getLogger("mongo"),
      config = require('../config'),
      shared = require("./_shared"),
      events = require("events"),
      eventEmitter = new events(),
      mongodb = require('mongodb'),
      mongoClient = mongodb.MongoClient,
	  collection = mongodb.Collection
;

////////////////////////////////////////////////////////// Magic stuffs to make promises work
//http://stackoverflow.com/questions/23771853/how-can-i-promisify-the-mongodb-native-javascript-driver-using-bluebird
Promise.promisifyAll(collection.prototype);
Promise.promisifyAll(mongoClient);
collection.prototype._find = collection.prototype.find;
collection.prototype.find = function() {
    var cursor = this._find.apply(this, arguments);
    cursor.toArrayAsync = Promise.promisify(cursor.toArray, cursor);
    cursor.countAsync = Promise.promisify(cursor.count, cursor);
    return cursor;
}
////////////////////////////////////////////////////////// 
var db;

mongoClient.connectAsync(config.mongo.url).then (result => {
    db = result;
    logger.info("Database is up");
    eventEmitter.emit("ready");
}).catch(err => {
    logger.error("Database is not ok", err);
    process.exit(1)
})

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
        return collection.find().toArrayAsync()
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
        return collection.updateAsync({_id:row._id},row,{upsert:true})
        .then ( result => {
            return fromDB(row);
        })
        .catch(errorHandler);
    },
    findById: function (tableName,id){
        logger.trace("findById [tableName: %s]",tableName);
        var collection = db.collection(tableName);
        return collection.findOneAsync({_id:id})
        .then(row => {
            return fromDB(row);
        })
        .catch(errorHandler);
    },
    remove: function (tableName, id){
        logger.trace("remove [tableName: %s]",tableName);
        var collection = db.collection(tableName);
        return collection.removeAsync({_id: id})
        .then(row => {
            return fromDB(row);
        })
        .catch(errorHandler);
    }
}