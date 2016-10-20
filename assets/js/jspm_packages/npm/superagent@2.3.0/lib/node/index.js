/* */ 
(function(Buffer) {
  var debug = require('debug')('superagent');
  var formidable = require('formidable');
  var FormData = require('form-data');
  var Response = require('./response');
  var parse = require('url').parse;
  var format = require('url').format;
  var resolve = require('url').resolve;
  var methods = require('methods');
  var Stream = require('stream');
  var utils = require('./utils');
  var extend = require('extend');
  var Part = require('./part');
  var mime = require('mime');
  var https = require('https');
  var http = require('http');
  var fs = require('fs');
  var qs = require('qs');
  var zlib = require('zlib');
  var util = require('util');
  var pkg = require('../../package.json!systemjs-json');
  var requestBase = require('../request-base');
  var isObject = require('../is-object');
  var request = exports = module.exports = require('../request').bind(null, Request);
  exports.agent = require('./agent');
  exports.Part = Part;
  function noop() {}
  ;
  exports.Response = Response;
  mime.define({'application/x-www-form-urlencoded': ['form', 'urlencoded', 'form-data']});
  exports.protocols = {
    'http:': http,
    'https:': https
  };
  exports.serialize = {
    'application/x-www-form-urlencoded': qs.stringify,
    'application/json': JSON.stringify
  };
  exports.parse = require('./parsers/index');
  function _initHeaders(req) {
    var ua = 'node-superagent/' + pkg.version;
    req._header = {'user-agent': ua};
    req.header = {'User-Agent': ua};
  }
  function Request(method, url) {
    Stream.call(this);
    var self = this;
    if ('string' != typeof url)
      url = format(url);
    this._agent = false;
    this._formData = null;
    this.method = method;
    this.url = url;
    _initHeaders(this);
    this.writable = true;
    this._redirects = 0;
    this.redirects(method === 'HEAD' ? 0 : 5);
    this.cookies = '';
    this.qs = {};
    this.qsRaw = [];
    this._redirectList = [];
    this._streamRequest = false;
    this.on('end', this.clearTimeout.bind(this));
  }
  util.inherits(Request, Stream);
  for (var key in requestBase) {
    Request.prototype[key] = requestBase[key];
  }
  Request.prototype.attach = function(field, file, filename) {
    if ('string' == typeof file) {
      if (!filename)
        filename = file;
      debug('creating `fs.ReadStream` instance for file: %s', file);
      file = fs.createReadStream(file);
    } else if (!filename && file.path) {
      filename = file.path;
    }
    this._getFormData().append(field, file, {filename: filename});
    return this;
  };
  Request.prototype._getFormData = function() {
    if (!this._formData) {
      this._formData = new FormData();
      this._formData.on('error', function(err) {
        this.emit('error', err);
        this.abort();
      }.bind(this));
    }
    return this._formData;
  };
  Request.prototype.part = util.deprecate(function() {
    return new Part(this);
  }, '`Request#part()` is deprecated. ' + 'Pass a readable stream in to `Request#attach()` instead.');
  Request.prototype.agent = function(agent) {
    if (!arguments.length)
      return this._agent;
    this._agent = agent;
    return this;
  };
  Request.prototype.type = function(type) {
    return this.set('Content-Type', ~type.indexOf('/') ? type : mime.lookup(type));
  };
  Request.prototype.accept = function(type) {
    return this.set('Accept', ~type.indexOf('/') ? type : mime.lookup(type));
  };
  Request.prototype.query = function(val) {
    if ('string' == typeof val) {
      this.qsRaw.push(val);
      return this;
    }
    extend(this.qs, val);
    return this;
  };
  Request.prototype.write = function(data, encoding) {
    var req = this.request();
    if (!this._streamRequest) {
      this._streamRequest = true;
      try {
        this._appendQueryString(req);
      } catch (e) {
        return this.emit('error', e);
      }
    }
    return req.write(data, encoding);
  };
  Request.prototype.pipe = function(stream, options) {
    this.piped = true;
    this.buffer(false);
    var self = this;
    this.end().req.on('response', function(res) {
      var redirect = isRedirect(res.statusCode);
      if (redirect && self._redirects++ != self._maxRedirects) {
        return self._redirect(res).pipe(stream, options);
      }
      self.res = res;
      self._emitResponse();
      if (self._aborted)
        return;
      if (self._shouldUnzip(res)) {
        res.pipe(zlib.createUnzip()).pipe(stream, options);
      } else {
        res.pipe(stream, options);
      }
      res.on('end', function() {
        self.emit('end');
      });
    });
    return stream;
  };
  Request.prototype.buffer = function(val) {
    this._buffer = (false !== val);
    return this;
  };
  Request.prototype._redirect = function(res) {
    var url = res.headers.location;
    if (!url) {
      return this.callback(new Error('No location header for redirect'), res);
    }
    debug('redirect %s -> %s', this.url, url);
    url = resolve(this.url, url);
    res.resume();
    var headers = this.req._headers;
    var shouldStripCookie = parse(url).host !== parse(this.url).host;
    if (res.statusCode == 301 || res.statusCode == 302) {
      headers = utils.cleanHeader(this.req._headers, shouldStripCookie);
      this.method = 'HEAD' == this.method ? 'HEAD' : 'GET';
      this._data = null;
    }
    if (res.statusCode == 303) {
      headers = utils.cleanHeader(this.req._headers, shouldStripCookie);
      this.method = 'GET';
      this._data = null;
    }
    delete headers.host;
    delete this.req;
    delete this._formData;
    _initHeaders(this);
    this.url = url;
    this.qs = {};
    this.qsRaw = [];
    this.set(headers);
    this.emit('redirect', res);
    this._redirectList.push(this.url);
    this.end(this._callback);
    return this;
  };
  Request.prototype.auth = function(user, pass) {
    if (1 === arguments.length)
      pass = '';
    if (!~user.indexOf(':'))
      user = user + ':';
    var str = new Buffer(user + pass).toString('base64');
    return this.set('Authorization', 'Basic ' + str);
  };
  Request.prototype.ca = function(cert) {
    this._ca = cert;
    return this;
  };
  Request.prototype.key = function(cert) {
    this._key = cert;
    return this;
  };
  Request.prototype.cert = function(cert) {
    this._cert = cert;
    return this;
  };
  Request.prototype.request = function() {
    if (this.req)
      return this.req;
    var self = this;
    var options = {};
    var data = this._data;
    var url = this.url;
    if (0 != url.indexOf('http'))
      url = 'http://' + url;
    url = parse(url);
    options.method = this.method;
    options.port = url.port;
    options.path = url.pathname;
    options.host = url.hostname;
    options.ca = this._ca;
    options.key = this._key;
    options.cert = this._cert;
    options.agent = this._agent;
    var mod = exports.protocols[url.protocol];
    var req = this.req = mod.request(options);
    if ('HEAD' != options.method)
      req.setHeader('Accept-Encoding', 'gzip, deflate');
    this.protocol = url.protocol;
    this.host = url.host;
    req.on('drain', function() {
      self.emit('drain');
    });
    req.on('error', function(err) {
      if (self._aborted)
        return;
      if (self.response)
        return;
      self.callback(err);
    });
    if (url.auth) {
      var auth = url.auth.split(':');
      this.auth(auth[0], auth[1]);
    }
    if (url.search)
      this.query(url.search.substr(1));
    if (this.cookies)
      req.setHeader('Cookie', this.cookies);
    for (var key in this.header) {
      req.setHeader(key, this.header[key]);
    }
    return req;
  };
  Request.prototype.callback = function(err, res) {
    var fn = this._callback || noop;
    this.clearTimeout();
    if (this.called)
      return console.warn('double callback!');
    this.called = true;
    if (err) {
      err.response = res;
    }
    if (err && this.listeners('error').length > 0)
      this.emit('error', err);
    if (err) {
      return fn(err, res);
    }
    if (res && res.status >= 200 && res.status < 300) {
      return fn(err, res);
    }
    var msg = 'Unsuccessful HTTP response';
    if (res) {
      msg = http.STATUS_CODES[res.status] || msg;
    }
    var new_err = new Error(msg);
    new_err.original = err;
    new_err.response = res;
    new_err.status = (res) ? res.status : undefined;
    fn(err || new_err, res);
  };
  Request.prototype._appendQueryString = function(req) {
    var querystring = qs.stringify(this.qs, {
      indices: false,
      strictNullHandling: true
    });
    querystring += ((querystring.length && this.qsRaw.length) ? '&' : '') + this.qsRaw.join('&');
    req.path += querystring.length ? (~req.path.indexOf('?') ? '&' : '?') + querystring : '';
  };
  Request.prototype._emitResponse = function(body, files) {
    var response = new Response(this);
    this.response = response;
    response.redirects = this._redirectList;
    if (undefined !== body) {
      response.body = body;
    }
    response.files = files;
    this.emit('response', response);
    return response;
  };
  Request.prototype.end = function(fn) {
    var self = this;
    var data = this._data;
    var req = this.request();
    var buffer = this._buffer;
    var method = this.method;
    var timeout = this._timeout;
    debug('%s %s', this.method, this.url);
    this._callback = fn || noop;
    try {
      this._appendQueryString(req);
    } catch (e) {
      return this.callback(e);
    }
    if (timeout && !this._timer) {
      debug('timeout %sms %s %s', timeout, this.method, this.url);
      this._timer = setTimeout(function() {
        var err = new Error('timeout of ' + timeout + 'ms exceeded');
        err.timeout = timeout;
        err.code = 'ECONNABORTED';
        self.timedout = true;
        self.abort();
        self.callback(err);
      }, timeout);
    }
    if ('HEAD' != method && !req._headerSent) {
      if ('string' != typeof data) {
        var contentType = req.getHeader('Content-Type');
        if (contentType)
          contentType = contentType.split(';')[0];
        var serialize = exports.serialize[contentType];
        if (!serialize && isJSON(contentType))
          serialize = exports.serialize['application/json'];
        if (serialize)
          data = serialize(data);
      }
      if (data && !req.getHeader('Content-Length')) {
        req.setHeader('Content-Length', Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data));
      }
    }
    req.on('response', function(res) {
      debug('%s %s -> %s', self.method, self.url, res.statusCode);
      if (self.piped) {
        return;
      }
      var max = self._maxRedirects;
      var mime = utils.type(res.headers['content-type'] || '') || 'text/plain';
      var type = mime.split('/')[0];
      var multipart = 'multipart' == type;
      var redirect = isRedirect(res.statusCode);
      var parser = self._parser;
      self.res = res;
      if (redirect && self._redirects++ != max) {
        return self._redirect(res);
      }
      if ('HEAD' == self.method) {
        self.emit('end');
        self.callback(null, self._emitResponse());
        return;
      }
      if (self._shouldUnzip(res)) {
        utils.unzip(req, res);
      }
      if (!parser) {
        if (multipart) {
          var form = new formidable.IncomingForm();
          parser = form.parse.bind(form);
          buffer = true;
        } else if (isImage(mime)) {
          parser = exports.parse.image;
          buffer = true;
        } else if ('text' == type) {
          parser = exports.parse.text;
          buffer = (buffer !== false);
        } else if (exports.parse[mime]) {
          parser = exports.parse[mime];
        } else if (isJSON(mime)) {
          parser = exports.parse['application/json'];
          buffer = (buffer !== false);
        } else if (buffer) {
          parser = exports.parse.text;
        }
      }
      if (undefined === buffer && isText(mime) || isJSON(mime))
        buffer = true;
      var parserHandlesEnd = false;
      if (parser) {
        try {
          parserHandlesEnd = buffer;
          parser(res, function(err, obj, files) {
            if (err && !self._aborted) {
              return self.callback(err);
            }
            res.body = obj;
            if (parserHandlesEnd) {
              self.emit('end');
              self.callback(null, self._emitResponse(obj, files));
            }
          });
        } catch (err) {
          self.callback(err);
          return;
        }
      }
      self.res = res;
      if (!buffer) {
        debug('unbuffered %s %s', self.method, self.url);
        self.callback(null, self._emitResponse());
        if (multipart)
          return;
        res.on('end', function() {
          debug('end %s %s', self.method, self.url);
          self.emit('end');
        });
        return;
      }
      res.on('error', function(err) {
        self.callback(err, null);
      });
      if (!parserHandlesEnd)
        res.on('end', function() {
          debug('end %s %s', self.method, self.url);
          self.emit('end');
          self.callback(null, self._emitResponse());
        });
    });
    this.emit('request', this);
    var formData = this._formData;
    if (formData) {
      var headers = formData.getHeaders();
      for (var i in headers) {
        debug('setting FormData header: "%s: %s"', i, headers[i]);
        req.setHeader(i, headers[i]);
      }
      formData.getLength(function(err, length) {
        debug('got FormData Content-Length: %s', length);
        if ('number' == typeof length) {
          req.setHeader('Content-Length', length);
        }
        var getProgressMonitor = function() {
          var lengthComputable = true;
          var total = req.getHeader('Content-Length');
          var loaded = 0;
          var progress = new Stream.Transform();
          progress._transform = function(chunk, encoding, cb) {
            loaded += chunk.length;
            self.emit('progress', {
              direction: 'upload',
              lengthComputable: lengthComputable,
              loaded: loaded,
              total: total
            });
            cb(null, chunk);
          };
          return progress;
        };
        formData.pipe(getProgressMonitor()).pipe(req);
      });
    } else {
      req.end(data);
    }
    return this;
  };
  Request.prototype._shouldUnzip = function(res) {
    if (res.statusCode === 204 || res.statusCode === 304) {
      return false;
    }
    if ('0' === res.headers['content-length']) {
      return false;
    }
    return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
  };
  exports.Request = Request;
  if (methods.indexOf('del') == -1) {
    methods = methods.slice(0);
    methods.push('del');
  }
  methods.forEach(function(method) {
    var name = method;
    method = 'del' == method ? 'delete' : method;
    method = method.toUpperCase();
    request[name] = function(url, data, fn) {
      var req = request(method, url);
      if ('function' == typeof data)
        fn = data, data = null;
      if (data)
        req.send(data);
      fn && req.end(fn);
      return req;
    };
  });
  function isText(mime) {
    var parts = mime.split('/');
    var type = parts[0];
    var subtype = parts[1];
    return 'text' == type || 'x-www-form-urlencoded' == subtype;
  }
  function isImage(mime) {
    var parts = mime.split('/');
    var type = parts[0];
    var subtype = parts[1];
    return 'image' == type;
  }
  function isJSON(mime) {
    return /[\/+]json\b/.test(mime);
  }
  function isRedirect(code) {
    return ~[301, 302, 303, 305, 307, 308].indexOf(code);
  }
})(require('buffer').Buffer);
