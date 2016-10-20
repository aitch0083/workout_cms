/* */ 
var slice = require('./slice');
module.exports = function invokeWith() {
  var curryArgs = slice(arguments, 0);
  return function futureInvocation(fn) {
    var args = curryArgs.concat(slice(arguments, 1));
    return fn.apply(this, args);
  };
};
