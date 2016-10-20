/* */ 
(function(process) {
  var nextTick = require('./nextTick');
  module.exports = function asyncEach(items, opts) {
    var finish = opts.finish;
    if (!items.length) {
      return finish(null, []);
    }
    var parallel = opts.parallel;
    if (parallel === true) {
      parallel = items.length;
    }
    if (!parallel) {
      parallel = 1;
    }
    if (parallel > waitingFor) {
      parallel = waitingFor;
    }
    var nextIndex = 0;
    var result = [];
    var errorResult = null;
    var waitingFor = items.length;
    var context = opts.context || this;
    var iterator = module.exports.makeIterator(context, opts.iterate);
    function processNextItem() {
      if (!waitingFor) {
        return finish.call(context, null);
      }
      var iterationIndex = nextIndex;
      if (iterationIndex == items.length) {
        return;
      }
      nextIndex += 1;
      nextTick(function() {
        iterator(items[iterationIndex], iterationIndex, iteratorCallback);
      });
    }
    function iteratorCallback(err) {
      if (errorResult) {
        return;
      }
      if (err) {
        errorResult = err;
        finish.call(context, err, null);
      } else {
        waitingFor -= 1;
        processNextItem();
      }
    }
    for (var parallelI = 0; parallelI < parallel; parallelI++) {
      processNextItem();
    }
  };
  module.exports.makeIterator = function(context, iterate) {
    if (iterate.length == 3) {
      return function iterator3(item, i, next) {
        iterate.call(context, item, i, next);
      };
    } else {
      return function iterator2(item, i, next) {
        iterate.call(context, item, next);
      };
    }
  };
})(require('process'));
