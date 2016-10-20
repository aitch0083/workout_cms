/* */ 
var isArguments = require('../isArguments'),
    slice = require('../slice'),
    keys = require('../keys');
var deepEqual = module.exports = function(actual, expected) {
  if (actual === expected) {
    return true;
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;
  } else {
    return objEquiv(actual, expected);
  }
};
function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}
function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  if (a.prototype !== b.prototype)
    return false;
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = slice(a, 0);
    b = slice(b, 0);
    return deepEqual(a, b);
  }
  try {
    var ka = keys(a),
        kb = keys(b),
        key,
        i;
  } catch (e) {
    return false;
  }
  if (ka.length != kb.length)
    return false;
  ka.sort();
  kb.sort();
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key]))
      return false;
  }
  return true;
}
