/* */ 
if (global.GENTLY)
  require = GENTLY.hijack(require);
var querystring = require('querystring');
function QuerystringParser(maxKeys) {
  this.maxKeys = maxKeys;
  this.buffer = '';
}
exports.QuerystringParser = QuerystringParser;
QuerystringParser.prototype.write = function(buffer) {
  this.buffer += buffer.toString('ascii');
  return buffer.length;
};
QuerystringParser.prototype.end = function() {
  var fields = querystring.parse(this.buffer, '&', '=', {maxKeys: this.maxKeys});
  for (var field in fields) {
    this.onField(field, fields[field]);
  }
  this.buffer = '';
  this.onEnd();
};
