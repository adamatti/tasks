'use strict';

function Type(){
	var ctx = {
		meta:{}
	}
	ctx.string = function(){ctx.meta.type = "string";return ctx};
	ctx.number = function(){ctx.meta.type = "number";return ctx};
	ctx.date = function(){ctx.meta.type = "date";return ctx};
	ctx.boolean = function(){ctx.meta.type = "boolean";return ctx};

	ctx.required = function(){ctx.meta.required = true;return ctx};
	ctx.ref = function (name) {ctx.meta.ref = name; return ctx};
    ctx.defaultValue = function(value){ctx.meta.defaultValue = value; return ctx};

	return ctx;
}

module.exports = {
	Type: Type
}