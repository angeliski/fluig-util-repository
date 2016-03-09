var util = require('./utils');
var path = require('path');
var fs = require('fs');
var PropertiesReader = require('properties-reader');


var exports = module.exports;

exports.findWidgets = function findWidgets (cb){
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
		if(file.indexOf("application.info") > -1){
	    	var properties = PropertiesReader(file);
	    	var widget = {
	    		title : properties.get('application.title'),
	    		code: properties.get('application.code'),
	    		category: properties.get('application.category'),
	    		type: properties.get('application.type'),
	    		uiwidget: properties.get('application.uiwidget') || false,
	    		extensible: properties.get('application.extensible') || false,
	    		view: properties.get('view.file'),
	    		layout: properties.get('layout.file'),
	    		edit: properties.get('edit.file'),
	    		theme: properties.get('theme.file'),
	    		applicationInfoPath: file
	    	};

	    	widgets.push(widget);

	    	var widgetViewFile = widget.view || widget.layout || widget.theme;

	    	var path = widget.applicationInfoPath.split("application.info")[0] +  widgetViewFile;
	    	
			fs.readFile(path, function (err, data) {
			  if (err) {
					widget.applicationInfoError = true;
					return;
				}
			  var text = data.toString('utf8');
			  if(text.indexOf('fluig-style-guide') > -1){
			    widget.styleGuideView = "Sim";
			  }
			});

	    } 
	});

	finder.on('end', function () {
		cb(widgets);
	});

}

