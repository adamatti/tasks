const app = require("../web").app,
      _ = require("lodash"),
      logger = require("../log")("rest.v1"),
      persistence = require("../persistence"),
      Promise = require("bluebird"),
      loadDependencies = require("./_loadDependencies")
      express = require("express")
;
let models;

async function processRow(row, modelToLoadDependencies,dependencies){
    const newRow = await loadDependenciesIntoRow(row,modelToLoadDependencies,dependencies);
   
    if (modelToLoadDependencies.toString.length > 0){
        newRow.toString = modelToLoadDependencies.toString(newRow,dependencies);
    }    
    return newRow;
}

function loadDependenciesIntoRow(row, modelToLoadDependencies, dependencies){
    const modelsToLoad = _.reduce(modelToLoadDependencies.fields, (obj,it,key) => { 
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

async function register(models_){
    models = models_;
    _.each (models, model => {
        app.get("/rest/v1", (req, res) => {
		    res.render("rest/v1/index",{
			    "_" : _,
			    models: _.sortBy(models, model => {return model.name} )
		    })
	    });
        
        app.get("/rest/v1/" + model.endpoint, (req,res)=>{
            const scope = {};
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
        
        app.get("/rest/v1/" + model.endpoint + "/:id", async (req,res)=>{
            const id = req.params.id
            logger.trace(`/rest/v1/${model.endpoint}/${id} called`)
            const dependencies = await loadDependencies(model, models)
            let row = await persistence.findById(model.endpoint,id)
            row = await processRow(row,model,dependencies);    
            res.status(row ? 200 : 404).json(row).end(); 
        });

        logger.trace(`Loaded endpoints [model: ${model.endpoint}]`);
    });
}

module.exports = { register }