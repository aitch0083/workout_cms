/* */ 
var slice = require('./slice');
module.exports = function call(methodName) {
  var curryArgs = slice(arguments, 1);
  return function futureCall(obj) {
    var fn = obj[methodName],
        args = curryArgs.concat(slice(arguments, 1));
    return fn.apply(obj, args);
  };
};
