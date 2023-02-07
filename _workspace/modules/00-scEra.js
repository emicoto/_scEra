;(function (exports) {
	'use strict';

	var __async = (__this, __arguments, generator) => {
	  return new Promise((resolve, reject) => {
	    var fulfilled = (value) => {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var rejected = (value) => {
	      try {
	        step(generator.throw(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
	    step((generator = generator.apply(__this, __arguments)).next());
	  });
	};
	const addModule = function(modules) {
	  if (window.scEra.modules[modules.name]) {
	    slog("warn", `Module ${modules.name} is already loaded. Skipping this registration.`);
	    return false;
	  }
	  scEra.modules[modules.name] = {
	    Info: {
	      name: modules.name,
	      des: modules.des,
	      version: modules.version
	    }
	  };
	  for (let key in modules) {
	    if (["name", "des", "version"].includes(key))
	      continue;
	    scEra.modules[modules.name][key] = modules[key];
	  }
	  slog("log", `Module ${modules.name} is registered.`);
	  return true;
	};
	const applyModule = function(moduleName) {
	  return __async(this, null, function* () {
	    const module = scEra.modules[moduleName];
	    const { config, func, apply, language, setup, data } = module;
	    if (!module) {
	      slog("warn", `Module ${moduleName} is not loaded. Skipping this apply.`);
	      return false;
	    }
	    slog("log", `Applying module ${moduleName}...`);
	    Object.keys(module.classObj).forEach((key) => {
	      slog("log", `Applying class ${key} to scEra.classObj...`);
	      scEra.classObj[key] = module.classObj[key];
	    });
	    const merge = {
	      Fix: "fixer",
	      Cond: "conditions",
	      P: "documentGenerator",
	      Ui: "UIControl",
	      Init: "initialization"
	    };
	    if (func) {
	      slog("log", `Start to applying function group to scEra...`);
	      Object.keys(func).forEach((key) => {
	        if (merge[key]) {
	          Object.keys(func[key]).forEach((key2) => {
	            scEra[merge[key]][key2] = func[key][key2];
	            slog("log", `Function ${key2} is merged to scEra.${key} successfully.`);
	          });
	        } else {
	          scEra.utils[key] = func[key];
	          slog("log", `Function ${key} is merged to scEra.utils successfully.`);
	        }
	      });
	    }
	    const mergeData = (type, data2) => {
	      if (data2) {
	        slog("log", `Merging data from module ${moduleName} into ${type}...`);
	        Object.keys(data2).forEach((key) => {
	          if (Array.isArray(scEra[type][key]) && Array.isArray(data2[key])) {
	            scEra[type][key] = scEra[type][key].concat(data2[key]);
	            scEra[type][key] = Array.from(new Set(scEra[type][key]));
	            slog("log", `The data is an array. Concatenate successfully: ${key}`);
	          } else if (typeof scEra[type][key] === "object" && typeof data2[key] === "object") {
	            scEra[type][key] = Object.assign(scEra[type][key], data2[key]);
	            scEra[type][key] = Object.fromEntries(new Map(Object.entries(scEra[type][key])));
	            slog("log", `The data is an object. Merge successfully: ${key}`);
	          } else if (typeof scEra[type][key] === "undefined" && typeof data2[key] !== "undefined") {
	            scEra[type][key] = data2[key];
	            slog("log", `The data is undefined. Assign successfully: ${key}`);
	          } else {
	            slog(
	              "warn",
	              `Fail to merge moduledata into ${type}. Module ${moduleName} data ${key} is not the same type as the existing data. Skipping this data.`
	            );
	          }
	        });
	      }
	    };
	    if (data) {
	      mergeData("data", data);
	    }
	    if (setup) {
	      mergeData("setup", setup);
	    }
	    if (language) {
	      mergeData("language", language);
	    }
	    scEra.database[moduleName] = module.database;
	    if ((config == null ? void 0 : config.globalFunc) && Object.keys(config.globalFunc).length > 0) {
	      slog("log", `Start to make a getter for global functions...`);
	      Object.keys(config.globalFunc).forEach((key) => {
	        if (window[key] && window[key] !== config.globalFun[key]) {
	          slog(
	            "warn",
	            `Attempted to set ${key} in the global namespace, but it's already in use. Skipping this assignment. Existing Object:`,
	            window[key]
	          );
	        } else {
	          Object.defineProperty(window, key, {
	            get: () => config.globalFunc[key]
	          });
	          slog("log", `Getter for ${key} is created successfully.`);
	        }
	      });
	    }
	    if (config == null ? void 0 : config.globaldata) {
	      Object.defineProperty(window, moduleName.toUpperFirst() + "Data", {
	        get: () => window.scEra.database[moduleName]
	      });
	      slog("log", `Getter for ${moduleName.toUpperFirst()}Data is created successfully.`);
	    }
	    if (apply) {
	      slog("log", `Detected external apply function, start to apply...`);
	      yield apply();
	      slog("log", `External apply function is applied successfully.`);
	    }
	    return true;
	  });
	};
	const applyClass = function() {
	  Object.keys(scEra.classObj).forEach((key) => {
	    if (window[key] && window[key] !== scEra.classObj[key])
	      slog(
	        "warn",
	        `Attempted to set ${key} in the global namespace, but it's already in use. Skipping this assignment. Existing Object:`,
	        window[key]
	      );
	    try {
	      Object.defineProperty(window, key, {
	        value: scEra.classObj[key]
	      });
	    } catch (e) {
	      slog("warn", `Failed to apply class ${key}. Error:`, e);
	    }
	    slog("log", `Class ${key} applied successfully.`);
	  });
	};
	Object.defineProperties(scEra, {
	  addModule: {
	    value: addModule,
	    writable: false
	  },
	  applyModule: {
	    value: applyModule,
	    writable: false
	  },
	  applyClass: {
	    value: applyClass,
	    writable: false
	  }
	});
	Object.defineProperties(window, {
	  addModule: { get: () => scEra.addModule },
	  applyModule: { get: () => scEra.applyModule },
	  applyClass: { get: () => scEra.applyClass }
	});
	scEra.version = "0.3.5";
	console.time("scEra startup");
	$(document).one(":initstory", () => {
	  console.log("after init story module");
	});
	$(document).one(":storyinit", () => {
	  console.log("before storyinit");
	});
	$(document).one(":afterinit", () => {
	  console.log("after init");
	});
	$(document).one("scEra:apply", function() {
	  return __async(this, null, function* () {
	    slog("log", "All modules are applied successfully. Start to initialization...");
	    for (const [key, func] of Object.entries(scEra.initialization)) {
	      slog("log", `Start to run initialization function ${key}...`);
	      if (func && typeof func === "function")
	        yield func();
	    }
	    slog("log", "All initialization functions are applied successfully.");
	    jQuery(document).trigger(":modulesloaded");
	  });
	});
	$(document).one(":modulesloaded", () => {
	  slog("log", "All modules are loaded successfully.");
	});
	$(document).one(":storyready", () => {
	  console.timeEnd("scEra startup");
	  slog("log", "Story is ready.");
	});

	exports.addModule = addModule;
	exports.applyClass = applyClass;
	exports.applyModule = applyModule;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
