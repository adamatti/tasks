const _ = require("lodash"),
      uuid = require("uuid-v4"),
      config = require("../config")
;

function preSave(row){
    if (!_.get(row,"id")){ //insert
        row.id = uuid();
        if (!row.createdOn){
            row.createdOn = new Date()
        }        
    }
    
    if (config.persistence.generateUpdateDate){
        row.updatedOn = new Date();
    }
    return row;
}

module.exports = {
    preSave
}