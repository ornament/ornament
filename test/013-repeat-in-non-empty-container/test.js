var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var _ = require('lodash');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Collection = require('backbone').Collection;

test('place repeated items correctly according to existing siblings', function(t) {
    t.plan(32);

    var compiled = compiler(fs.readFileSync(__dirname + '/list.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    try {
        runtime.settings = { document: document };
    } catch (e) {
        runtime.settings = { document: jsdom('') };
    }
    runtime.settings.inject = require('../../binding-backbone.js').read;
    runtime.settings.listen = require('../../binding-backbone.js').listen;
    runtime.settings.collection = require('../../binding-backbone.js').collection;
    runtime.settings.listenToCollection = require('../../binding-backbone.js').listenToCollection;

    function children(element) {
        return _.reject(element.childNodes, function(node) {
            return node.nodeName.toLowerCase() === '#text';
        });
    }

    var data = {
        people: new Collection()
    };
    var tree = runtime(compiled, data);

    t.equal(children(tree).length, 2);
    var el = children(tree)[0];
    t.equal(el.nodeName.toLowerCase(), 'ul');
    el = children(children(tree)[0])[0];
    t.equal(el.nodeName.toLowerCase(), 'li');
    el = children(children(tree)[0])[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        + Add person\n    ');
    el = children(tree)[1];
    t.equal(el.nodeName.toLowerCase(), 'select');
    el = children(children(tree)[1])[0];
    t.equal(el.nodeName.toLowerCase(), 'option');
    el = children(children(tree)[1])[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'Select person...');

    data.people.reset([{
        name: 'Drake'
    }, {
        name: 'Bell'
    }]);

    el = children(tree)[0];
    t.equal(el.nodeName.toLowerCase(), 'ul');
    t.equal(children(children(tree)[0]).length, 3);
    el = children(children(tree)[0])[0];
    t.equal(el.nodeName.toLowerCase(), 'li');
    el = children(children(tree)[0])[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        Drake\n    ');
    el = children(children(tree)[0])[1];
    t.equal(el.nodeName.toLowerCase(), 'li');
    el = children(children(tree)[0])[1].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        Bell\n    ');
    el = children(children(tree)[0])[2];
    t.equal(el.nodeName.toLowerCase(), 'li');
    el = children(children(tree)[0])[2].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        + Add person\n    ');
    el = children(tree)[1];
    t.equal(el.nodeName.toLowerCase(), 'select');
    t.equal(children(children(tree)[0]).length, 3);
    el = children(children(tree)[1])[0];
    t.equal(el.nodeName.toLowerCase(), 'option');
    el = children(children(tree)[1])[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, 'Select person...');
    el = children(children(tree)[1])[1];
    t.equal(el.nodeName.toLowerCase(), 'option');
    el = children(children(tree)[1])[1].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        Drake\n    ');
    el = children(children(tree)[1])[2];
    t.equal(el.nodeName.toLowerCase(), 'option');
    el = children(children(tree)[1])[2].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        Bell\n    ');
});
