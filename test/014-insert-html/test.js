var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;

test('injects markup as HTML instead of text', function(t) {
    t.plan(48);

    var compiled = compiler(fs.readFileSync(__dirname + '/markup-container.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    try {
        runtime.settings = { document: document };
    } catch (e) {
        runtime.settings = { document: jsdom('') };
    }
    runtime.settings.read = require('../../binding-backbone.js').read;
    runtime.settings.listen = require('../../binding-backbone.js').listen;

    var data = new Model({
        label: 'Select city:',
        markup: 'TODO'
    });
    var tree = runtime(compiled, data);

    t.equal(tree.childNodes.length, 1);
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'div');
    t.equal(el.childNodes.length, 5);
    el = tree.childNodes[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n    ');
    el = tree.childNodes[0].childNodes[1];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'Select city:');
    el = tree.childNodes[0].childNodes[2];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, ' ');
    el = tree.childNodes[0].childNodes[3];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'TODO');
    el = tree.childNodes[0].childNodes[4];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');

    data.set('markup', '<select><option>Oakland</option><option>New York</option></select> *required');

    el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'div');
    t.equal(el.childNodes.length, 6);
    el = tree.childNodes[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n    ');
    el = tree.childNodes[0].childNodes[1];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'Select city:');
    el = tree.childNodes[0].childNodes[2];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, ' ');
    el = tree.childNodes[0].childNodes[3];
    t.equal(el.nodeName.toLowerCase(), 'select');
    t.equal(el.childNodes.length, 2);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), 'option');
    t.equal(el.childNodes[0].childNodes.length, 1);
    t.equal(el.childNodes[0].childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].childNodes[0].nodeValue, 'Oakland');
    t.equal(el.childNodes[1].nodeName.toLowerCase(), 'option');
    t.equal(el.childNodes[1].childNodes.length, 1);
    t.equal(el.childNodes[1].childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[1].childNodes[0].nodeValue, 'New York');
    el = tree.childNodes[0].childNodes[4];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, ' *required');
    el = tree.childNodes[0].childNodes[5];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');

    data.set('markup', 'REEEEMIX!');

    el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'div');
    t.equal(el.childNodes.length, 5);
    el = tree.childNodes[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n    ');
    el = tree.childNodes[0].childNodes[1];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'Select city:');
    el = tree.childNodes[0].childNodes[2];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, ' ');
    el = tree.childNodes[0].childNodes[3];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'REEEEMIX!');
    el = tree.childNodes[0].childNodes[4];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
});
