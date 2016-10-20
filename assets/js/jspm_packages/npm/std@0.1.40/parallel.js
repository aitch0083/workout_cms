/* */ 
var asyncMap = require('./asyncMap');
var slice = require('./slice');
module.exports = function parallel() {
  var parallelFunctions = slice(arguments);
  var finish = parallelFunctions.pop();
  asyncMap(parallelFunctions, {
    parallel: parallelFunctions.length,
    iterate: function(parallelFn, done) {
      parallelFn(done);
    },
    finish: function(err, mapResults) {
      if (err) {
        return finish(err);
      }
      finish.apply(this, [null].concat(mapResults));
    }
  });
};
