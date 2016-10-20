/* */ 
var CookieJar = require('cookiejar').CookieJar;
var CookieAccess = require('cookiejar').CookieAccessInfo;
var parse = require('url').parse;
var request = require('../client');
var methods = require('methods');
module.exports = Agent;
function Agent(options) {
  if (!(this instanceof Agent))
    return new Agent(options);
  if (options) {
    this._ca = options.ca;
    this._key = options.key;
    this._cert = options.cert;
  }
  this.jar = new CookieJar;
}
Agent.prototype._saveCookies = function(res) {
  var cookies = res.headers['set-cookie'];
  if (cookies)
    this.jar.setCookies(cookies);
};
Agent.prototype._attachCookies = function(req) {
  var url = parse(req.url);
  var access = CookieAccess(url.hostname, url.pathname, 'https:' == url.protocol);
  var cookies = this.jar.getCookies(access).toValueString();
  req.cookies = cookies;
};
if (methods.indexOf('del') == -1) {
  methods = methods.slice(0);
  methods.push('del');
}
methods.forEach(function(method) {
  var name = method;
  method = 'del' == method ? 'delete' : method;
  method = method.toUpperCase();
  Agent.prototype[name] = function(url, fn) {
    var req = request(method, url);
    req.ca(this._ca);
    req.key(this._key);
    req.cert(this._cert);
    req.on('response', this._saveCookies.bind(this));
    req.on('redirect', this._saveCookies.bind(this));
    req.on('redirect', this._attachCookies.bind(this, req));
    this._attachCookies(req);
    fn && req.end(fn);
    return req;
  };
});
