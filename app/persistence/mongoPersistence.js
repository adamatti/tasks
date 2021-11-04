const logger = require('../log')('mongo');
const config = require('../config');
const shared = require('./_shared');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();
const {MongoClient} = require('mongodb');
const client = new MongoClient(config.mongo.url, {useUnifiedTopology: true});

let db;

const connect = async () => {
  if (!db) {
    await client.connect();
    db = client.db(config.mongo.dbName);
    logger.info('Database is up');
    eventEmitter.emit('ready');
  }
};

function fromDB(row) {
  logger.trace('fromDB', row);
  if (row) {
    row.id = row._id;
    delete row['_id'];
  }
  return row;
}

function toDB(row) {
  logger.trace('toDB', row);
  if (row) {
    row._id = row.id;
    delete row['id'];
  }
  return row;
}

const list = async (tableName) => {
  await connect();
  logger.trace('list [tableName: %s]', tableName);
  const collection = db.collection(tableName);
  const rows = await collection.find().toArray();

  return rows.map(fromDB);
};

const save = async (tableName, row) => {
  await connect();
  logger.trace('save [tableName: %s]', tableName);
  const collection = db.collection(tableName);
  row = toDB(shared.preSave(row));
  await collection.updateOne({_id: row._id}, {$set: row}, {upsert: true});
  return fromDB(row);
};

const findById = async (tableName, id) => {
  await connect();
  logger.trace('findById [tableName: %s]', tableName);
  const collection = db.collection(tableName);
  const row = await collection.findOne({_id: id});
  return fromDB(row);
};

const deleteRow = async (tableName, id) => {
  await connect();
  logger.trace('remove [tableName: %s]', tableName);
  const collection = db.collection(tableName);
  const row = await collection.deleteOne({_id: id});
  return fromDB(row);
};

module.exports = {
  on: async (eventName, callback) => {
    eventEmitter.on(eventName, callback);
  },
  list,
  save,
  findById,
  remove: deleteRow,
  delete: deleteRow,
};
