/* */ 
var copy = require('./copy');
module.exports = function extend(target, extendWith) {
  target = copy(target);
  for (var key in extendWith) {
    if (typeof target[key] != 'undefined') {
      continue;
    }
    target[key] = extendWith[key];
  }
  return target;
};
