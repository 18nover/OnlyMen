var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/utils.js
var require_utils = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/utils.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.extend = extend;
    exports.indexOf = indexOf;
    exports.escapeExpression = escapeExpression;
    exports.isEmpty = isEmpty;
    exports.createFrame = createFrame;
    exports.blockParams = blockParams;
    exports.appendContextPath = appendContextPath;
    var escape = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "`": "&#x60;",
      "=": "&#x3D;"
    };
    var badChars = /[&<>"'`=]/g;
    var possible = /[&<>"'`=]/;
    function escapeChar(chr) {
      return escape[chr];
    }
    function extend(obj) {
      for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
          if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
            obj[key] = arguments[i][key];
          }
        }
      }
      return obj;
    }
    var toString = Object.prototype.toString;
    exports.toString = toString;
    var isFunction = function isFunction2(value) {
      return typeof value === "function";
    };
    if (isFunction(/x/)) {
      exports.isFunction = isFunction = function(value) {
        return typeof value === "function" && toString.call(value) === "[object Function]";
      };
    }
    exports.isFunction = isFunction;
    var isArray = Array.isArray || function(value) {
      return value && typeof value === "object" ? toString.call(value) === "[object Array]" : false;
    };
    exports.isArray = isArray;
    function indexOf(array, value) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (array[i] === value) {
          return i;
        }
      }
      return -1;
    }
    function escapeExpression(string) {
      if (typeof string !== "string") {
        if (string && string.toHTML) {
          return string.toHTML();
        } else if (string == null) {
          return "";
        } else if (!string) {
          return string + "";
        }
        string = "" + string;
      }
      if (!possible.test(string)) {
        return string;
      }
      return string.replace(badChars, escapeChar);
    }
    function isEmpty(value) {
      if (!value && value !== 0) {
        return true;
      } else if (isArray(value) && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
    function createFrame(object) {
      var frame = extend({}, object);
      frame._parent = object;
      return frame;
    }
    function blockParams(params, ids) {
      params.path = ids;
      return params;
    }
    function appendContextPath(contextPath, id) {
      return (contextPath ? contextPath + "." : "") + id;
    }
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/exception.js
var require_exception = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/exception.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    var errorProps = ["description", "fileName", "lineNumber", "endLineNumber", "message", "name", "number", "stack"];
    function Exception(message, node) {
      var loc = node && node.loc, line = void 0, endLineNumber = void 0, column = void 0, endColumn = void 0;
      if (loc) {
        line = loc.start.line;
        endLineNumber = loc.end.line;
        column = loc.start.column;
        endColumn = loc.end.column;
        message += " - " + line + ":" + column;
      }
      var tmp = Error.prototype.constructor.call(this, message);
      for (var idx = 0; idx < errorProps.length; idx++) {
        this[errorProps[idx]] = tmp[errorProps[idx]];
      }
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, Exception);
      }
      try {
        if (loc) {
          this.lineNumber = line;
          this.endLineNumber = endLineNumber;
          if (Object.defineProperty) {
            Object.defineProperty(this, "column", {
              value: column,
              enumerable: true
            });
            Object.defineProperty(this, "endColumn", {
              value: endColumn,
              enumerable: true
            });
          } else {
            this.column = column;
            this.endColumn = endColumn;
          }
        }
      } catch (nop) {
      }
    }
    Exception.prototype = new Error();
    exports["default"] = Exception;
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/block-helper-missing.js
var require_block_helper_missing = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/block-helper-missing.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    var _utils = require_utils();
    exports["default"] = function(instance) {
      instance.registerHelper("blockHelperMissing", function(context, options) {
        var inverse = options.inverse, fn = options.fn;
        if (context === true) {
          return fn(this);
        } else if (context === false || context == null) {
          return inverse(this);
        } else if (_utils.isArray(context)) {
          if (context.length > 0) {
            if (options.ids) {
              options.ids = [options.name];
            }
            return instance.helpers.each(context, options);
          } else {
            return inverse(this);
          }
        } else {
          if (options.data && options.ids) {
            var data = _utils.createFrame(options.data);
            data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
            options = { data };
          }
          return fn(context, options);
        }
      });
    };
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/each.js
var require_each = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/each.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _utils = require_utils();
    var _exception = require_exception();
    var _exception2 = _interopRequireDefault(_exception);
    exports["default"] = function(instance) {
      instance.registerHelper("each", function(context, options) {
        if (!options) {
          throw new _exception2["default"]("Must pass iterator to #each");
        }
        var fn = options.fn, inverse = options.inverse, i = 0, ret = "", data = void 0, contextPath = void 0;
        if (options.data && options.ids) {
          contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + ".";
        }
        if (_utils.isFunction(context)) {
          context = context.call(this);
        }
        if (options.data) {
          data = _utils.createFrame(options.data);
        }
        function execIteration(field, index, last) {
          if (data) {
            data.key = field;
            data.index = index;
            data.first = index === 0;
            data.last = !!last;
            if (contextPath) {
              data.contextPath = contextPath + field;
            }
          }
          ret = ret + fn(context[field], {
            data,
            blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
          });
        }
        if (context && typeof context === "object") {
          if (_utils.isArray(context)) {
            for (var j = context.length; i < j; i++) {
              if (i in context) {
                execIteration(i, i, i === context.length - 1);
              }
            }
          } else if (global.Symbol && context[global.Symbol.iterator]) {
            var newContext = [];
            var iterator = context[global.Symbol.iterator]();
            for (var it = iterator.next(); !it.done; it = iterator.next()) {
              newContext.push(it.value);
            }
            context = newContext;
            for (var j = context.length; i < j; i++) {
              execIteration(i, i, i === context.length - 1);
            }
          } else {
            (function() {
              var priorKey = void 0;
              Object.keys(context).forEach(function(key) {
                if (priorKey !== void 0) {
                  execIteration(priorKey, i - 1);
                }
                priorKey = key;
                i++;
              });
              if (priorKey !== void 0) {
                execIteration(priorKey, i - 1, true);
              }
            })();
          }
        }
        if (i === 0) {
          ret = inverse(this);
        }
        return ret;
      });
    };
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/helper-missing.js
var require_helper_missing = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/helper-missing.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _exception = require_exception();
    var _exception2 = _interopRequireDefault(_exception);
    exports["default"] = function(instance) {
      instance.registerHelper("helperMissing", function() {
        if (arguments.length === 1) {
          return void 0;
        } else {
          throw new _exception2["default"]('Missing helper: "' + arguments[arguments.length - 1].name + '"');
        }
      });
    };
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/if.js
var require_if = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/if.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _utils = require_utils();
    var _exception = require_exception();
    var _exception2 = _interopRequireDefault(_exception);
    exports["default"] = function(instance) {
      instance.registerHelper("if", function(conditional, options) {
        if (arguments.length != 2) {
          throw new _exception2["default"]("#if requires exactly one argument");
        }
        if (_utils.isFunction(conditional)) {
          conditional = conditional.call(this);
        }
        if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      });
      instance.registerHelper("unless", function(conditional, options) {
        if (arguments.length != 2) {
          throw new _exception2["default"]("#unless requires exactly one argument");
        }
        return instance.helpers["if"].call(this, conditional, {
          fn: options.inverse,
          inverse: options.fn,
          hash: options.hash
        });
      });
    };
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/log.js
var require_log = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/log.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    exports["default"] = function(instance) {
      instance.registerHelper("log", function() {
        var args = [void 0], options = arguments[arguments.length - 1];
        for (var i = 0; i < arguments.length - 1; i++) {
          args.push(arguments[i]);
        }
        var level = 1;
        if (options.hash.level != null) {
          level = options.hash.level;
        } else if (options.data && options.data.level != null) {
          level = options.data.level;
        }
        args[0] = level;
        instance.log.apply(instance, args);
      });
    };
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/lookup.js
var require_lookup = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/lookup.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    exports["default"] = function(instance) {
      instance.registerHelper("lookup", function(obj, field, options) {
        if (!obj) {
          return obj;
        }
        return options.lookupProperty(obj, field);
      });
    };
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/with.js
var require_with = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers/with.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _utils = require_utils();
    var _exception = require_exception();
    var _exception2 = _interopRequireDefault(_exception);
    exports["default"] = function(instance) {
      instance.registerHelper("with", function(context, options) {
        if (arguments.length != 2) {
          throw new _exception2["default"]("#with requires exactly one argument");
        }
        if (_utils.isFunction(context)) {
          context = context.call(this);
        }
        var fn = options.fn;
        if (!_utils.isEmpty(context)) {
          var data = options.data;
          if (options.data && options.ids) {
            data = _utils.createFrame(options.data);
            data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
          }
          return fn(context, {
            data,
            blockParams: _utils.blockParams([context], [data && data.contextPath])
          });
        } else {
          return options.inverse(this);
        }
      });
    };
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers.js
var require_helpers = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/helpers.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.registerDefaultHelpers = registerDefaultHelpers;
    exports.moveHelperToHooks = moveHelperToHooks;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _helpersBlockHelperMissing = require_block_helper_missing();
    var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);
    var _helpersEach = require_each();
    var _helpersEach2 = _interopRequireDefault(_helpersEach);
    var _helpersHelperMissing = require_helper_missing();
    var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);
    var _helpersIf = require_if();
    var _helpersIf2 = _interopRequireDefault(_helpersIf);
    var _helpersLog = require_log();
    var _helpersLog2 = _interopRequireDefault(_helpersLog);
    var _helpersLookup = require_lookup();
    var _helpersLookup2 = _interopRequireDefault(_helpersLookup);
    var _helpersWith = require_with();
    var _helpersWith2 = _interopRequireDefault(_helpersWith);
    function registerDefaultHelpers(instance) {
      _helpersBlockHelperMissing2["default"](instance);
      _helpersEach2["default"](instance);
      _helpersHelperMissing2["default"](instance);
      _helpersIf2["default"](instance);
      _helpersLog2["default"](instance);
      _helpersLookup2["default"](instance);
      _helpersWith2["default"](instance);
    }
    function moveHelperToHooks(instance, helperName, keepHelper) {
      if (instance.helpers[helperName]) {
        instance.hooks[helperName] = instance.helpers[helperName];
        if (!keepHelper) {
          delete instance.helpers[helperName];
        }
      }
    }
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/decorators/inline.js
var require_inline = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/decorators/inline.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    var _utils = require_utils();
    exports["default"] = function(instance) {
      instance.registerDecorator("inline", function(fn, props, container, options) {
        var ret = fn;
        if (!props.partials) {
          props.partials = {};
          ret = function(context, options2) {
            var original = container.partials;
            container.partials = _utils.extend({}, original, props.partials);
            var ret2 = fn(context, options2);
            container.partials = original;
            return ret2;
          };
        }
        props.partials[options.args[0]] = options.fn;
        return ret;
      });
    };
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/decorators.js
var require_decorators = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/decorators.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.registerDefaultDecorators = registerDefaultDecorators;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _decoratorsInline = require_inline();
    var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);
    function registerDefaultDecorators(instance) {
      _decoratorsInline2["default"](instance);
    }
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/logger.js
var require_logger = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/logger.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    var _utils = require_utils();
    var logger = {
      methodMap: ["debug", "info", "warn", "error"],
      level: "info",
      lookupLevel: function lookupLevel(level) {
        if (typeof level === "string") {
          var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
          if (levelMap >= 0) {
            level = levelMap;
          } else {
            level = parseInt(level, 10);
          }
        }
        return level;
      },
      log: function log(level) {
        level = logger.lookupLevel(level);
        if (typeof console !== "undefined" && logger.lookupLevel(logger.level) <= level) {
          var method = logger.methodMap[level];
          if (!console[method]) {
            method = "log";
          }
          for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            message[_key - 1] = arguments[_key];
          }
          console[method].apply(console, message);
        }
      }
    };
    exports["default"] = logger;
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/internal/create-new-lookup-object.js
var require_create_new_lookup_object = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/internal/create-new-lookup-object.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.createNewLookupObject = createNewLookupObject;
    var _utils = require_utils();
    function createNewLookupObject() {
      for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
        sources[_key] = arguments[_key];
      }
      return _utils.extend.apply(void 0, [/* @__PURE__ */ Object.create(null)].concat(sources));
    }
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/internal/proto-access.js
var require_proto_access = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/internal/proto-access.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.createProtoAccessControl = createProtoAccessControl;
    exports.resultIsAllowed = resultIsAllowed;
    exports.resetLoggedProperties = resetLoggedProperties;
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj["default"] = obj;
        return newObj;
      }
    }
    var _createNewLookupObject = require_create_new_lookup_object();
    var _logger = require_logger();
    var logger = _interopRequireWildcard(_logger);
    var loggedProperties = /* @__PURE__ */ Object.create(null);
    function createProtoAccessControl(runtimeOptions) {
      var defaultMethodWhiteList = /* @__PURE__ */ Object.create(null);
      defaultMethodWhiteList["constructor"] = false;
      defaultMethodWhiteList["__defineGetter__"] = false;
      defaultMethodWhiteList["__defineSetter__"] = false;
      defaultMethodWhiteList["__lookupGetter__"] = false;
      var defaultPropertyWhiteList = /* @__PURE__ */ Object.create(null);
      defaultPropertyWhiteList["__proto__"] = false;
      return {
        properties: {
          whitelist: _createNewLookupObject.createNewLookupObject(defaultPropertyWhiteList, runtimeOptions.allowedProtoProperties),
          defaultValue: runtimeOptions.allowProtoPropertiesByDefault
        },
        methods: {
          whitelist: _createNewLookupObject.createNewLookupObject(defaultMethodWhiteList, runtimeOptions.allowedProtoMethods),
          defaultValue: runtimeOptions.allowProtoMethodsByDefault
        }
      };
    }
    function resultIsAllowed(result, protoAccessControl, propertyName) {
      if (typeof result === "function") {
        return checkWhiteList(protoAccessControl.methods, propertyName);
      } else {
        return checkWhiteList(protoAccessControl.properties, propertyName);
      }
    }
    function checkWhiteList(protoAccessControlForType, propertyName) {
      if (protoAccessControlForType.whitelist[propertyName] !== void 0) {
        return protoAccessControlForType.whitelist[propertyName] === true;
      }
      if (protoAccessControlForType.defaultValue !== void 0) {
        return protoAccessControlForType.defaultValue;
      }
      logUnexpecedPropertyAccessOnce(propertyName);
      return false;
    }
    function logUnexpecedPropertyAccessOnce(propertyName) {
      if (loggedProperties[propertyName] !== true) {
        loggedProperties[propertyName] = true;
        logger.log("error", 'Handlebars: Access has been denied to resolve the property "' + propertyName + '" because it is not an "own property" of its parent.\nYou can add a runtime option to disable the check or this warning:\nSee https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details');
      }
    }
    function resetLoggedProperties() {
      Object.keys(loggedProperties).forEach(function(propertyName) {
        delete loggedProperties[propertyName];
      });
    }
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/base.js
var require_base = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/base.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.HandlebarsEnvironment = HandlebarsEnvironment;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _utils = require_utils();
    var _exception = require_exception();
    var _exception2 = _interopRequireDefault(_exception);
    var _helpers = require_helpers();
    var _decorators = require_decorators();
    var _logger = require_logger();
    var _logger2 = _interopRequireDefault(_logger);
    var _internalProtoAccess = require_proto_access();
    var VERSION = "4.7.7";
    exports.VERSION = VERSION;
    var COMPILER_REVISION = 8;
    exports.COMPILER_REVISION = COMPILER_REVISION;
    var LAST_COMPATIBLE_COMPILER_REVISION = 7;
    exports.LAST_COMPATIBLE_COMPILER_REVISION = LAST_COMPATIBLE_COMPILER_REVISION;
    var REVISION_CHANGES = {
      1: "<= 1.0.rc.2",
      2: "== 1.0.0-rc.3",
      3: "== 1.0.0-rc.4",
      4: "== 1.x.x",
      5: "== 2.0.0-alpha.x",
      6: ">= 2.0.0-beta.1",
      7: ">= 4.0.0 <4.3.0",
      8: ">= 4.3.0"
    };
    exports.REVISION_CHANGES = REVISION_CHANGES;
    var objectType = "[object Object]";
    function HandlebarsEnvironment(helpers, partials, decorators) {
      this.helpers = helpers || {};
      this.partials = partials || {};
      this.decorators = decorators || {};
      _helpers.registerDefaultHelpers(this);
      _decorators.registerDefaultDecorators(this);
    }
    HandlebarsEnvironment.prototype = {
      constructor: HandlebarsEnvironment,
      logger: _logger2["default"],
      log: _logger2["default"].log,
      registerHelper: function registerHelper2(name, fn) {
        if (_utils.toString.call(name) === objectType) {
          if (fn) {
            throw new _exception2["default"]("Arg not supported with multiple helpers");
          }
          _utils.extend(this.helpers, name);
        } else {
          this.helpers[name] = fn;
        }
      },
      unregisterHelper: function unregisterHelper(name) {
        delete this.helpers[name];
      },
      registerPartial: function registerPartial2(name, partial) {
        if (_utils.toString.call(name) === objectType) {
          _utils.extend(this.partials, name);
        } else {
          if (typeof partial === "undefined") {
            throw new _exception2["default"]('Attempting to register a partial called "' + name + '" as undefined');
          }
          this.partials[name] = partial;
        }
      },
      unregisterPartial: function unregisterPartial(name) {
        delete this.partials[name];
      },
      registerDecorator: function registerDecorator(name, fn) {
        if (_utils.toString.call(name) === objectType) {
          if (fn) {
            throw new _exception2["default"]("Arg not supported with multiple decorators");
          }
          _utils.extend(this.decorators, name);
        } else {
          this.decorators[name] = fn;
        }
      },
      unregisterDecorator: function unregisterDecorator(name) {
        delete this.decorators[name];
      },
      resetLoggedPropertyAccesses: function resetLoggedPropertyAccesses() {
        _internalProtoAccess.resetLoggedProperties();
      }
    };
    var log = _logger2["default"].log;
    exports.log = log;
    exports.createFrame = _utils.createFrame;
    exports.logger = _logger2["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/safe-string.js
var require_safe_string = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/safe-string.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    function SafeString(string) {
      this.string = string;
    }
    SafeString.prototype.toString = SafeString.prototype.toHTML = function() {
      return "" + this.string;
    };
    exports["default"] = SafeString;
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/internal/wrapHelper.js
var require_wrapHelper = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/internal/wrapHelper.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.wrapHelper = wrapHelper;
    function wrapHelper(helper, transformOptionsFn) {
      if (typeof helper !== "function") {
        return helper;
      }
      var wrapper = function wrapper2() {
        var options = arguments[arguments.length - 1];
        arguments[arguments.length - 1] = transformOptionsFn(options);
        return helper.apply(this, arguments);
      };
      return wrapper;
    }
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/runtime.js
var require_runtime = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/runtime.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.checkRevision = checkRevision;
    exports.template = template2;
    exports.wrapProgram = wrapProgram;
    exports.resolvePartial = resolvePartial;
    exports.invokePartial = invokePartial;
    exports.noop = noop;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj["default"] = obj;
        return newObj;
      }
    }
    var _utils = require_utils();
    var Utils = _interopRequireWildcard(_utils);
    var _exception = require_exception();
    var _exception2 = _interopRequireDefault(_exception);
    var _base = require_base();
    var _helpers = require_helpers();
    var _internalWrapHelper = require_wrapHelper();
    var _internalProtoAccess = require_proto_access();
    function checkRevision(compilerInfo) {
      var compilerRevision = compilerInfo && compilerInfo[0] || 1, currentRevision = _base.COMPILER_REVISION;
      if (compilerRevision >= _base.LAST_COMPATIBLE_COMPILER_REVISION && compilerRevision <= _base.COMPILER_REVISION) {
        return;
      }
      if (compilerRevision < _base.LAST_COMPATIBLE_COMPILER_REVISION) {
        var runtimeVersions = _base.REVISION_CHANGES[currentRevision], compilerVersions = _base.REVISION_CHANGES[compilerRevision];
        throw new _exception2["default"]("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").");
      } else {
        throw new _exception2["default"]("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + compilerInfo[1] + ").");
      }
    }
    function template2(templateSpec, env) {
      if (!env) {
        throw new _exception2["default"]("No environment passed to template");
      }
      if (!templateSpec || !templateSpec.main) {
        throw new _exception2["default"]("Unknown template object: " + typeof templateSpec);
      }
      templateSpec.main.decorator = templateSpec.main_d;
      env.VM.checkRevision(templateSpec.compiler);
      var templateWasPrecompiledWithCompilerV7 = templateSpec.compiler && templateSpec.compiler[0] === 7;
      function invokePartialWrapper(partial, context, options) {
        if (options.hash) {
          context = Utils.extend({}, context, options.hash);
          if (options.ids) {
            options.ids[0] = true;
          }
        }
        partial = env.VM.resolvePartial.call(this, partial, context, options);
        var extendedOptions = Utils.extend({}, options, {
          hooks: this.hooks,
          protoAccessControl: this.protoAccessControl
        });
        var result = env.VM.invokePartial.call(this, partial, context, extendedOptions);
        if (result == null && env.compile) {
          options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
          result = options.partials[options.name](context, extendedOptions);
        }
        if (result != null) {
          if (options.indent) {
            var lines = result.split("\n");
            for (var i = 0, l = lines.length; i < l; i++) {
              if (!lines[i] && i + 1 === l) {
                break;
              }
              lines[i] = options.indent + lines[i];
            }
            result = lines.join("\n");
          }
          return result;
        } else {
          throw new _exception2["default"]("The partial " + options.name + " could not be compiled when running in runtime-only mode");
        }
      }
      var container = {
        strict: function strict(obj, name, loc) {
          if (!obj || !(name in obj)) {
            throw new _exception2["default"]('"' + name + '" not defined in ' + obj, {
              loc
            });
          }
          return container.lookupProperty(obj, name);
        },
        lookupProperty: function lookupProperty(parent, propertyName) {
          var result = parent[propertyName];
          if (result == null) {
            return result;
          }
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return result;
          }
          if (_internalProtoAccess.resultIsAllowed(result, container.protoAccessControl, propertyName)) {
            return result;
          }
          return void 0;
        },
        lookup: function lookup(depths, name) {
          var len = depths.length;
          for (var i = 0; i < len; i++) {
            var result = depths[i] && container.lookupProperty(depths[i], name);
            if (result != null) {
              return depths[i][name];
            }
          }
        },
        lambda: function lambda(current, context) {
          return typeof current === "function" ? current.call(context) : current;
        },
        escapeExpression: Utils.escapeExpression,
        invokePartial: invokePartialWrapper,
        fn: function fn(i) {
          var ret2 = templateSpec[i];
          ret2.decorator = templateSpec[i + "_d"];
          return ret2;
        },
        programs: [],
        program: function program(i, data, declaredBlockParams, blockParams, depths) {
          var programWrapper = this.programs[i], fn = this.fn(i);
          if (data || depths || blockParams || declaredBlockParams) {
            programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
          } else if (!programWrapper) {
            programWrapper = this.programs[i] = wrapProgram(this, i, fn);
          }
          return programWrapper;
        },
        data: function data(value, depth) {
          while (value && depth--) {
            value = value._parent;
          }
          return value;
        },
        mergeIfNeeded: function mergeIfNeeded(param, common) {
          var obj = param || common;
          if (param && common && param !== common) {
            obj = Utils.extend({}, common, param);
          }
          return obj;
        },
        nullContext: Object.seal({}),
        noop: env.VM.noop,
        compilerInfo: templateSpec.compiler
      };
      function ret(context) {
        var options = arguments.length <= 1 || arguments[1] === void 0 ? {} : arguments[1];
        var data = options.data;
        ret._setup(options);
        if (!options.partial && templateSpec.useData) {
          data = initData(context, data);
        }
        var depths = void 0, blockParams = templateSpec.useBlockParams ? [] : void 0;
        if (templateSpec.useDepths) {
          if (options.depths) {
            depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
          } else {
            depths = [context];
          }
        }
        function main(context2) {
          return "" + templateSpec.main(container, context2, container.helpers, container.partials, data, blockParams, depths);
        }
        main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
        return main(context, options);
      }
      ret.isTop = true;
      ret._setup = function(options) {
        if (!options.partial) {
          var mergedHelpers = Utils.extend({}, env.helpers, options.helpers);
          wrapHelpersToPassLookupProperty(mergedHelpers, container);
          container.helpers = mergedHelpers;
          if (templateSpec.usePartial) {
            container.partials = container.mergeIfNeeded(options.partials, env.partials);
          }
          if (templateSpec.usePartial || templateSpec.useDecorators) {
            container.decorators = Utils.extend({}, env.decorators, options.decorators);
          }
          container.hooks = {};
          container.protoAccessControl = _internalProtoAccess.createProtoAccessControl(options);
          var keepHelperInHelpers = options.allowCallsToHelperMissing || templateWasPrecompiledWithCompilerV7;
          _helpers.moveHelperToHooks(container, "helperMissing", keepHelperInHelpers);
          _helpers.moveHelperToHooks(container, "blockHelperMissing", keepHelperInHelpers);
        } else {
          container.protoAccessControl = options.protoAccessControl;
          container.helpers = options.helpers;
          container.partials = options.partials;
          container.decorators = options.decorators;
          container.hooks = options.hooks;
        }
      };
      ret._child = function(i, data, blockParams, depths) {
        if (templateSpec.useBlockParams && !blockParams) {
          throw new _exception2["default"]("must pass block params");
        }
        if (templateSpec.useDepths && !depths) {
          throw new _exception2["default"]("must pass parent depths");
        }
        return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
      };
      return ret;
    }
    function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
      function prog(context) {
        var options = arguments.length <= 1 || arguments[1] === void 0 ? {} : arguments[1];
        var currentDepths = depths;
        if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
          currentDepths = [context].concat(depths);
        }
        return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
      }
      prog = executeDecorators(fn, prog, container, depths, data, blockParams);
      prog.program = i;
      prog.depth = depths ? depths.length : 0;
      prog.blockParams = declaredBlockParams || 0;
      return prog;
    }
    function resolvePartial(partial, context, options) {
      if (!partial) {
        if (options.name === "@partial-block") {
          partial = options.data["partial-block"];
        } else {
          partial = options.partials[options.name];
        }
      } else if (!partial.call && !options.name) {
        options.name = partial;
        partial = options.partials[partial];
      }
      return partial;
    }
    function invokePartial(partial, context, options) {
      var currentPartialBlock = options.data && options.data["partial-block"];
      options.partial = true;
      if (options.ids) {
        options.data.contextPath = options.ids[0] || options.data.contextPath;
      }
      var partialBlock = void 0;
      if (options.fn && options.fn !== noop) {
        (function() {
          options.data = _base.createFrame(options.data);
          var fn = options.fn;
          partialBlock = options.data["partial-block"] = function partialBlockWrapper(context2) {
            var options2 = arguments.length <= 1 || arguments[1] === void 0 ? {} : arguments[1];
            options2.data = _base.createFrame(options2.data);
            options2.data["partial-block"] = currentPartialBlock;
            return fn(context2, options2);
          };
          if (fn.partials) {
            options.partials = Utils.extend({}, options.partials, fn.partials);
          }
        })();
      }
      if (partial === void 0 && partialBlock) {
        partial = partialBlock;
      }
      if (partial === void 0) {
        throw new _exception2["default"]("The partial " + options.name + " could not be found");
      } else if (partial instanceof Function) {
        return partial(context, options);
      }
    }
    function noop() {
      return "";
    }
    function initData(context, data) {
      if (!data || !("root" in data)) {
        data = data ? _base.createFrame(data) : {};
        data.root = context;
      }
      return data;
    }
    function executeDecorators(fn, prog, container, depths, data, blockParams) {
      if (fn.decorator) {
        var props = {};
        prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
        Utils.extend(prog, props);
      }
      return prog;
    }
    function wrapHelpersToPassLookupProperty(mergedHelpers, container) {
      Object.keys(mergedHelpers).forEach(function(helperName) {
        var helper = mergedHelpers[helperName];
        mergedHelpers[helperName] = passLookupPropertyOption(helper, container);
      });
    }
    function passLookupPropertyOption(helper, container) {
      var lookupProperty = container.lookupProperty;
      return _internalWrapHelper.wrapHelper(helper, function(options) {
        return Utils.extend({ lookupProperty }, options);
      });
    }
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/no-conflict.js
var require_no_conflict = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars/no-conflict.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    exports["default"] = function(Handlebars2) {
      var root = typeof global !== "undefined" ? global : window, $Handlebars = root.Handlebars;
      Handlebars2.noConflict = function() {
        if (root.Handlebars === Handlebars2) {
          root.Handlebars = $Handlebars;
        }
        return Handlebars2;
      };
    };
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars.runtime.js
var require_handlebars_runtime = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/dist/cjs/handlebars.runtime.js"(exports, module) {
    "use strict";
    exports.__esModule = true;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj["default"] = obj;
        return newObj;
      }
    }
    var _handlebarsBase = require_base();
    var base = _interopRequireWildcard(_handlebarsBase);
    var _handlebarsSafeString = require_safe_string();
    var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);
    var _handlebarsException = require_exception();
    var _handlebarsException2 = _interopRequireDefault(_handlebarsException);
    var _handlebarsUtils = require_utils();
    var Utils = _interopRequireWildcard(_handlebarsUtils);
    var _handlebarsRuntime = require_runtime();
    var runtime = _interopRequireWildcard(_handlebarsRuntime);
    var _handlebarsNoConflict = require_no_conflict();
    var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);
    function create() {
      var hb = new base.HandlebarsEnvironment();
      Utils.extend(hb, base);
      hb.SafeString = _handlebarsSafeString2["default"];
      hb.Exception = _handlebarsException2["default"];
      hb.Utils = Utils;
      hb.escapeExpression = Utils.escapeExpression;
      hb.VM = runtime;
      hb.template = function(spec) {
        return runtime.template(spec, hb);
      };
      return hb;
    }
    var inst = create();
    inst.create = create;
    _handlebarsNoConflict2["default"](inst);
    inst["default"] = inst;
    exports["default"] = inst;
    module.exports = exports["default"];
  }
});

// ../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/runtime.js
var require_runtime2 = __commonJS({
  "../../node_modules/.pnpm/handlebars@4.7.7/node_modules/handlebars/runtime.js"(exports, module) {
    module.exports = require_handlebars_runtime()["default"];
  }
});

// src/mailer/templates/update-email.hbs
var Handlebars = __toESM(require_runtime2(), 1);
Handlebars.registerHelper({});
Handlebars.registerPartial({});
var update_email_default = Handlebars.template({ "compiler": [8, ">= 4.3.0"], "main": function(container, depth0, helpers, partials, data) {
  var stack1, alias1 = container.lambda, alias2 = container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
    if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
      return parent[propertyName];
    }
    return void 0;
  };
  return '<html dir="ltr" lang="en">\n\n  <head>\n    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />\n    <meta name="x-apple-disable-message-reformatting" />\n    <title>Update your email</title>\n    <meta\n      name="description"\n      content="To update the email for your account, enter the code provided in the app along with your new email."\n    />\n  </head>\n  <div\n    style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"\n  >To update the email for your account, enter the code provided in the app\n    along with your new email.<div\n    >\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\u200C\u200B\u200D\u200E\u200F\uFEFF</div>\n  </div>\n\n  <body\n    style="padding:12px;padding-bottom:40px;background-color:hsl(211, 20%, 95.3%)"\n  >\n    <table\n      align="center"\n      width="100%"\n      border="0"\n      cellPadding="0"\n      cellSpacing="0"\n      role="presentation"\n      style="max-width:37.5em"\n    >\n      <tbody>\n        <tr style="width:100%">\n          <td>\n            <table\n              align="center"\n              width="100%"\n              border="0"\n              cellPadding="0"\n              cellSpacing="0"\n              role="presentation"\n              style="padding-top:24px;padding-bottom:24px"\n            >\n              <tbody>\n                <tr>\n                  <td><img\n                      alt="' + alias2(alias1((stack1 = depth0 != null ? lookupProperty(depth0, "config") : depth0) != null ? lookupProperty(stack1, "serviceName") : stack1, depth0)) + '"\n                      src="' + alias2(alias1((stack1 = depth0 != null ? lookupProperty(depth0, "config") : depth0) != null ? lookupProperty(stack1, "logoUrl") : stack1, depth0)) + '"\n                      style="display:block;outline:none;border:none;text-decoration:none;width:110px;margin:0 auto"\n                    /></td>\n                </tr>\n              </tbody>\n            </table>\n            <table\n              align="center"\n              width="100%"\n              border="0"\n              cellPadding="0"\n              cellSpacing="0"\n              role="presentation"\n              style="padding:24px;padding-bottom:16px;border-radius:12px;background-color:#FFFFFF"\n            >\n              <tbody>\n                <tr>\n                  <td>\n                    <h1\n                      style="font-size:26px;letter-spacing:0.25px;color:#000000;font-family:-apple-system, BlinkMacSystemFont, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin:0px 0px;line-height:1.0"\n                    >Update your email</h1>\n                    <p\n                      style="font-size:16px;line-height:1.4;margin:0px 0px;letter-spacing:0.25px;color:hsl(211, 24%, 34.2%);font-family:-apple-system, BlinkMacSystemFont, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;padding-top:12px;padding-bottom:12px;padding-right:32px"\n                    >To update the email for your account, enter the code below\n                      in the app along with your new email.</p><code\n                      style="display:block;padding:16px;border-radius:8px;border-width:1px;border-style:solid;background-color:hsl(211, 20%, 95.3%);border-color:hsl(211, 20%, 85.89999999999999%);font-size:14px;letter-spacing:0.25px;font-family:monospace;text-transform:uppercase"\n                    >' + alias2(alias1(depth0 != null ? lookupProperty(depth0, "token") : depth0, depth0)) + '</code>\n                    <p\n                      style="font-size:14px;line-height:1.4;margin:0px 0px;letter-spacing:0.25px;color:hsl(211, 20%, 53%);font-family:-apple-system, BlinkMacSystemFont, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;padding-top:12px"\n                    >If you didn&#x27;t request an email update, you can safely\n                      ignore this email.</p>\n                    <table\n                      align="center"\n                      width="100%"\n                      border="0"\n                      cellPadding="0"\n                      cellSpacing="0"\n                      role="presentation"\n                      style="padding-top:24px"\n                    >\n                      <tbody>\n                        <tr>\n                          <td>\n                            <hr\n                              style="width:100%;border:none;border-top:1px solid #eaeaea;margin:0"\n                            />\n                            <table\n                              align="center"\n                              width="100%"\n                              border="0"\n                              cellPadding="0"\n                              cellSpacing="0"\n                              role="presentation"\n                              style="padding-top:16px;vertical-align:middle"\n                            >\n                              <tbody style="width:100%">\n                                <tr style="width:100%">\n                                  <td data-id="__react-email-column">\n                                    <p\n                                      style="font-size:14px;line-height:1.4;margin:0px 0px;color:hsl(211, 20%, 53%);font-family:-apple-system, BlinkMacSystemFont, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;letter-spacing:0.25px"\n                                    ><a\n                                        href="' + alias2(alias1((stack1 = depth0 != null ? lookupProperty(depth0, "config") : depth0) != null ? lookupProperty(stack1, "homeUrl") : stack1, depth0)) + '"\n                                        style="color:hsl(211, 20%, 53%);text-decoration:none;text-decoration-line:underline;font-family:-apple-system, BlinkMacSystemFont, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin:0px 0px;line-height:1.0;font-size:14px;letter-spacing:0.25px"\n                                        target="_blank"\n                                      >' + alias2(alias1((stack1 = depth0 != null ? lookupProperty(depth0, "config") : depth0) != null ? lookupProperty(stack1, "serviceName") : stack1, depth0)) + '</a></p>\n                                  </td>\n                                  <td\n                                    data-id="__react-email-column"\n                                    style="width:24px"\n                                  ><img\n                                      alt="' + alias2(alias1((stack1 = depth0 != null ? lookupProperty(depth0, "config") : depth0) != null ? lookupProperty(stack1, "serviceName") : stack1, depth0)) + '"\n                                      src="' + alias2(alias1((stack1 = depth0 != null ? lookupProperty(depth0, "config") : depth0) != null ? lookupProperty(stack1, "markUrl") : stack1, depth0)) + '"\n                                      style="display:block;outline:none;border:none;text-decoration:none;width:24px"\n                                    /></td>\n                                </tr>\n                              </tbody>\n                            </table>\n                          </td>\n                        </tr>\n                      </tbody>\n                    </table>\n                  </td>\n                </tr>\n              </tbody>\n            </table>\n            <table\n              align="center"\n              width="100%"\n              border="0"\n              cellPadding="0"\n              cellSpacing="0"\n              role="presentation"\n              style="height:500px"\n            >\n              <tbody>\n                <tr>\n                  <td></td>\n                </tr>\n              </tbody>\n            </table>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </body>\n\n</html>';
}, "useData": true });
export {
  update_email_default as default
};
//# sourceMappingURL=update-email.js.map
