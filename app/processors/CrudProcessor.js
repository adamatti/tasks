const _ = require("lodash"),
	  persistence = require("../persistence"),
	  app = require("../web").app,
	  logger = require("../log")("crud"),
	  render = require('../render'),
      loadDependencies = require("./_loadDependencies"),
      querystring = require("querystring")
;

function errorHandler(error){
    logger.error("Error: ",error);
}

async function register(models){
	render.setModels(models);

	app.get("/crud", (req, res) => {
		res.render("crud/index",{
			"_" : _,
			models: _.sortBy(models, model => {return model.name} )
		})
	});

	_.each (models, model => {
		//List entities
		app.get("/crud/" + model.endpoint, (req,res)=>{
			const scope = {};
			return loadDependencies(model, models)
			.then (dependencies => {
				//logger.trace("dependencies",dependencies);
				scope.dependencies = dependencies;
				return persistence.list(model.endpoint);	
			}).then ( rows => {
                return _.filter(rows,req.query); 
            }).then ( rows => {
                req.session["list query"]=req.query;
                
				res.render('crud/list',{
					"_" : _,
					renderView: render.renderView(scope.dependencies),
	
					baseUrl : "/crud/" + model.endpoint,
					"fields" : model.fields,
					"rows"   : rows
				})
			}).catch(errorHandler);
		})

		//new entity
		app.get("/crud/" + model.endpoint + "/new", (req,res)=>{
			return loadDependencies(model, models)
			.then (dependencies => {
				res.render('crud/edit',{
					"_" : _,
					renderEdit: render.renderEdit(model,dependencies),

					baseUrl : "/crud/" + model.endpoint,
					"fields" : model.fields,
					row: {}
				})	
			});
		})

		//edit entity
		app.get("/crud/" + model.endpoint + "/:id", (req,res)=>{
			const scope = {};
			return loadDependencies(model, models)
			.then (dependencies => {
				scope.dependencies = dependencies;
				return persistence.findById(model.endpoint, req.params.id)
			})
			.then ( row => {
				res.render('crud/edit',{
					"_" : _,
					renderEdit: render.renderEdit(model,scope.dependencies),
					baseUrl : "/crud/" + model.endpoint,
					"fields" : model.fields,
					row: row
				})
			}).catch(errorHandler);	
		})

		//delete entity
		app.get("/crud/" + model.endpoint + "/:id/delete", (req,res)=>{
			return persistence.remove(model.endpoint, req.params.id)
			.then ( () => {
				res.redirect("/crud/" + model.endpoint);
			}).catch(errorHandler);	
		})

		//save and forward to list
		app.post("/crud/" + model.endpoint, (req,res)=>{
			return persistence.save(model.endpoint,req.body.row)
			.then ( () => {
                let query = req.session["list query"];
                if (query){                    
                    query = querystring.stringify(query);
                    logger.trace("Using cached query [query:%s]",query);
                    res.redirect("/crud/" + model.endpoint + "?" + query);    
                } else {
				    res.redirect("/crud/" + model.endpoint);
                }     
			}).catch(errorHandler);
		})	

		logger.trace(`Loaded endpoints [model: ${model.endpoint}]`);	
	});
}

module.exports = { register }
