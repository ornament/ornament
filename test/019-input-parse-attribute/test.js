var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;

test('allows for an optional `parse` attribute on input elements', function(t) {
    t.plan(6);

    var compiled = compiler(fs.readFileSync(__dirname + '/template.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    try {
        runtime.settings = { document: document };
    } catch (e) {
        runtime.settings = { document: jsdom('') };
    }
    runtime.settings.read = require('../../binding-backbone.js').read;
    runtime.settings.write = require('../../binding-backbone.js').write;
    runtime.settings.listen = require('../../binding-backbone.js').listen;

    function triggerChange(el) {
        var event = runtime.settings.document.createEvent('KeyboardEvent');
        var eventName = 'oninput' in el ? 'input' : 'keyup';
        event.initEvent(eventName, true, true);
        el.dispatchEvent(event);
    }

    var data = new Model({
        num: 41
    });
    var tree = runtime(compiled, data);

    t.equal(tree.childNodes.length, 1);
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), '41');
    t.equal(el.getAttribute('parse'), null);

    el.setAttribute('value', '42');
    triggerChange(el);
    t.equal(data.get('num'), 42);
});
