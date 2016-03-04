'use strict';

var CONFIGURATION_PATH = "/config-compiler";
var CONFIGURATION_FILE = "config.json";


var fs = require('fs');
var nconf = require('nconf');
var readlineSync = require('readline-sync');
var exports = module.exports;
var spawn = require('child_process').spawn;
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var finder = require('./finder.js');


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
    if (!nconf.get("server.path")) {
        var server = readlineSync.question("Qual o caminho da pasta apps do servidor fluig? Ex '/opt/fluig/jboss/apps' :");
         nconf.set("server.path", server);
         nconf.save();
    }
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

exports.ignoreDirectory = function ignoreDirectory(base) {
    //TODO improve
    return base === '.git' || base === 'node_modules' || base === 'target' || base === 'fluig-style-guide' || base === 'plugin' || base === '.settings';
}

exports.questionTargetWidget = function questionTargetWidget(widgets) {
    console.log("As seguintes widgets foram localizadas:")
    for (var i = 0; i < widgets.length; i++) {
        console.log(i + 1 + " - " + widgets[i].name);
    }

    var position = readlineSync.question('Qual widget você deseja compilar? :');
    return widgets[position - 1];
}

exports.compileAndPublishLastWidget = function (){
    var widget = exports.getKey("last.widget");
    if(widget){
        console.log("Ultima widget compilada:"+widget.name);
        exports.compileAndPublishWidget(widget);
    }else{
        console.log("Não foi possível localizar a ultima widget compilada.");
    }
    
}

exports.compileAndPublishWidget = function compileAndPublishWidget(widget) {
    var path = widget.path.split("src/main/resources/application.info")[0];
    // Create a child process
    var child = spawn('mvn', ['clean', 'install','-DskipTests'], {
        cwd: path
    }).on('error', function(err) {
        throw err
    });

    child.stdout.on('data',
        function(data) {
            if(data && data.toString() != ''){
                console.log('' + data);    
            }
        }
    );

    child.stderr.on('data',
        function(data) {
            console.log('' + data);
        }
    );

    child.on('exit',
        function(data) {
           fs.readFile(path + '/pom.xml', function(err, data) {
            parser.parseString(data, function (err, result) {
                //caminho no xml para o arquivo
                var nameFile = result.project.artifactId[0];


                finder.findWarFile(path +'target',nameFile,function (war){
                    var copy = spawn('cp', [war, exports.getServerPath() +'/'+nameFile+".war"]).on('error', function(err) {
                        throw err
                    });

                 copy.stdout.on('data',
                    function(data) {
                        console.log('' + data);
                    }
                );

                copy.stderr.on('data',
                    function(data) {
                        console.log('' + data);
                    }
                );
                copy.on('exit',function(data) {
                    console.log("Widget copiada! Só aguardar o deploy ;)");
                    exports.setKey("last.widget",widget);
                });
                
                });
            });
        });
        }
    );
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