/* */ 
var create = require('./create');
var proto = module.exports = function proto(prototypeObject, instantiationFunction, propertiesToAdd) {
  function F(args) {
    return instantiationFunction.apply(this, args);
  }
  F.prototype = prototypeObject ? create(prototypeObject, propertiesToAdd) : propertiesToAdd;
  return function() {
    return new F(arguments);
  };
};
