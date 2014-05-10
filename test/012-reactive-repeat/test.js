var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var _ = require('lodash');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Collection = require('backbone').Collection;

test('reactive display of items in collections', function(t) {
    t.plan(110);

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
    data.people.comparator = 'name';
    var tree = runtime(compiled, data);

    var kids = children(tree);
    t.equal(kids.length, 1);
    var el = kids[0];
    t.equal(el.nodeName.toLowerCase(), 'ul');
    t.equal(el.className, 'nav nav-tabs');
    t.equal(el.children.length, 0);

    data.people.add({
        name: 'Drake'
    });

    kids = children(children(tree)[0]);
    t.equal(kids.length, 1);
    el = kids[0];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Drake\n        ');

    data.people.add({
        name: 'Bell'
    });

    kids = children(children(tree)[0]);
    t.equal(kids.length, 2);
    el = kids[0];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Bell\n        ');
    el = kids[1];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Drake\n        ');

    data.people.add({
        name: 'Zulu'
    });

    kids = children(children(tree)[0]);
    t.equal(kids.length, 3);
    el = kids[0];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Bell\n        ');
    el = kids[1];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Drake\n        ');
    el = kids[2];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Zulu\n        ');

    data.people.comparator = function(a, b) {
        a = a.get('name');
        b = b.get('name');
        if (a === b) {
            return 0;
        }
        return a < b ? 1 : -1;
    };
    data.people.sort();

    kids = children(children(tree)[0]);
    t.equal(kids.length, 3);
    el = kids[0];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Zulu\n        ');
    el = kids[1];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Drake\n        ');
    el = kids[2];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Bell\n        ');

    data.people.comparator = 'name';
    data.people.sort();

    kids = children(children(tree)[0]);
    t.equal(kids.length, 3);
    el = kids[0];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Bell\n        ');
    el = kids[1];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Drake\n        ');
    el = kids[2];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Zulu\n        ');

    data.people.remove(data.people.at(0));

    kids = children(children(tree)[0]);
    t.equal(kids.length, 2);
    el = kids[0];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Drake\n        ');
    el = kids[1];
    t.equal(el.nodeName.toLowerCase(), 'li');
    t.equal(el.getAttribute('repeat'), null);
    t.equal(el.getAttribute('class'), 'nav-item');
    el = children(el)[0];
    t.equal(el.nodeName.toLowerCase(), 'a');
    t.equal(el.getAttribute('href'), '#');
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n            Zulu\n        ');

    data.people.reset();

    kids = children(children(tree)[0]);
    t.equal(kids.length, 0);
});
