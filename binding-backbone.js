var _ = require('lodash');

/**
 * Read a arbitrarily nested value on `scope`.
 *
 * @param {Object} scope the scope to read from
 * @param {..String} attribute the attributes, accessed in order of appearance
 * @returns {*}
 */
function read(scope) {
    var attributes = _.rest(arguments);
    var head = getHead(scope, attributes);
    var value = get(head.object, head.attribute);
    return value === undefined ? '' : value;
}

/**
 * Write a value to an attribute - at an arbitrary depth - on scope.
 *
 * @param {*} value the value to write
 * @param {Object} scope the scope to write to
 * @param {..String} attribute the attributes, accessed in order of appearance
 */
function write(value, scope) {
    var attributes = _.rest(arguments, 2);
    var head = getHead(scope, attributes);
    if (_.isFunction(head.object.get)) {
        head.object.set(head.attribute, value);
    } else {
        head.object[head.attribute] = value;
    }
}

/**
 * Find the 'head' of an arbitrarily deep member identifier.
 * @example
 * // returns { object: one.two, attribute: 'three' }
 * getHead(one, ['two', 'three'])
 * @param {Object} base the base object of the identifier
 * @param {String[]} attributes the attributes that specify the identifier, extending from `base`
 * @returns {{object: Object, attribute: String}}
 */
function getHead(base, attributes) {
    var attr = attributes.pop();
    base = _.reduce(attributes, get, base);
    return {
        object: base,
        attribute: attr
    };
}

/**
 * Read and return a property from an object.
 * Reads via `get()` when available (except for collections).
 *
 * @param {Object} object the object to read from
 * @param {String} attribute the attribute to read
 * @returns {*}
 */
function get(object, attribute) {
    if (object === undefined) { return; }
    if (_.isFunction(object.get) && !_.has(object, 'models')) {
        return object.get(attribute);
    } else {
        return object[attribute];
    }
}

function collection(scope) {
    if (scope.hasOwnProperty('models')) {
        return scope.models;
    } else {
        return scope;
    }
}

/**
 * Set up listener(s) for changes to `scope`
 *
 * @param {Function} cb the callback to execute on change events
 * @param {Object} scope the object to listen to
 * @param {String[]} attributes the attributes to listen to
 * @param {Object} helpers an object containing template helper methods
 */
function listen(cb, scope, attributes, helpers) {
    _.forEach(attributes, function(attr) {
        // TODO: Marshall all changes to the element's attributes
        // through one handler and execute DOM update on next tick
        scope.on('change:' + attr, function() {
            cb(helpers, scope);
        });
    });
    // TODO: Tear down when element disappears
}

function listenToCollection(items, add, remove) {
    items.on('add', function(item) {
        var index = _.indexOf(items.models, item);
        add(item, index);
    });
    items.on('remove', function(item, collection, options) {
        remove(item, options.index);
    });
    items.on('reset', function(collection, options) {
        _.forEachRight(options.previousModels, remove);
        collection.forEach(add);
    });
    items.on('sort', function(collection) {
        // TODO: Optimize
        _.forEachRight(collection.models, remove);
        collection.forEach(add);
    });
}

module.exports.read = read;
module.exports.write = write;
module.exports.collection = collection;
module.exports.listenToCollection = listenToCollection;
module.exports.listen = listen;
