#!/usr/bin/env node
(function(undefined) {
  'use strict';

  /********************************
   * Component modules
   ********************************/
  var mkpath       = require('mkpath');
  var fs           = require('fs');
  var readlineSync = require('readline-sync');
  var handlebars   = require('handlebars');
  var inquirer     = require("inquirer");
  var replace      = require("replace");
  var path         = require('path');
  var config       = require('./config');
  

  /********************************
   * Global constants
   ********************************/
  var FLUIG_HOME = process.env.FLUIG_HOME;


  /********************************
   * Global variables
   ********************************/
  var moduleName,
    widgetName,
    widgetCode,
    wordsWidgetName,
    widgetId,
    widgetInstance,
    viewTemplate,
    javascriptTemplate,
    applicationTemplate,
    jbossWebTemplate,
    webTemplate,
    pomTemplate
  ;


  /********************************
   * Private methods
   ********************************/
  function init() {

    // files templates
    var viewSource        = fs.readFileSync(path.join(__dirname,'templates/view.txt'), 'utf8');
    var javascriptSource  = fs.readFileSync(path.join(__dirname,'templates/javascript.txt'), 'utf8');
    var applicationSource = fs.readFileSync(path.join(__dirname,'templates/application.txt'), 'utf8');
    var jbossWebSource    = fs.readFileSync(path.join(__dirname,'templates/jboss-web.txt'), 'utf8');
    var webSource         = fs.readFileSync(path.join(__dirname,'templates/web.txt'), 'utf8');
    var pomSource         = fs.readFileSync(path.join(__dirname,'templates/pom.txt'), 'utf8');
    var options;
    
    // compile templates
    javascriptTemplate  = handlebars.compile(javascriptSource);
    viewTemplate        = handlebars.compile(viewSource);
    applicationTemplate = handlebars.compile(applicationSource);
    jbossWebTemplate    = handlebars.compile(jbossWebSource);
    webTemplate         = handlebars.compile(webSource);
    pomTemplate         = handlebars.compile(pomSource);

    if(!FLUIG_HOME) {
      console.log('Defina a variável de ambiente "FLUIG_HOME" com o home do seu projeto. Ex. "export FLUIG_HOME=/home/user_name/Projetos/fluig/".');
      return false;
    }

    getUserOptions(function(){
      // gerenate widget options (name, code, description, etc)
      options = generateWidgetOptions();
      generateWidget(options);
    });
  }

  function getUserOptions(cb){
    var choices = [];

    choices.push({
      name: "Social",
      value: "social",
      short: "social"
    });

    choices.push({
      name: "ECM/BPM",
      value: "ecm",
      short: "ecm"
    });

    choices.push({
      name: "WCM",
      value: "wcm",
      short: "wcm"
    });

    inquirer.prompt([{
        type: "list",
        name: "modulo",
        message: "Em qual módulo você deseja criar a widget?",
        choices: choices
    }, {
        type: "input",
        name: "widgetName",
        message: "Qual o nome da widget?",
        default: function(answers) {
          return "My Widget";
        }
    }, {
        type: "input",
        name: "widgetCode",
        message: "Digite o code da widget sem espaços ou caracteres especiais",
        default: function(answers) {
          return answers.widgetName.replace(/ /g, '').toLowerCase();
        }
    }], function(answers) {
        //TODO precisa melhorar isso
        moduleName = answers.modulo;
        widgetName = answers.widgetName;
        widgetCode = answers.widgetCode;
        cb();
    });
  }

  function generateWidgetOptions() {
    var options = {}, i;

    wordsWidgetName          = widgetName.replace(/ +(?= )/g,'').toLowerCase().split(' ');
    options.widgetId         = wordsWidgetName[0];
    options.widgetInstance   = '';
    options.widgetName       = widgetName;
    options.widgetCode       = widgetCode;
    options.pomWidgetName    = config.prefixes[moduleName].name + widgetName;
    options.artifactId       = config.prefixes[moduleName].artifactId + '-' + widgetCode;
    options.parentArtifactId = config.prefixes[moduleName].artifactId;
    options.pomWidgetsrc     = config.prefixes[moduleName].src;
    options.appCategory      = config.prefixes[moduleName].category;
    options.appProduct       = config.prefixes[moduleName].product;
    options.productVersion   = config.productVersion;

    // widget instance
    for(i = 0; i < wordsWidgetName.length; i++) {
      options.widgetInstance += capitalizeFirstLetter(wordsWidgetName[i]);
    }

    // widget id
    for(i = 1; i < wordsWidgetName.length; i++) {
      options.widgetId += capitalizeFirstLetter(wordsWidgetName[i]);
    }

    return options;
  }

  function generateWidget(options) {
    var structure,
      widgetSrc
    ;

    // generate parsed templetes
    var viewContent = viewTemplate({
      widgetInstance : options.widgetInstance,
      widgetId       : options.widgetId,
      widgetName     : options.widgetName
    });

    var javascriptContent = javascriptTemplate({
      widgetInstance : options.widgetInstance
    });

    var applicationContent = applicationTemplate({
      widgetCode  : options.widgetCode,
      widgetName  : options.widgetName,
      appCategory : options.appCategory,
      appProduct  : options.appProduct 
    });

    var jbossWebContent = jbossWebTemplate({
      widgetCode : options.widgetCode
    });

    var pomContent = pomTemplate({
      artifactId       : options.artifactId,
      parentArtifactId : options.parentArtifactId,
      name             : options.pomWidgetName,
      src              : options.pomWidgetsrc,
      description      : options.widgetName,
      widgetCode       : options.widgetCode,
      productVersion   : options.productVersion
    });

    var webContent = webTemplate();

    // folder structure
    structure = [{
      name: widgetCode,
      children: [{
        name: 'src',
        children: [{
          name: 'main',
          children: [{
            name: 'resources',
            children: [{
              name: 'application.info',
              type: 'file',
              content: applicationContent
            }, {
              name: widgetCode + '_en_US.properties',
              type: 'file'
            }, {
              name: widgetCode + '_es.properties',
              type: 'file'
            }, {
              name: widgetCode + '_pt_BR.properties',
              type: 'file'
            }, {
              name: widgetCode + '.properties',
              type: 'file'
            }, {
              name: 'view.ftl',
              type: 'file',
              content: viewContent
            }]
          }, {
            name: 'webapp',
            children: [{
              name: 'resources',
              children: [{
                name: 'js',
                children: [{
                  name: widgetCode + '.js',
                  type: 'file',
                  content: javascriptContent
                }]
              }, {
                name: 'icon.png',
                type: 'file'
              }]
            },{
                name: 'WEB-INF',
                children: [{
                  name: 'jboss-web.xml',
                  type: 'file',
                  content: jbossWebContent
                }, {
                  name: 'web.xml',
                  type: 'file',
                  content: webContent
                }]
              }]
          }]
        }]
      }, {
        name: 'pom.xml',
        type: 'file',
        content: pomContent
      }]
    }];

    widgetSrc = FLUIG_HOME + config.prefixes[moduleName].src;

    // cria a estrutura da widget no local correto.
    createStructure(structure, widgetSrc);

    // atualiza todos os poms necessários para a widget.
    updatePomDependecies(options);
  }

  function updatePomDependecies(options){
    var dependencies = config.dependencies;
    
    for (var i = 0; i < dependencies.length; i++) {
      var dependency = dependencies[i];
      
      var pomTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname,dependency.template), 'utf8'));

      var pomContent = pomTemplate({
        artifactId       : options.artifactId,
        widgetCode       : options.widgetCode,
      });
      
      var pathWidget = FLUIG_HOME + dependency.src;

      replace({
        regex: dependency.regex,
        replacement: pomContent,
        paths: [pathWidget],
        recursive: false,
        silent: true,
      });
    };

    var widgetParent = FLUIG_HOME + config.prefixes[moduleName].src + "pom.xml"; 
    var pomTemplate  = handlebars.compile(fs.readFileSync(path.join(__dirname,"templates/module_parent.txt"), 'utf8'));
    var pomContent   = pomTemplate({
      artifactId : options.artifactId,
      widgetCode : options.widgetCode,
    });

    replace({
      regex: "<!-- #PLUGIN MODULE ADD POINT -->",
      replacement: pomContent,
      paths: [widgetParent],
      recursive: false,
      silent: true,
    });
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function createStructure(object, path) {
    var obj;

    for(var i = 0; i < object.length; i++) {
      if(object[i].type === 'file') {
        fs.writeFileSync(path + object[i].name, object[i].content || '', 'utf8');
      } else {
        mkpath.sync(path + object[i].name);
      }

      if(object[i].children) {
        createStructure(object[i].children, path + object[i].name + '/');
      }
    }
  }

  init();

})();
