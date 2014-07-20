var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;

test('parses and renders comments', function(t) {
    t.plan(11);

    var compiled = compiler(fs.readFileSync(__dirname + '/comment.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    try {
        runtime.settings = { document: document };
    } catch (e) {
        runtime.settings = { document: jsdom('') };
    }
    runtime.settings.read = require('../../binding-backbone.js').read;
    runtime.settings.listen = require('../../binding-backbone.js').listen;

    var data = new Model({
        comment: 'something'
    });
    var tree = runtime(compiled, data);
    t.equal(tree.childNodes.length, 6);
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLocaleLowerCase(), '#comment');
    t.equal(el.nodeValue, ' This is a comment ');
    el = tree.childNodes[2].childNodes[1];
    t.equal(el.nodeName.toLocaleLowerCase(), '#comment');
    t.equal(el.nodeValue, ' Here be comments ');
    el = tree.childNodes[3];
    t.equal(el.nodeName.toLocaleLowerCase(), '#comment');
    t.equal(el.nodeValue, ' </SPAN> ');
    el = tree.childNodes[5];
    t.equal(el.nodeName.toLocaleLowerCase(), '#comment');
    t.equal(el.nodeValue, ' Well well well something ');

    data.set('comment', 'else');

    t.equal(el.nodeValue, ' Well well well else ');
});
