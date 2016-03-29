'use strict';

const app = require("../web").app,
      _ = require("lodash"),
      logger = require("log4js").getLogger("rest"),
      persistence = require("../persistence"),
      Promise = require("bluebird"),
      loadDependencies = require("./_loadDependencies")
;
var models;

function processRow(row, modelToLoadDependencies,dependencies){
    return loadDependenciesIntoRow(row,modelToLoadDependencies,dependencies)
    .then(row => {
        if (
            modelToLoadDependencies.toString.arguments
        ){
            row.toString = modelToLoadDependencies.toString(row,dependencies);
        }    
        return row;
    });
}

function loadDependenciesIntoRow(row, modelToLoadDependencies, dependencies){
    var modelsToLoad = _.reduce(modelToLoadDependencies.fields, (obj,it,key) => { 
        const ref = _.get(it,"meta.ref");
        if (ref){
            obj[key] = _.find(models, it => { return it.name == ref });
        }
        return obj;
    }, {});
    
    return Promise.all(_.map(modelsToLoad, (model, key) =>{
        //FIXME get dependencies from 'dependencies' map
        if (row[key]){
            return persistence.findById(model.endpoint, row[key])
            .then(rowLoaded => {
                rowLoaded.toString = model.toString(rowLoaded,dependencies);
                //row[key + "-value"] = rowLoaded;
                row[key + "-value"] = rowLoaded.toString;
                return row;
            });            
        } else {
            return row;
        }
    })).then( () =>{
        return row;
    });
}

function register(models_){
    models = models_;
    _.each (models, model => {
        app.get("/rest/v1", (req, res) => {
		    res.render("rest/v1/index",{
			    "_" : _,
			    models: _.sortBy(models, model => {return model.name} )
		    })
	    });
        
        app.get("/rest/v1/" + model.endpoint, (req,res)=>{
            var scope = {};
            return loadDependencies(model, models)
			.then (dependencies => {
                scope.dependencies = dependencies; 
                return persistence.list(model.endpoint)
            }).then(result => { //filter
                return _.filter(result,req.query);  
            }).then(result => { 
                return Promise.all( 
                    _.map(result,it => {
                        return processRow(it,model,scope.dependencies)
                    })
                );
            }).then(result => {
                res.send(result); 
            }).catch ( error => {
                logger.error("Error: ",error);
                res.status(500).send({errors: [{title: 'Internal error'}]})
            });
        });
        
        app.get("/rest/v1/" + model.endpoint + "/:id", (req,res)=>{
            var scope = {};
            return loadDependencies(model, models)
			.then (dependencies => {
                scope.dependencies = dependencies; 
                return persistence.findById(model.endpoint,req.params.id)
            }).then(row => {
                return processRow(row,model,scope.dependencies);    
            }).then(row => {
                res.send([row]); 
            }).catch ( error => {
                logger.error("Error: ",error);
                res.status(500).send({errors: [{title: 'Internal error'}]})
            });
        });
    });
}

module.exports = { register }