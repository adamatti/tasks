'use strict';

const _ = require("lodash"),
	  persistence = require("../persistence"),
	  app = require("../web").app,
	  logger = require("log4js").getLogger("crud"),
	  config = require('../config'),
	  render = require('../render'),
	  Promise = require("bluebird"),
      loadDependencies = require("./_loadDependencies")
;

function register(models){
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
			var scope = {};
			return loadDependencies(model, models)
			.then (dependencies => {
				//logger.trace("dependencies",dependencies);
				scope.dependencies = dependencies;
				return persistence.list(model.endpoint);	
			}).then ( rows => {
                return _.filter(rows,req.query); 
            }).then ( rows => {
				res.render('crud/list',{
					"_" : _,
					renderView: render.renderView(scope.dependencies),
	
					baseUrl : "/crud/" + model.endpoint,
					"fields" : model.fields,
					"rows"   : rows
				})
			})
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
			var scope = {};
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
			})	
		})

		//delete entity
		app.get("/crud/" + model.endpoint + "/:id/delete", (req,res)=>{
			return persistence.remove(model.endpoint, req.params.id)
			.then ( () => {
				res.redirect("/crud/" + model.endpoint);
			})	
		})

		//save and forward to list
		app.post("/crud/" + model.endpoint, (req,res)=>{
			return persistence.save(model.endpoint,req.body.row)
			.then ( () => {
				res.redirect("/crud/" + model.endpoint);
			})
		})	

		logger.trace("Loaded endpoints [model: %s]",model.endpoint);	
	});
}

module.exports = { register }
