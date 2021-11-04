const _ = require('lodash');
	  const logFactory = require('../log');
	  const logger = logFactory('persistence');
	  const Promise = require('bluebird');
	  const fs = Promise.promisifyAll(require('fs'));
const config = require('../config');
const shared = require('./_shared')
;
let tables = {};

function initTable(tableName) {
  return new Promise(function(resolve, reject) {
    if (!_.get(tables, tableName)) {
      tables[tableName] = {};
      logger.trace(`Table ${tableName} created`);
    }
    resolve();
  });
}

async function doBackup(tables) {
  const json = JSON.stringify(tables, null, 4);
  await fs.writeFileAsync(config.fileStore, json, 'utf-8');
  logger.debug(`database saved [file: ${config.fileStore}]`);
}

function restoreDB() {
  return new Promise(function(resolve, reject) {
    fs.exists(config.fileStore, async (exists) =>{
      if (exists) {
        const content = await fs.readFileAsync(config.fileStore, 'utf-8');
        tables = JSON.parse(content);
        logger.debug(`database restored [file: ${config.fileStore}]`);
      } else {
        logger.info(`No db file to restore [file: ${config.fileStore}]`);
      }
      resolve();
    });
  });
}

// Main methods
// TODO emit an event when db is ready (if something depends on it)
// TODO check if file exist
const startPromise = restoreDB();

module.exports = {
  startPromise,
  list: async function(tableName) {
    await initTable(tableName);
    logger.trace(`list [table: ${tableName}]`);
    return tables[tableName];
  },

  save: async (tableName, row) => {
    await initTable(tableName);
    const table = tables[tableName];

    const insert = !_.get(row, 'id');
    row = shared.preSave(row);
    if (insert) {
      logger.trace(`New id [table: ${tableName}, id: ${row.id}]`);
    } else {
      row = _.merge(tables[tableName][row.id], row);
    }

    table[row.id] = row;
    // logger.trace("new table: %s", JSON.stringify(table));
    await doBackup(tables);
    return row;
  },

  findById: async (tableName, id) => {
    await initTable(tableName);
    return tables[tableName][id];
  },

  remove: async (tableName, id) => {
    await initTable(tableName);
    delete tables[tableName][id];
  },
};
