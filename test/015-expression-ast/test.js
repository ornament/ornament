var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;
var Collection = require('backbone').Collection;

test('parses interpolated values as expressions', function(t) {
    t.plan(24);

    var compiled = compiler(fs.readFileSync(__dirname + '/misc.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    try {
        runtime.settings = { document: document };
    } catch (e) {
        runtime.settings = { document: jsdom('') };
    }
    runtime.settings.read = require('../../binding-backbone.js').read;
    runtime.settings.collection = require('../../binding-backbone.js').collection;

    var data = new Model({
        title: 'My pretty title',
        message: 'Hello there!',
        messages: [{
            body: 'body text'
        }],
        privateMessages: new Collection(['bar', 'baz']),
        myValue: 'val',
        second: {
            value: 'again'
        },
        count: 41
    });
    data.fn = function() {
        return 'echo: ' + [].slice.call(arguments, 0).join(', ');
    };
    var tree = runtime(compiled, data);

    t.equal(tree.childNodes.length, 21);
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'My pretty title');
    el = tree.childNodes[2];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(String(el.nodeValue), '1'); // TODO: Report bug in jsdom
    el = tree.childNodes[4];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(String(el.nodeValue), '2');
    el = tree.childNodes[6];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '1msgs');
    el = tree.childNodes[8];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(String(el.nodeValue), '3');
    el = tree.childNodes[10];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'body text');
    el = tree.childNodes[12];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'echo: ');
    el = tree.childNodes[14];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'echo: val');
    el = tree.childNodes[16];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'echo: val, again');
    el = tree.childNodes[18];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), 'My pretty title');
    el = tree.childNodes[20];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), '42');
});
