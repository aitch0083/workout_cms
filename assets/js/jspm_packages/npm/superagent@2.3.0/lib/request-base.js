/* */ 
(function(Buffer) {
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
})(require('buffer').Buffer);
