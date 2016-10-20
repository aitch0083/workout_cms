/* */ 
(function(process) {
  var fs = require('fs');
  var path = require('path');
  var extend = require('std/extend');
  var each = require('std/each');
  var getCode = require('./lib/getCode');
  var resolve = require('./lib/resolve');
  var getRequireStatements = require('./lib/getRequireStatements');
  module.exports = {
    compile: compileFile,
    compileHTML: compileHTMLFile,
    compileCode: compileCode
  };
  function compileFile(filePath, opts) {
    filePath = path.resolve(filePath);
    opts = extend(opts, {
      basePath: path.dirname(filePath),
      toplevel: true
    });
    var code = getCode(filePath);
    return _compile(code, opts, filePath);
  }
  function compileCode(code, opts) {
    opts = extend(opts, {
      basePath: process.cwd(),
      toplevel: true
    });
    return _compile(code, opts, '<code passed into compiler.compile()>');
  }
  function compileHTMLFile(filePath, opts) {
    var html = fs.readFileSync(filePath).toString();
    while (match = html.match(/<script src="\/require\/([\/\w\.]+)"><\/script>/)) {
      var js = compileFile(match[1].toString(), opts);
      var BACKREFERENCE_WORKAROUND = '____________backreference_workaround________';
      js = js.replace('\$\&', BACKREFERENCE_WORKAROUND);
      html = html.replace(match[0], '<script>' + js + '</script>');
      html = html.replace(BACKREFERENCE_WORKAROUND, '\$\&');
    }
    return html;
  }
  var _compile = function(code, opts, mainModule) {
    var code = 'var __require__ = {}, require=function(){}\n' + _compileModule(code, opts.basePath, mainModule);
    if (opts.minify === false) {
      return code;
    }
    var UglifyJS = require('uglify-js');
    var result = UglifyJS.minify(code, {
      fromString: true,
      mangle: true,
      output: {
        indent_start: 0,
        indent_level: 4,
        quote_keys: false,
        space_colon: true,
        ascii_only: false,
        inline_script: false,
        width: 80,
        max_line_len: 200,
        ie_proof: true,
        beautify: false,
        source_map: null,
        bracketize: false,
        comments: false,
        semicolons: true
      },
      compress: {
        sequences: true,
        properties: true,
        dead_code: true,
        drop_debugger: true,
        unsafe: false,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        hoist_vars: false,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        warnings: false,
        global_defs: {}
      }
    });
    return result.code;
  };
  var _compileModule = function(code, pathBase, mainModule) {
    var modules = [mainModule];
    _replaceRequireStatements(mainModule, code, modules, pathBase);
    code = _concatModules(modules);
    code = _minifyRequireStatements(code, modules);
    return code;
  };
  var _minifyRequireStatements = function(code, modules) {
    each(modules, function(modulePath, i) {
      var escapedPath = modulePath.replace(/\//g, '\\/').replace('(', '\\(').replace(')', '\\)');
      var regex = new RegExp('__require__\\["' + escapedPath + '"\\]', 'g');
      code = code.replace(regex, '__require__["_' + i + '"]');
    });
    return code;
  };
  var _replaceRequireStatements = function(modulePath, code, modules, pathBase) {
    var requireStatements = getRequireStatements(code);
    if (!requireStatements.length) {
      modules[modulePath] = code;
      return;
    }
    each(requireStatements, function(requireStatement) {
      var subModulePath = resolve.requireStatement(requireStatement, modulePath);
      if (!subModulePath) {
        throw new Error("Require Compiler Error: Cannot find module '" + rawModulePath + "' (in '" + modulePath + "')");
      }
      code = code.replace(requireStatement, '__require__["' + subModulePath + '"].exports');
      if (!modules[subModulePath]) {
        modules[subModulePath] = true;
        var newPathBase = path.dirname(subModulePath);
        var newModuleCode = getCode(subModulePath);
        _replaceRequireStatements(subModulePath, newModuleCode, modules, newPathBase);
        modules.push(subModulePath);
      }
    });
    modules[modulePath] = code;
  };
  var _concatModules = function(modules) {
    var getClosuredModule = function(modulePath) {
      return [';(function() {', '	// ' + modulePath, '	var module = __require__["' + modulePath + '"] = {exports:{}}, exports = module.exports;', modules[modulePath], '})()'].join('\n');
    };
    var moduleDefinitions = [];
    for (var i = 1,
        modulePath; modulePath = modules[i]; i++) {
      moduleDefinitions.push(getClosuredModule(modulePath));
    }
    moduleDefinitions.push(getClosuredModule(modules[0]));
    return moduleDefinitions.join('\n\n');
  };
})(require('process'));
