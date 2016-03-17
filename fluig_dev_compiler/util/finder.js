var util = require('./utils');
var path = require('path');
var PropertiesReader = require('properties-reader');


var exports = module.exports;

exports.findWidgets = function findWidgets (widgetName,cb){
	var pathFluig = util.getFluigPath();
	var finder = require('findit')(pathFluig);
	var widgets = [];

	finder.on('directory', function (dir, stat, stop) {
	    var base = path.basename(dir);
	    if (util.ignoreDirectory(base)){
	    	//nesse caso o diretorio não vai descer
	    	stop()	
	    } 
	});

	finder.on('file', function (file, stat) {
		//o application.info é usado para identificar que é uma "widget"
		if(file.indexOf(widgetName) > -1 && file.indexOf("application.info") > -1){
	    	var properties = PropertiesReader(file);
	    	widgets.push({
	    		name: properties.get('application.code'),
	    		path: file
	    	});
	    } 
	});

	finder.on('end', function () {
		cb(widgets);
	});

}

exports.findWarFile = function findWarFile (pathProject,warName,cb){
	var finder = require('findit')(pathProject);
	var widgets = [];
	finder.on('directory', function (dir, stat, stop) {
	    
	});
	var warPath;
	finder.on('file', function (file, stat) {
		
		if(file.indexOf(warName) > -1 && file.indexOf("war") > -1){
	    	warPath = file;
	    } 
	});

	finder.on('end', function () {
		cb(warPath);
	});

}


