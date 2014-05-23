var _ = require('lodash');

function createValueFn(value) {
    /* jshint evil: true */
    return new Function('helpers', 'scope', 'return ' + value);
    /* jshint evil: false */
}

function createElement(root, element, scope, config) {
    var el;
    if (element.tag === '#text') {
        if (element.fields) {
            var fn = createValueFn(element.value);
            el = config.document.createTextNode('');
            var value = function(helpers, scope) {
                el.nodeValue = fn(helpers, scope);
            };
            value(config, scope);
            if (config.listen) {
                config.listen(value, scope, element.fields, config);
            }
        } else {
            el = config.document.createTextNode(element.value);
        }
    } else if (element.tag === '#html') {
        var fn = createValueFn(element.value);
        var kids;
        var indexOffset = root.childNodes.length;
        var container = config.document.createElement('div');
        var addNodes = function (helpers, scope) {
            _.forEach(kids, function (node) {
                root.removeChild(node);
            });
            container.innerHTML = fn(helpers, scope);
            // nodeList is live and only array-like
            kids = _.toArray(container.childNodes);
            _.forEach(kids, function (node, index) {
                var children = root.childNodes;
                index += indexOffset;
                // TODO: Needs to not be affected by sibling's `if` result
                if (index === children.length) {
                    root.appendChild(node);
                } else {
                    root.insertBefore(node, children[index]);
                }
            });
        };
        addNodes(config, scope);
        if (config.listen) {
            config.listen(addNodes, scope, element.fields, config);
        }
    } else {
        if (element.repeat) {
            var indexOffset = root.children.length;
            var collection = config.inject(scope, element.repeat);
            var items = config.collection(collection);
            if (_.isFunction(config.listenToCollection)) {
                var add = function(item, index) {
                    var el = createElement(root, elm, item, config);
                    if (el) {
                        var children = root.children;
                        index += indexOffset;
                        // TODO: Needs to not be affected by sibling's `if` result
                        if (index === children.length) {
                            root.appendChild(el);
                        } else {
                            root.insertBefore(el, children[index]);
                        }
                    }
                };
                var remove = function(item, index) {
                    index += indexOffset;
                    // TODO: Needs to keep reference to actual DOM node
                    root.removeChild(root.children[index]);
                };
                config.listenToCollection(collection, add, remove);
            }
            var elm = _.omit(element, 'repeat');
            _.forEach(items, function(item) {
                var el = createElement(root, elm, item, config);
                if (el) {
                    root.appendChild(el);
                }
            });
        } else {
            el = config.document.createElement(element.tag);
            _.forEach(element.attributes, function(value, attr) {
                if (attr === 'if') {
                    /* jshint evil: true */
                    el._if = new Function('return ' + value);
                    /* jshint evil: false */
                } else {
                    if (_.isString(value)) {
                        el.setAttribute(attr, value);
                    } else {
                        var fn = createValueFn(value.value);
                        el.setAttribute(attr, fn(config, scope));
                        if (config.listen) {
                            var onChange = function(helpers, scope) {
                                el.setAttribute(attr, fn(helpers, scope));
                            };
                            config.listen(onChange, scope, value.fields, config);
                        }
                    }
                }
            });
            createElements(el, element.children, scope, config);
        }
    }
    return el;
}

function createElements(root, elements, scope, config) {
    _.forEach(elements, function(element) {
        var el = createElement(root, element, scope, config);
        if (el) {
            root.appendChild(el);
        }
    });
}

function runtime(template, scope) {
    var cfg = _.defaults({}, runtime.settings, config);
    var doc = cfg.document;
    var nodeList = doc.createDocumentFragment();
    createElements(nodeList, template, scope, cfg);
    return nodeList;
}

var config = {
    inject: function(scope, attribute) {
        var value = scope[attribute];
        return value === undefined ? '' : value;
    },
    collection: _.identity
};
try {
    config.document = document;
} catch (e) {} // env: Node.js

runtime.settings = {};

module.exports = runtime;
