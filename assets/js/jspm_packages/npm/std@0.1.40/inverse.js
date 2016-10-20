/* */ 
var each = require('./each');
module.exports = function inverse(obj) {
  var result = {};
  each(obj, function(val, key) {
    result[val] = key;
  });
  return result;
};
