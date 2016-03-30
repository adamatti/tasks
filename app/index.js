'use strict';

const Type = require('./lib').Type,
      moment = require('moment'),
      log4js = require("log4js"),
      config = require('./config')
;

//TODO Move this config
log4js.configure(config.log4js);

function getTaskTree(task,dependencies){
    if (!task.parent){
        return task.name;
    } else {
        var parentRow = dependencies.tasks[task.parent];
        return getTaskTree(parentRow,dependencies) + "/" +  task.name;
    }
}

var now = moment().format('MM/DD/YYYY'); 
var models = [
	{
		name    : "person",
		endpoint: "persons",
		fields  : {
			age : Type().number().required(),
			name: Type().string(),
			date: Type().date()		
		}
	},
	{
		name     : "task",
		endpoint : "tasks",
		fields   : {
			name   : Type().string().required(),
			parent : Type().ref("task") 
		},
		toString : function (row, dependencies){
            if (!dependencies){
			    return row.name;
            } else {
                return getTaskTree(row,dependencies);
            }
		}
	},
	{
		name    : "taskType",
		endpoint: "taskTypes",
		fields  :{
			name       : Type().string().required(),
            description: Type().string()
		},
		toString : function(row){
			return row.name;
		}
	},
	{
		name : "timeEntry",
		endpoint : "timeEntries",
		fields : {
			dt          : Type().date().required().defaultValue(now),
			task        : Type().ref("task"),
			type        : Type().ref("taskType"),
			hrs         : Type().number().required(),
			description : Type().string()
		}
	}
]

require("./processors/CrudProcessor").register(models);
require("./processors/RestProcessorV1").register(models);
require("./processors/RestProcessorV2").register(models);
