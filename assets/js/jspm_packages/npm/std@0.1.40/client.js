/* */ 
var Class = require('./Class');
var mobileRegex = /mobile/i;
var Client = Class(function() {
  this.init = function(userAgent) {
    this._userAgent = userAgent;
    this._parseBrowser();
    this._parseDevice();
  };
  this._parseBrowser = function() {
    (this.isChrome = this._isBrowser('Chrome')) || (this.isFirefox = this._isBrowser('Firefox')) || (this.isIE = this._isBrowser('MSIE')) || (this.isSkyfire = this._isBrowser('Skyfire', 'Skyfire')) || (this.isSafari = this._isBrowser('Safari', 'Version')) || (this.isOpera = this._isBrowser('Opera', 'Version'));
    if (this.isOpera) {
      if (this._userAgent.match('Opera Mini')) {
        this.isOperaMini = true;
      }
    }
    if (this.isIE) {
      this.isChromeFrame = !!this._userAgent.match('chromeframe');
    }
    try {
      document.createEvent("TouchEvent");
      this.isTouch = ('ontouchstart' in window);
    } catch (e) {
      this.isTouch = false;
    }
  };
  this._parseDevice = function() {
    ((this.isIPhone = this._is('iPhone')) || (this.isIPad = this._is('iPad')) || (this.isIPod = this._is('iPod')));
    this.isAndroid = this._isBrowser('Android', 'Version');
    this.isIOS = (this.isIPhone || this.isIPad || this.isIPod);
    if (this.isIOS) {
      var osVersionMatch = this._userAgent.match(/ OS ([\d_]+) /),
          osVersion = osVersionMatch ? osVersionMatch[1] : '',
          parts = osVersion.split('_'),
          version = {
            major: parseInt(parts[0]),
            minor: parseInt(parts[1]),
            patch: parseInt(parts[2])
          };
      this.os = {version: version};
    }
    if (this.isOpera && this._userAgent.match('Opera Mobi')) {
      this.isMobile = true;
    }
    if (this.isSkyfire) {
      this.isMobile = true;
    }
    if (this.isIPhone) {
      this.isMobile = true;
    }
    if (this.isAndroid) {
      if (this._userAgent.match(mobileRegex)) {
        this.isMobile = true;
      }
      if (this.isFirefox) {
        this.isMobile = true;
      }
    }
    this.isTablet = this.isIPad;
  };
  this.isQuirksMode = function(doc) {
    return this.isIE && (!doc.compatMode || doc.compatMode == 'BackCompat');
  };
  this._isBrowser = function(name, versionString) {
    if (!this._is(name)) {
      return false;
    }
    var agent = this._userAgent,
        index = agent.indexOf(versionString || name);
    this.version = parseFloat(agent.substr(index + (versionString || name).length + 1));
    this.name = name;
    return true;
  };
  this._is = function(name) {
    return (this._userAgent.indexOf(name) >= 0);
  };
});
if (typeof window != 'undefined') {
  module.exports = new Client(window.navigator.userAgent);
} else {
  module.exports = {};
}
module.exports.parse = function(userAgent) {
  return new Client(userAgent);
};
