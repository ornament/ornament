var _ = require('lodash');

var helpers = {
    inject: function(scope, attribute) {
        // TODO: Handle nested attributes
        var value = scope.get(attribute);
        return value === undefined ? '' : value;
    }
};

/**
 * Set up listener(s) for changes to `scope`
 *
 * @param {Function} cb the callback to execute on change events
 * @param {Mixed} scope the object to listen to
 * @param {String[]} attributes the attributes to listen to
 */
function listen(cb, scope, attributes) {
    _.forEach(attributes, function(attr) {
        // TODO: Marshall all changes to the element's attributes
        // through one handler and execute DOM update on next tick
        scope.on('change:' + attr, function() {
            cb(helpers, scope);
        });
    });
    // TODO: Tear down when element disappears
}

function createElements(root, elements, scope) {
    _.forEach(elements, function(element) {
        var el;
        if (element.tag === '#text') {
            /* jshint evil: true */
            var fn = new Function('helpers', 'scope', 'return ' + element.value);
            /* jshint evil: false */
            el = config.document.createTextNode(fn(helpers, scope));
            el.fn = function(helpers, scope) {
                el.nodeValue = fn(helpers, scope);
            };
            listen(el.fn, scope, element.fields);
        } else {
            el = config.document.createElement(element.tag);
            _.forEach(element.attributes, function(attr, value) {
                // TODO: Test me
                el.setAttribute(value, attr);
            });
            createElements(el, element.children, scope);
        }
        root.appendChild(el);
    });
}

function runtime(template, scope) {
    var doc = config.document;
    var nodeList = doc.createDocumentFragment();
    createElements(nodeList, template, scope);
    return nodeList;
}

var config = {};
try {
    config.document = document;
} catch (e) {} // env: Node.js

runtime.set = function(options) {
    if (options.hasOwnProperty('document')) {
        config.document = options.document;
    }
};

module.exports = runtime;
