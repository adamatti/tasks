'use strict';

const pmongo = require('promised-mongo'),
      Promise = require('bluebird').Promise,
      _ = require('lodash'),
      //uuid = require('node-uuid'),
      logger = require('log4js').getLogger("mongo"),
      config = require('../config')
;
var db = pmongo(config.mongo.url);

function fromDB(row){
    
}

function toDB(row){
    
}

module.exports = {
    list : function (tableName){
        var collection = collection(tableName);
        return collection.find().toArray()
        .then(rows => {
            return _.map(rows, row =>{
                return fromDB(row);
            })    
        });
    },
    save : function (tableName,row){
        var collection = collection(tableName);
        row = toDB(row);
        return collection.save(row)
        .then (row => {
            return fromDB(row);
        })
    },
    findById: function (tableName,id){
    },
    remove: function (tableName, id){
    }
}