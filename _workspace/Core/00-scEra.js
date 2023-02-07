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
	  applyClass: {
	    value: applyClass,
	    writable: false
	  }
	});
	Object.defineProperties(window, {
	  addModule: { get: () => scEra.addModule },
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
	$(document).one("sugarcube:ready", () => {
	  slog("log", "Start to apply modules:", Object.keys(scEra.modules).join(", "));
	  Object.keys(scEra.modules).forEach((key) => __async(void 0, null, function* () {
	    yield scEra.applyMod(key);
	  }));
	  console.timeLog("scEra startup");
	  slog("log", "Finish to apply modules.");
	  slog("log", "Applying classes to global namespace...");
	  applyClass();
	  console.timeLog("scEra startup");
	  slog("log", "Finish to apply classes.");
	  jQuery(document).trigger("scEra:apply");
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
	  console.timeEnd("scEra startup");
	  Config.afterinit = true;
	});
	$(document).one(":storyready", () => {
	  slog("log", "Story is ready.");
	});

	exports.addModule = addModule;
	exports.applyClass = applyClass;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
