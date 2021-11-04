const Type = require('./lib').Type;
const moment = require('moment');
const _ = require('lodash')
;

function getTaskTree(task, dependencies) {
  if (!task) {
    return 'undefined';
  } if (!task.parent) {
    return task.name;
  } else {
    const parentRow = _.find(dependencies.tasks, (it) => {
      return it.id == task.parent;
    });
    return getTaskTree(parentRow, dependencies) + '/' + task.name;
  }
}

const now = moment().format('MM/DD/YYYY');
/* eslint-disable new-cap */
const models = [
  {
    name: 'person',
    endpoint: 'persons',
    fields: {
      age: Type().number().required(),
      name: Type().string(),
      date: Type().date(),
    },
  },
  {
    name: 'task',
    endpoint: 'tasks',
    fields: {
      name: Type().string().required(),
      parent: Type().ref('task'),
    },
    toString: function(row, dependencies) {
      if (!dependencies) {
			    return row.name;
      } else {
        return getTaskTree(row, dependencies);
      }
    },
  },
  {
    name: 'taskType',
    endpoint: 'taskTypes',
    fields: {
      name: Type().string().required(),
      description: Type().string(),
    },
    toString: function(row) {
      return row.name;
    },
  },
  {
    name: 'timeEntry',
    endpoint: 'timeEntries',
    fields: {
      dt: Type().date().required().defaultValue(now),
      task: Type().ref('task'),
      type: Type().ref('taskType'),
      hrs: Type().number().required(),
      description: Type().string(),
      extraWork: Type().boolean().defaultValue('false'),
    },
  },
];
/* eslint-enable new-cap */

module.exports = models;
