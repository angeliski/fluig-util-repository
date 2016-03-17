'use strict';

var CONFIGURATION_PATH = "/config-compiler";
var CONFIGURATION_FILE = "config.json";


var exports = module.exports;
var fs = require('fs');
var nconf = require('nconf');
var readlineSync = require('readline-sync');
var json2csv = require('json2csv');


var fields = [{
    label: 'Titulo da Widget',
    value: 'title',
    default: 'Não informado'
}, {
    label: 'Code da Widget',
    value: 'code',
    default: 'Não informado'
}, {
    label: 'Category da Widget',
    value: 'category',
    default: 'Não informado'
}, {
    label: 'Type da Widget',
    value: 'type',
    default: 'Não informado'
}, {
    label: 'É uiwidget?',
    value: function(row) {
        return row.uiwidget ? "Sim" : "Não";
    },
    default: 'Não'
}, {
    label: 'É extensible?',
    value: function(row) {
        return row.extensible ? "Sim" : "Não";
    },
    default: 'Não'
}, {
    label: 'view contém fluig-style-guide',
    value: 'styleGuideView',
    default: 'Não'
}, {
    label: 'Erro no application.info? (Inconsitência no nome da view.ftl)',
    value: function(row) {
        return row.applicationInfoError ? "Sim" : "Não";
    },
    default: 'Não'
}];


exports.createConfiguration = function createConfiguration(cb) {
    fs.stat(exports.getFileConfigurationPath(), function(err, stat) {
        if (err != null) {
            //isso serve apenas para criar o folder de configuração se necessário
            exports.loadConfigurationFolder();
        }

        exports.loadConfiguration();
        cb();
    });
}

//salva as configurações na home do usuario
exports.getFileConfigurationPath = function getFileConfigurationPath() {
    return exports.getFileConfigurationDir() + '/' + CONFIGURATION_FILE;
}

exports.getFileConfigurationDir = function getFileConfigurationPath() {
    return exports.getUserHome() + CONFIGURATION_PATH;
}

exports.loadConfiguration = function loadConfiguration() {
    nconf.argv().env().file(exports.getFileConfigurationPath());
    nconf.load();
    if (!nconf.get("fluig.path")) {
        var fluig = readlineSync.question("Qual o caminho raiz do projeto fluig? Ex '/workspace/fluig' :");
        nconf.set("fluig.path", fluig);
        nconf.save();
    }
}

exports.loadConfigurationFolder = function loadConfigurationFolder() {
    if (!fs.existsSync(exports.getFileConfigurationDir())) {
        fs.mkdirSync(exports.getFileConfigurationDir());
    }
}

exports.generateCSVFile = function generateCSVFile(widgets) {
    json2csv({
        data: widgets,
        fields: fields
    }, function(err, csv) {
        if (err) console.log(err);
        var nameReport = exports.getUserHome() +"/report " + new Date() + ".csv";
        fs.writeFile(nameReport, csv, "utf-8", function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("Relatório gerado com sucesso!");
        });
    });
}

exports.ignoreDirectory = function ignoreDirectory(base) {
    //TODO improve
    return base === '.git' || base === 'node_modules' || base === 'target' || base === 'fluig-style-guide' || base === 'plugin' || base === '.settings';
}

exports.getUserHome = function getUserHome() {
    return process.env.HOME || process.env.USERPROFILE;
}


exports.getServerPath = function getServerPath(widget) {
    return nconf.get("server.path");
}

exports.getFluigPath = function getFluigPath(widget) {
    return nconf.get("fluig.path");
}

exports.getKey = function getKey(key) {
    return nconf.get(key);
}

exports.setKey = function setKey(key, value) {
    nconf.set(key, value);
    nconf.save();
}