var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var sinon = require('sinon');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;

test('binds from view to model', function(t) {
    t.plan(21);

    var compiled = compiler(fs.readFileSync(__dirname + '/input.t', 'UTF-8'));
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
        message: 'Hello there!',
        count: 41,
        num: 41
    });
    var tree = runtime(compiled, data);

    t.equal(tree.childNodes.length, 7);
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), 'Hello there!');

    data.set('message', 'Leeeeeeeeeeeeeroy!');
    t.equal(el.getAttribute('value'), 'Leeeeeeeeeeeeeroy!');

    el.setAttribute('value', 'Jenkins');
    var setAttribute = sinon.stub(el, 'setAttribute');
    triggerChange(el);
    t.equal(data.get('message'), 'Jenkins');
    t.notOk(setAttribute.called);
    setAttribute.restore();

    el = tree.childNodes[2];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), '42');

    data.set('count', 1336);
    t.equal(el.getAttribute('value'), '1337');

    el.setAttribute('value', '3.14');
    setAttribute = sinon.stub(el, 'setAttribute');
    triggerChange(el);
    t.equal(data.get('count'), 1336);
    t.notOk(setAttribute.called);
    setAttribute.restore();

    el = tree.childNodes[4];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), 'Your name: ');

    data.set('name', 'John');
    t.equal(el.getAttribute('value'), 'Your name: John');

    el.setAttribute('value', 'Your name: John Scott');
    setAttribute = sinon.stub(el, 'setAttribute');
    triggerChange(el);
    t.equal(data.get('name'), 'John');
    t.notOk(setAttribute.called);
    setAttribute.restore();

    el = tree.childNodes[6];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), '41');

    el.setAttribute('value', '42');
    setAttribute = sinon.stub(el, 'setAttribute');
    triggerChange(el);
    t.equal(data.get('num'), 42);
    t.notOk(setAttribute.called);
    setAttribute.restore();
});
