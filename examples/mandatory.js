var compiler = require('../compiler.js');
var runtime = require('../runtime.js');
var Model = require('backbone').Model;

var data = new Model();

var template = compiler('<input type="text" value="{{this.blurb}}"><div>{{this.blurb}}</div>');

runtime.settings = require('../binding-backbone.js');
var tree = runtime(template, data);
while (tree.childNodes.length) {
    document.body.appendChild(tree.firstChild);
}