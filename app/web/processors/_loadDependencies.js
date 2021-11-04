const _ = require('lodash');
const persistence = require('../../persistence');
const Promise = require('bluebird');
const logger = require('../../log')('loadDependencies');

async function loadDependencies(modelToLoadDependencies, models) {
  logger.trace('init');
  let modelsToLoad = _.filter(modelToLoadDependencies.fields, (it) => {
    return _.get(it, 'meta.ref');
  });
  modelsToLoad = modelsToLoad.map((it) => {
    return models.find((i) => {
      return i.name == it.meta.ref;
    });
  });
  return Promise.all(modelsToLoad.map((it) => {
    logger.trace('loading %s', it.endpoint);
    return persistence.list(it.endpoint)
        .then((list) => {
          return {name: it.name, endpoint: it.endpoint, list: list};
        });
  }))
      .then((list) => {
        return _.reduce(list, (obj, it) =>{
          logger.trace('reduce [name: %s]', it.name);
          obj[it.endpoint] = it.list;
          return obj;
        }, {});
      });
}

module.exports = loadDependencies;
