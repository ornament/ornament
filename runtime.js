var _ = require('lodash');

function createValueFn(value) {
    /* jshint evil: true */
    return new Function('helpers', 'scope', 'return ' + value);
    /* jshint evil: false */
}

function insertNode(parent, node, index) {
    var children = parent.childNodes;
    // TODO: Needs to not be affected by sibling's `if` result
    if (index === children.length) {
        parent.appendChild(node);
    } else {
        parent.insertBefore(node, children[index]);
    }
}

function createTextNode(root, element, scope, config, indexOffset) {
    var el;
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
    insertNode(root, el, indexOffset);
    return indexOffset + 1;
}

function createHTMLNode(root, element, scope, config, indexOffset) {
    var fn = createValueFn(element.value);
    var kids;
    var container = config.document.createElement('div');
    var addNodes = function(helpers, scope) {
        _.forEach(kids, function(node) {
            root.removeChild(node);
        });
        container.innerHTML = fn(helpers, scope);
        // nodeList is live and only array-like
        kids = _.toArray(container.childNodes);
        _.forEach(kids, function(node, index) {
            insertNode(root, node, index + indexOffset);
        });
    };
    addNodes(config, scope);
    if (config.listen) {
        config.listen(addNodes, scope, element.fields, config);
    }
    return indexOffset + kids.length;
}

function createNodeList(root, element, scope, config, indexOffset) {
    var collection = config.inject(scope, element.repeat);
    var items = config.collection(collection);
    if (_.isFunction(config.listenToCollection)) {
        var add = function(item, index) {
            createElement(root, elm, item, config, index + indexOffset);
        };
        var remove = function(item, index) {
            index += indexOffset;
            // TODO: Needs to keep reference to actual DOM node
            root.removeChild(root.childNodes[index]);
        };
        config.listenToCollection(collection, add, remove);
    }
    var elm = _.omit(element, 'repeat');
    _.forEach(items, function(item, index) {
        createElement(root, elm, item, config, index + indexOffset);
    });
    return indexOffset + items.length;
}

function createNode(root, element, scope, config, indexOffset) {
    var el = config.document.createElement(element.tag);
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
    createElements(el, element.children, scope, config, indexOffset);
    insertNode(root, el, indexOffset);
    return indexOffset + 1;
}

function createElement(root, element, scope, config, indexOffset) {
    if (element.tag === '#text') {
        return createTextNode(root, element, scope, config, indexOffset);
    } else if (element.tag === '#html') {
        return createHTMLNode(root, element, scope, config, indexOffset);
    } else if (element.repeat) {
        return createNodeList(root, element, scope, config, indexOffset);
    } else {
        return createNode(root, element, scope, config, indexOffset);
    }
}

function createElements(root, elements, scope, config, indexOffset) {
    _.forEach(elements, function(element) {
        indexOffset = createElement(root, element, scope, config, indexOffset);
    });
}

function runtime(template, scope) {
    var cfg = _.defaults({}, runtime.settings, config);
    var doc = cfg.document;
    var nodeList = doc.createDocumentFragment();
    createElements(nodeList, template, scope, cfg, 0);
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
