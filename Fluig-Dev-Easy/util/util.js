'use strict';


var fs = require('fs');
var writer = require('./writer.js');
var exports = module.exports;



exports.createWidget = function createWidget(widgetConf) {
	exports.validateWidgetObject(widgetConf);
}



exports.validateWidgetObject = function validateWidgetObject(widgetConf){
	if(!widgetConf.name || widgetConf.name.length == 0){
		throw "O parametro name deve ser informado";
	}

	if(!widgetConf.code || widgetConf.code.length == 0){
		throw "O parametro code deve ser informado";
	}

	if(!widgetConf.path || widgetConf.path.length == 0){
		throw "O parametro path deve ser informado";
	}
}