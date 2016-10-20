/* */ 
(function(process) {
  'use strict';
  exports.__esModule = true;
  exports.canUseMembrane = undefined;
  var _routerWarning = require('./routerWarning');
  var _routerWarning2 = _interopRequireDefault(_routerWarning);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  var canUseMembrane = exports.canUseMembrane = false;
  var deprecateObjectProperties = function deprecateObjectProperties(object) {
    return object;
  };
  if (process.env.NODE_ENV !== 'production') {
    try {
      if (Object.defineProperty({}, 'x', {get: function get() {
          return true;
        }}).x) {
        exports.canUseMembrane = canUseMembrane = true;
      }
    } catch (e) {}
    if (canUseMembrane) {
      deprecateObjectProperties = function deprecateObjectProperties(object, message) {
        var membrane = {};
        var _loop = function _loop(prop) {
          if (!Object.prototype.hasOwnProperty.call(object, prop)) {
            return 'continue';
          }
          if (typeof object[prop] === 'function') {
            membrane[prop] = function() {
              process.env.NODE_ENV !== 'production' ? (0, _routerWarning2.default)(false, message) : void 0;
              return object[prop].apply(object, arguments);
            };
            return 'continue';
          }
          Object.defineProperty(membrane, prop, {get: function get() {
              process.env.NODE_ENV !== 'production' ? (0, _routerWarning2.default)(false, message) : void 0;
              return object[prop];
            }});
        };
        for (var prop in object) {
          var _ret = _loop(prop);
          if (_ret === 'continue')
            continue;
        }
        return membrane;
      };
    }
  }
  exports.default = deprecateObjectProperties;
})(require('process'));
