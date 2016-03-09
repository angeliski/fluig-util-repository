var util = require('./util/utils');
var finder = require('./util/finder.js');

function init() {
    util.createConfiguration(function() {
        console.info("Compilando Relatório..");
        console.info();
        finder.findWidgets(function(widgets) {
            util.generateCSVFile(widgets);
        });   
    });
}

init();