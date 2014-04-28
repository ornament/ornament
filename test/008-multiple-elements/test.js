var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');

test('parsing of multiple top-level elements', function(t) {
    t.plan(20);

    var compiled = compiler(fs.readFileSync(__dirname + '/multiple-elements.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    try {
        runtime.settings = { document: document };
    } catch (e) {
        runtime.settings = { document: jsdom('') };
    }
    var tree = runtime(compiled);
    t.equal(tree.childNodes.length, 5, 'should parse all the top-level elements');
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'label');
    t.equal(el.getAttribute('for'), 'foo');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, 'Number');
    el = tree.childNodes[1];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = tree.childNodes[2];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('id'), 'foo');
    t.equal(el.getAttribute('type'), 'number');
    t.equal(el.getAttribute('pattern'), '[0-9]');
    el = tree.childNodes[3];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = tree.childNodes[4];
    t.equal(el.nodeName.toLowerCase(), 'button');
    t.equal(el.getAttribute('class'), 'btn btn-primary');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, 'Clicky');
});
