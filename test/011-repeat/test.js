var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Collection = require('backbone').Collection;

test('repeat items in collections', function(t) {
    t.plan(31);

    var compiled = compiler(fs.readFileSync(__dirname + '/list.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    runtime.settings = {
        document: jsdom(''),
        inject: require('../../binding-backbone.js').read,
        collection: require('../../binding-backbone.js').collection
    };
    var data = {
        people: new Collection()
    };
    var tree = runtime(compiled, data);

    t.equal(tree.childNodes.length, 1);
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'ul');
    el = tree.childNodes[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n    ');
    el = tree.childNodes[0].childNodes[1];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');

    data.people.reset([{
        name: 'Drake'
    }, {
        name: 'Bell'
    }]);
    tree = runtime(compiled, data);

    t.equal(tree.childNodes.length, 1);
    el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'ul');
    el = tree.childNodes[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n    ');
    el = tree.childNodes[0].childNodes[1];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    el = tree.childNodes[0].childNodes[1].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        Drake\n    ');
    el = tree.childNodes[0].childNodes[2];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    el = tree.childNodes[0].childNodes[2].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        Bell\n    ');
    el = tree.childNodes[0].childNodes[3];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');

    data.people = [{
        name: 'Drake'
    }];
    tree = runtime(compiled, data);

    t.equal(tree.childNodes.length, 1);
    el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'ul');
    el = tree.childNodes[0].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n    ');
    el = tree.childNodes[0].childNodes[1];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    el = tree.childNodes[0].childNodes[1].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        Drake\n    ');
    el = tree.childNodes[0].childNodes[2];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
});