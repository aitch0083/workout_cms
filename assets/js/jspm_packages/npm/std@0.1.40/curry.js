/* */ 
var slice = require('./slice');
module.exports = function curry(fn) {
  var curryArgs = slice(arguments, 1);
  return function curried() {
    var invocationArgs = slice(arguments);
    return fn.apply(this, curryArgs.concat(invocationArgs));
  };
};
