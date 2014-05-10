var _ = require('lodash');

function read(scope, attribute) {
    // TODO: Handle nested attributes
    var value;
    if (_.isFunction(scope.get)) {
        value = scope.get(attribute);
    } else {
        value = scope[attribute];
    }
    return value === undefined ? '' : value;
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
module.exports.collection = collection;
module.exports.listenToCollection = listenToCollection;
module.exports.listen = listen;
