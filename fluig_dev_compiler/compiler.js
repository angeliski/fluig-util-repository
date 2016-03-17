#!/usr/bin/env node
'use strict';
var util = require('./util/utils');
var finder = require('./util/finder.js');

function init() {
    util.createConfiguration(function() {
        var widgetName = process.argv[2] || '';
        var inputParameters = require('minimist')(process.argv.slice(2));

        if(inputParameters.last){
            util.compileAndPublishLastWidget();    
        }else{
            console.info("Procurando por widgets que contém '" + widgetName + "' no nome.");
            console.info();
            finder.findWidgets(widgetName, function(widgets) {
                var targetWidget;
                //se só tiver achado uma widget não precisa perguntar nada
                if (widgets.length == 1) {
                    targetWidget = widgets[0];
                } else if (widgets.length > 1){
                    targetWidget = util.questionTargetWidget(widgets);
                }
                if(widgets.length > 0){
                    util.compileAndPublishWidget(targetWidget);    
                }else {
                    console.info("Desculpe, não foi possível localizar a widget com o nome informado :/");
                }
                
            });   
        }
    });
}

init();