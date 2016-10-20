/* */ 
"format cjs";
(function(Buffer) {
  (function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = f();
    } else if (typeof define === "function" && define.amd) {
      define([], f);
    } else {
      var g;
      if (typeof window !== "undefined") {
        g = window;
      } else if (typeof global !== "undefined") {
        g = global;
      } else if (typeof self !== "undefined") {
        g = self;
      } else {
        g = this;
      }
      g.superagent = f();
    }
  })(function() {
    var define,
        module,
        exports;
    return (function e(t, n, r) {
      function s(o, u) {
        if (!n[o]) {
          if (!t[o]) {
            var a = typeof require == "function" && require;
            if (!u && a)
              return a(o, !0);
            if (i)
              return i(o, !0);
            var f = new Error("Cannot find module '" + o + "'");
            throw f.code = "MODULE_NOT_FOUND", f;
          }
          var l = n[o] = {exports: {}};
          t[o][0].call(l.exports, function(e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
      }
      var i = typeof require == "function" && require;
      for (var o = 0; o < r.length; o++)
        s(r[o]);
      return s;
    })({
      1: [function(require, module, exports) {
        function isObject(obj) {
          return null !== obj && 'object' === typeof obj;
        }
        module.exports = isObject;
      }, {}],
      2: [function(require, module, exports) {
        var isObject = require('./is-object');
        exports.clearTimeout = function _clearTimeout() {
          this._timeout = 0;
          clearTimeout(this._timer);
          return this;
        };
        exports.parse = function parse(fn) {
          this._parser = fn;
          return this;
        };
        exports.serialize = function serialize(fn) {
          this._serializer = fn;
          return this;
        };
        exports.timeout = function timeout(ms) {
          this._timeout = ms;
          return this;
        };
        exports.then = function then(resolve, reject) {
          if (!this._fullfilledPromise) {
            var self = this;
            this._fullfilledPromise = new Promise(function(innerResolve, innerReject) {
              self.end(function(err, res) {
                if (err)
                  innerReject(err);
                else
                  innerResolve(res);
              });
            });
          }
          return this._fullfilledPromise.then(resolve, reject);
        };
        exports.catch = function(cb) {
          return this.then(undefined, cb);
        };
        exports.use = function use(fn) {
          fn(this);
          return this;
        };
        exports.get = function(field) {
          return this._header[field.toLowerCase()];
        };
        exports.getHeader = exports.get;
        exports.set = function(field, val) {
          if (isObject(field)) {
            for (var key in field) {
              this.set(key, field[key]);
            }
            return this;
          }
          this._header[field.toLowerCase()] = val;
          this.header[field] = val;
          return this;
        };
        exports.unset = function(field) {
          delete this._header[field.toLowerCase()];
          delete this.header[field];
          return this;
        };
        exports.field = function(name, val) {
          if (null === name || undefined === name) {
            throw new Error('.field(name, val) name can not be empty');
          }
          if (isObject(name)) {
            for (var key in name) {
              this.field(key, name[key]);
            }
            return this;
          }
          if (null === val || undefined === val) {
            throw new Error('.field(name, val) val can not be empty');
          }
          this._getFormData().append(name, val);
          return this;
        };
        exports.abort = function() {
          if (this._aborted) {
            return this;
          }
          this._aborted = true;
          this.xhr && this.xhr.abort();
          this.req && this.req.abort();
          this.clearTimeout();
          this.emit('abort');
          return this;
        };
        exports.withCredentials = function() {
          this._withCredentials = true;
          return this;
        };
        exports.redirects = function(n) {
          this._maxRedirects = n;
          return this;
        };
        exports.toJSON = function() {
          return {
            method: this.method,
            url: this.url,
            data: this._data,
            headers: this._header
          };
        };
        exports._isHost = function _isHost(obj) {
          var str = {}.toString.call(obj);
          switch (str) {
            case '[object File]':
            case '[object Blob]':
            case '[object FormData]':
              return true;
            default:
              return false;
          }
        };
        exports.send = function(data) {
          var obj = isObject(data);
          var type = this._header['content-type'];
          if (obj && isObject(this._data)) {
            for (var key in data) {
              this._data[key] = data[key];
            }
          } else if ('string' == typeof data) {
            if (!type)
              this.type('form');
            type = this._header['content-type'];
            if ('application/x-www-form-urlencoded' == type) {
              this._data = this._data ? this._data + '&' + data : data;
            } else {
              this._data = (this._data || '') + data;
            }
          } else {
            this._data = data;
          }
          if (!obj || this._isHost(data))
            return this;
          if (!type)
            this.type('json');
          return this;
        };
      }, {"./is-object": 1}],
      3: [function(require, module, exports) {
        function request(RequestConstructor, method, url) {
          if ('function' == typeof url) {
            return new RequestConstructor('GET', method).end(url);
          }
          if (2 == arguments.length) {
            return new RequestConstructor('GET', method);
          }
          return new RequestConstructor(method, url);
        }
        module.exports = request;
      }, {}],
      4: [function(require, module, exports) {
        if (typeof module !== 'undefined') {
          module.exports = Emitter;
        }
        function Emitter(obj) {
          if (obj)
            return mixin(obj);
        }
        ;
        function mixin(obj) {
          for (var key in Emitter.prototype) {
            obj[key] = Emitter.prototype[key];
          }
          return obj;
        }
        Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
          this._callbacks = this._callbacks || {};
          (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
          return this;
        };
        Emitter.prototype.once = function(event, fn) {
          function on() {
            this.off(event, on);
            fn.apply(this, arguments);
          }
          on.fn = fn;
          this.on(event, on);
          return this;
        };
        Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
          this._callbacks = this._callbacks || {};
          if (0 == arguments.length) {
            this._callbacks = {};
            return this;
          }
          var callbacks = this._callbacks['$' + event];
          if (!callbacks)
            return this;
          if (1 == arguments.length) {
            delete this._callbacks['$' + event];
            return this;
          }
          var cb;
          for (var i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === fn || cb.fn === fn) {
              callbacks.splice(i, 1);
              break;
            }
          }
          return this;
        };
        Emitter.prototype.emit = function(event) {
          this._callbacks = this._callbacks || {};
          var args = [].slice.call(arguments, 1),
              callbacks = this._callbacks['$' + event];
          if (callbacks) {
            callbacks = callbacks.slice(0);
            for (var i = 0,
                len = callbacks.length; i < len; ++i) {
              callbacks[i].apply(this, args);
            }
          }
          return this;
        };
        Emitter.prototype.listeners = function(event) {
          this._callbacks = this._callbacks || {};
          return this._callbacks['$' + event] || [];
        };
        Emitter.prototype.hasListeners = function(event) {
          return !!this.listeners(event).length;
        };
      }, {}],
      5: [function(require, module, exports) {
        var root;
        if (typeof window !== 'undefined') {
          root = window;
        } else if (typeof self !== 'undefined') {
          root = self;
        } else {
          console.warn("Using browser-only version of superagent in non-browser environment");
          root = this;
        }
        var Emitter = require('component-emitter');
        var requestBase = require('./request-base');
        var isObject = require('./is-object');
        function noop() {}
        ;
        var request = module.exports = require('./request').bind(null, Request);
        request.getXHR = function() {
          if (root.XMLHttpRequest && (!root.location || 'file:' != root.location.protocol || !root.ActiveXObject)) {
            return new XMLHttpRequest;
          } else {
            try {
              return new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e) {}
            try {
              return new ActiveXObject('Msxml2.XMLHTTP.6.0');
            } catch (e) {}
            try {
              return new ActiveXObject('Msxml2.XMLHTTP.3.0');
            } catch (e) {}
            try {
              return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {}
          }
          throw Error("Browser-only verison of superagent could not find XHR");
        };
        var trim = ''.trim ? function(s) {
          return s.trim();
        } : function(s) {
          return s.replace(/(^\s*|\s*$)/g, '');
        };
        function serialize(obj) {
          if (!isObject(obj))
            return obj;
          var pairs = [];
          for (var key in obj) {
            pushEncodedKeyValuePair(pairs, key, obj[key]);
          }
          return pairs.join('&');
        }
        function pushEncodedKeyValuePair(pairs, key, val) {
          if (val != null) {
            if (Array.isArray(val)) {
              val.forEach(function(v) {
                pushEncodedKeyValuePair(pairs, key, v);
              });
            } else if (isObject(val)) {
              for (var subkey in val) {
                pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
              }
            } else {
              pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
            }
          } else if (val === null) {
            pairs.push(encodeURIComponent(key));
          }
        }
        request.serializeObject = serialize;
        function parseString(str) {
          var obj = {};
          var pairs = str.split('&');
          var pair;
          var pos;
          for (var i = 0,
              len = pairs.length; i < len; ++i) {
            pair = pairs[i];
            pos = pair.indexOf('=');
            if (pos == -1) {
              obj[decodeURIComponent(pair)] = '';
            } else {
              obj[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
            }
          }
          return obj;
        }
        request.parseString = parseString;
        request.types = {
          html: 'text/html',
          json: 'application/json',
          xml: 'application/xml',
          urlencoded: 'application/x-www-form-urlencoded',
          'form': 'application/x-www-form-urlencoded',
          'form-data': 'application/x-www-form-urlencoded'
        };
        request.serialize = {
          'application/x-www-form-urlencoded': serialize,
          'application/json': JSON.stringify
        };
        request.parse = {
          'application/x-www-form-urlencoded': parseString,
          'application/json': JSON.parse
        };
        function parseHeader(str) {
          var lines = str.split(/\r?\n/);
          var fields = {};
          var index;
          var line;
          var field;
          var val;
          lines.pop();
          for (var i = 0,
              len = lines.length; i < len; ++i) {
            line = lines[i];
            index = line.indexOf(':');
            field = line.slice(0, index).toLowerCase();
            val = trim(line.slice(index + 1));
            fields[field] = val;
          }
          return fields;
        }
        function isJSON(mime) {
          return /[\/+]json\b/.test(mime);
        }
        function type(str) {
          return str.split(/ *; */).shift();
        }
        ;
        function params(str) {
          return str.split(/ *; */).reduce(function(obj, str) {
            var parts = str.split(/ *= */),
                key = parts.shift(),
                val = parts.shift();
            if (key && val)
              obj[key] = val;
            return obj;
          }, {});
        }
        ;
        function Response(req, options) {
          options = options || {};
          this.req = req;
          this.xhr = this.req.xhr;
          this.text = ((this.req.method != 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined') ? this.xhr.responseText : null;
          this.statusText = this.req.xhr.statusText;
          this._setStatusProperties(this.xhr.status);
          this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
          this.header['content-type'] = this.xhr.getResponseHeader('content-type');
          this._setHeaderProperties(this.header);
          this.body = this.req.method != 'HEAD' ? this._parseBody(this.text ? this.text : this.xhr.response) : null;
        }
        Response.prototype.get = function(field) {
          return this.header[field.toLowerCase()];
        };
        Response.prototype._setHeaderProperties = function(header) {
          var ct = this.header['content-type'] || '';
          this.type = type(ct);
          var obj = params(ct);
          for (var key in obj)
            this[key] = obj[key];
        };
        Response.prototype._parseBody = function(str) {
          var parse = request.parse[this.type];
          if (!parse && isJSON(this.type)) {
            parse = request.parse['application/json'];
          }
          return parse && str && (str.length || str instanceof Object) ? parse(str) : null;
        };
        Response.prototype._setStatusProperties = function(status) {
          if (status === 1223) {
            status = 204;
          }
          var type = status / 100 | 0;
          this.status = this.statusCode = status;
          this.statusType = type;
          this.info = 1 == type;
          this.ok = 2 == type;
          this.clientError = 4 == type;
          this.serverError = 5 == type;
          this.error = (4 == type || 5 == type) ? this.toError() : false;
          this.accepted = 202 == status;
          this.noContent = 204 == status;
          this.badRequest = 400 == status;
          this.unauthorized = 401 == status;
          this.notAcceptable = 406 == status;
          this.notFound = 404 == status;
          this.forbidden = 403 == status;
        };
        Response.prototype.toError = function() {
          var req = this.req;
          var method = req.method;
          var url = req.url;
          var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
          var err = new Error(msg);
          err.status = this.status;
          err.method = method;
          err.url = url;
          return err;
        };
        request.Response = Response;
        function Request(method, url) {
          var self = this;
          this._query = this._query || [];
          this.method = method;
          this.url = url;
          this.header = {};
          this._header = {};
          this.on('end', function() {
            var err = null;
            var res = null;
            try {
              res = new Response(self);
            } catch (e) {
              err = new Error('Parser is unable to parse the response');
              err.parse = true;
              err.original = e;
              err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
              err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
              return self.callback(err);
            }
            self.emit('response', res);
            var new_err;
            try {
              if (res.status < 200 || res.status >= 300) {
                new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
                new_err.original = err;
                new_err.response = res;
                new_err.status = res.status;
              }
            } catch (e) {
              new_err = e;
            }
            if (new_err) {
              self.callback(new_err, res);
            } else {
              self.callback(null, res);
            }
          });
        }
        Emitter(Request.prototype);
        for (var key in requestBase) {
          Request.prototype[key] = requestBase[key];
        }
        Request.prototype.type = function(type) {
          this.set('Content-Type', request.types[type] || type);
          return this;
        };
        Request.prototype.responseType = function(val) {
          this._responseType = val;
          return this;
        };
        Request.prototype.accept = function(type) {
          this.set('Accept', request.types[type] || type);
          return this;
        };
        Request.prototype.auth = function(user, pass, options) {
          if (!options) {
            options = {type: 'basic'};
          }
          switch (options.type) {
            case 'basic':
              var str = btoa(user + ':' + pass);
              this.set('Authorization', 'Basic ' + str);
              break;
            case 'auto':
              this.username = user;
              this.password = pass;
              break;
          }
          return this;
        };
        Request.prototype.query = function(val) {
          if ('string' != typeof val)
            val = serialize(val);
          if (val)
            this._query.push(val);
          return this;
        };
        Request.prototype.attach = function(field, file, filename) {
          this._getFormData().append(field, file, filename || file.name);
          return this;
        };
        Request.prototype._getFormData = function() {
          if (!this._formData) {
            this._formData = new root.FormData();
          }
          return this._formData;
        };
        Request.prototype.callback = function(err, res) {
          var fn = this._callback;
          this.clearTimeout();
          fn(err, res);
        };
        Request.prototype.crossDomainError = function() {
          var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
          err.crossDomain = true;
          err.status = this.status;
          err.method = this.method;
          err.url = this.url;
          this.callback(err);
        };
        Request.prototype._timeoutError = function() {
          var timeout = this._timeout;
          var err = new Error('timeout of ' + timeout + 'ms exceeded');
          err.timeout = timeout;
          this.callback(err);
        };
        Request.prototype._appendQueryString = function() {
          var query = this._query.join('&');
          if (query) {
            this.url += ~this.url.indexOf('?') ? '&' + query : '?' + query;
          }
        };
        Request.prototype.end = function(fn) {
          var self = this;
          var xhr = this.xhr = request.getXHR();
          var timeout = this._timeout;
          var data = this._formData || this._data;
          this._callback = fn || noop;
          xhr.onreadystatechange = function() {
            if (4 != xhr.readyState)
              return;
            var status;
            try {
              status = xhr.status;
            } catch (e) {
              status = 0;
            }
            if (0 == status) {
              if (self.timedout)
                return self._timeoutError();
              if (self._aborted)
                return;
              return self.crossDomainError();
            }
            self.emit('end');
          };
          var handleProgress = function(direction, e) {
            if (e.total > 0) {
              e.percent = e.loaded / e.total * 100;
            }
            e.direction = direction;
            self.emit('progress', e);
          };
          if (this.hasListeners('progress')) {
            try {
              xhr.onprogress = handleProgress.bind(null, 'download');
              if (xhr.upload) {
                xhr.upload.onprogress = handleProgress.bind(null, 'upload');
              }
            } catch (e) {}
          }
          if (timeout && !this._timer) {
            this._timer = setTimeout(function() {
              self.timedout = true;
              self.abort();
            }, timeout);
          }
          this._appendQueryString();
          if (this.username && this.password) {
            xhr.open(this.method, this.url, true, this.username, this.password);
          } else {
            xhr.open(this.method, this.url, true);
          }
          if (this._withCredentials)
            xhr.withCredentials = true;
          if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
            var contentType = this._header['content-type'];
            var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
            if (!serialize && isJSON(contentType))
              serialize = request.serialize['application/json'];
            if (serialize)
              data = serialize(data);
          }
          for (var field in this.header) {
            if (null == this.header[field])
              continue;
            xhr.setRequestHeader(field, this.header[field]);
          }
          if (this._responseType) {
            xhr.responseType = this._responseType;
          }
          this.emit('request', this);
          xhr.send(typeof data !== 'undefined' ? data : null);
          return this;
        };
        request.Request = Request;
        request.get = function(url, data, fn) {
          var req = request('GET', url);
          if ('function' == typeof data)
            fn = data, data = null;
          if (data)
            req.query(data);
          if (fn)
            req.end(fn);
          return req;
        };
        request.head = function(url, data, fn) {
          var req = request('HEAD', url);
          if ('function' == typeof data)
            fn = data, data = null;
          if (data)
            req.send(data);
          if (fn)
            req.end(fn);
          return req;
        };
        request.options = function(url, data, fn) {
          var req = request('OPTIONS', url);
          if ('function' == typeof data)
            fn = data, data = null;
          if (data)
            req.send(data);
          if (fn)
            req.end(fn);
          return req;
        };
        function del(url, fn) {
          var req = request('DELETE', url);
          if (fn)
            req.end(fn);
          return req;
        }
        ;
        request['del'] = del;
        request['delete'] = del;
        request.patch = function(url, data, fn) {
          var req = request('PATCH', url);
          if ('function' == typeof data)
            fn = data, data = null;
          if (data)
            req.send(data);
          if (fn)
            req.end(fn);
          return req;
        };
        request.post = function(url, data, fn) {
          var req = request('POST', url);
          if ('function' == typeof data)
            fn = data, data = null;
          if (data)
            req.send(data);
          if (fn)
            req.end(fn);
          return req;
        };
        request.put = function(url, data, fn) {
          var req = request('PUT', url);
          if ('function' == typeof data)
            fn = data, data = null;
          if (data)
            req.send(data);
          if (fn)
            req.end(fn);
          return req;
        };
      }, {
        "./is-object": 1,
        "./request": 3,
        "./request-base": 2,
        "emitter": 4
      }]
    }, {}, [5])(5);
  });
})(require('buffer').Buffer);
