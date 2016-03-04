var inquirer = require("inquirer");

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


inquirer.prompt([
  {
    type      : "list",
    name      : "modulo",
    message   : "Em qual módulo você deseja criar a widget?",
    choices   : choices
  },
  {
    type: "input",
    name: "widgetName",
    message: "Qual o nome da widget?",
    default: function () { return "Doe"; }
  },
{
    type: "input",
    name: "widgetCode",
    message: "Digite o code da widget sem espaços ou caracteres especiais",
    default: function () { return "Doe"; }
  },
], function( answers ) {
  console.log( JSON.stringify(answers, null, "  ") );
});