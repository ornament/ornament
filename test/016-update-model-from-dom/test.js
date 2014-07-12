var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;

test('binds from view to model', function(t) {
    t.plan(14);

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
        count: 41
    });
    var tree = runtime(compiled, data);

    t.equal(tree.childNodes.length, 5);
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), 'Hello there!');

    data.set('message', 'Leeeeeeeeeeeeeroy!');
    t.equal(el.getAttribute('value'), 'Leeeeeeeeeeeeeroy!');

    el.setAttribute('value', 'Jenkins');
    triggerChange(el);
    t.equal(data.get('message'), 'Jenkins');

    el = tree.childNodes[2];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), '42');

    data.set('count', 1336);
    t.equal(el.getAttribute('value'), '1337');

    el.setAttribute('value', '3.14');
    triggerChange(el);
    t.equal(data.get('count'), 1336);

    el = tree.childNodes[4];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('value'), 'Your name: ');

    data.set('name', 'John');
    t.equal(el.getAttribute('value'), 'Your name: John');

    el.setAttribute('value', 'Your name: John Scott');
    triggerChange(el);
    t.equal(data.get('name'), 'John');
    // TODO: Caret pos before/after
});

// handle expressions
// parse expressions to check for syntax errors, then extract listen-fields..
// ..mutate expressions from foo.bar.baz to whatever is required by binding
// ornament -b backbone app.t > app.json

// At compile-time the entire "value" attribute is checked. If it only contains a single
// property then it can be bound both ways, but if it is an expression

// WIP 2
// Binds both ways
/*
<input value="{{this.title}}">
[{
    "tag": "input",
    "attributes": {
        "value": {
            "fields": ["title"]
        }
    }
}]
*/
// Binds only model->view (display warning during compilation?)
/*
<input value="{{this.count + 1}}">
[{
    "tag": "input",
    "attributes": {
        "value": {
            "fields": [["count"]],
            "expression": "helpers.read(this, 'count') + 1"
        }
    }
}]
*/
