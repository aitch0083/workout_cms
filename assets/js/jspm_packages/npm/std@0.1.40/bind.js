/* */ 
var slice = require('./slice');
module.exports = function bind(context, method) {
  if (typeof method == 'string') {
    method = context[method];
  }
  var curryArgs = slice(arguments, 2);
  return function bound() {
    var invocationArgs = slice(arguments);
    return method.apply(context, curryArgs.concat(invocationArgs));
  };
};
