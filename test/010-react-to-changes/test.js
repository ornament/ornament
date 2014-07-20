var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var _ = require('lodash');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;

test('reactive templates', function(t) {
    t.plan(7);

    var compiled = compiler(fs.readFileSync(__dirname + '/interpolation.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    try {
        runtime.settings = { document: document };
    } catch (e) {
        runtime.settings = { document: jsdom('') };
    }
    runtime.settings.read = require('../../binding-backbone.js').read;
    runtime.settings.listen = require('../../binding-backbone.js').listen;
    var data = new Model();
    var tree = runtime(compiled, data);

    function html() {
        return _.reduce(tree.childNodes, function(str, child) {
            return str + (child.nodeValue || child.outerHTML);
        }, '');
    }

    t.equal(html(), '<span>, </span>\n<span>Hello  !</span>\n' +
        '<span>Username: </span>\n<span>\'\'</span>\n<span>a  expression</span>');

    data.set('first', 'Drake');

    t.equal(html(), '<span>, Drake</span>\n<span>Hello Drake !</span>\n' +
        '<span>Username: Drake</span>\n<span>\'Drake\'</span>\n<span>a  expression</span>');

    data.set('last', 'Bell');

    t.equal(html(), '<span>Bell, Drake</span>\n<span>Hello Drake Bell!</span>\n' +
        '<span>Username: DrakeBell</span>\n<span>\'Drake\'</span>\n<span>a  expression</span>');

    data.unset('first');

    t.equal(html(), '<span>Bell, </span>\n<span>Hello  Bell!</span>\n' +
        '<span>Username: Bell</span>\n<span>\'\'</span>\n<span>a  expression</span>');

    data.clear();

    t.equal(html(), '<span>, </span>\n<span>Hello  !</span>\n' +
        '<span>Username: </span>\n<span>\'\'</span>\n<span>a  expression</span>');

    data.set('complex', 'complex');

    t.equal(html(), '<span>, </span>\n<span>Hello  !</span>\n' +
        '<span>Username: </span>\n<span>\'\'</span>\n<span>a complex expression</span>');
});
