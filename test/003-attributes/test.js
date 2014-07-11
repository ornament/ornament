var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;

test('parse nodes with attributes', function(t) {
    t.plan(32);

    var compiled = compiler(fs.readFileSync(__dirname + '/attributes.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    try {
        runtime.settings = { document: document };
    } catch (e) {
        runtime.settings = { document: jsdom('') };
    }
    runtime.settings.read = require('../../binding-backbone.js').read;
    runtime.settings.listen = require('../../binding-backbone.js').listen;
    var data = new Model({
        name: 'bar'
    });
    var tree = runtime(compiled, data);

    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('type'), 'text');
    t.equal(el.getAttribute('value'), 'foo');
    t.equal(el.getAttribute('data-role'), 'bar');
    t.equal(el.childNodes.length, 0);
    el = tree.childNodes[1];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = tree.childNodes[2];
    t.equal(el.nodeName.toLowerCase(), 'textarea');
    t.equal(el.getAttribute('name'), 'message');
    t.equal(el.getAttribute('id'), 'myMessage');
    t.equal(el.getAttribute('cols'), '30');
    t.equal(el.getAttribute('rows'), '10');
    t.equal(el.childNodes.length, 0);
    el = tree.childNodes[3];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = tree.childNodes[4];
    t.equal(el.nodeName.toLowerCase(), 'button');
    t.equal(el.getAttribute('class'), 'btn btn-primary');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, 'Click me!');
    el = tree.childNodes[5];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = tree.childNodes[6];
    t.equal(el.nodeName.toLowerCase(), 'div');
    t.equal(el.getAttribute('class'), 'alert alert-info');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, '\n    This is a message. Read me.\n');

    data.set('name', 42);

    el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('type'), 'text');
    t.equal(el.getAttribute('value'), 'foo');
    t.equal(el.getAttribute('data-role'), '42');
});
