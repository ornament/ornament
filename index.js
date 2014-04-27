var compiler = require('./compiler.js');
var runtime = require('./runtime.js');

module.exports = function(str, scope) {
    return runtime(compiler(str), scope);
};
module.exports.compiler = compiler;
module.exports.runtime = runtime;
