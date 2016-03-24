'use strict';

const app = require("../web").app,
      _ = require("lodash"),
      logger = require("log4js").getLogger("rest"),
      persistence = require("../persistence")
;
var models;

function getAttributes(row,model){
    return _.pickBy(row, (value, key) => {
        const hasRef = _.get(model,"fields." + key + ".meta.ref");
        return !hasRef && (key!='id');
    });
}

function getRelationships(row,model){
    var relationships = _.pickBy(row, (value, key) => {
        const hasRef = _.get(model,"fields." + key + ".meta.ref");
        return hasRef;
    });
    
    return _.reduce(relationships, (obj,value, key) => {
        const ref = _.get(model,"fields." + key + ".meta.ref");
        var refModel = _.find(models,it => { return it.name == ref});        
        obj[key] = {
            type: _.get(refModel,'endpoint'), 
            value: value
        }
        return obj;
    },{}); 
}

function parseRow2jsonapi(row,model){
    return {
        type: model.endpoint,
        id  : row.id,
        attributes : getAttributes(row,model),
        relationships : getRelationships(row,model)
    }
}

function register(models_){
    models = models_;
    _.each (models, model => {
        
        app.get("/rest/" + model.endpoint, (req,res)=>{
            return persistence.list(model.endpoint)
            .then(result => { //filter
                return _.filter(result,req.query);  
            }).then(result => { //Parse row to jsonAPI standard
                return _.map(result, row => { return parseRow2jsonapi(row,model) });
            }).then(result => {
                res.send({data: result}); 
            });
        });
        
        app.get("/rest/" + model.endpoint + "/:id", (req,res)=>{
            return persistence.findById(model.endpoint,req.params.id)
            .then(row => { //Parse row to jsonAPI standard
                if (row){
                    res.send({
                        data: [
                            parseRow2jsonapi(row,model)
                        ]
                    }); 
                } else {
                    res.status(404).send({errors: [{title: 'Not found'}]})
                }
            })
        });
        
        logger.trace("Loaded endpoints [model: %s]",model.endpoint);
    });
}

module.exports = { register }