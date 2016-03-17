'use strict';


var fs = require('fs');
var exports = module.exports;



exports.writeInFile = function writeInFile(filePath,text,callback) {
	fs.writeFile(filePath, text, callback);
}
