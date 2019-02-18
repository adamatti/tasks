const _ = require("lodash"),
      persistence = require("../persistence"),
      Promise = require("bluebird"),
      logger = require("../log")("loadDependencies")
;      
      
function loadDependencies(modelToLoadDependencies,models){
	logger.trace("init");
	let modelsToLoad = _.filter(modelToLoadDependencies.fields, it => { return _.get(it,"meta.ref")});
	modelsToLoad = _.map(modelsToLoad, it => {
		return _.find(models, i=> { 
			return i.name == it.meta.ref 
		});
	});
	return Promise.all(_.map(modelsToLoad, it => {
		logger.trace("loading %s", it.endpoint);
		return persistence.list(it.endpoint)
		.then(list => {
			return { name: it.name, endpoint: it.endpoint, list : list };
		});
	}))
	.then (list => {
		return _.reduce(list, (obj, it) =>{
			logger.trace("reduce [name: %s]",it.name);
			obj[it.endpoint] = it.list;
			return obj;
		}, {});
	});
}

module.exports = loadDependencies;