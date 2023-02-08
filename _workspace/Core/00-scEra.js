;(function (exports) {
	'use strict';

	var __async$1 = (__this, __arguments, generator) => {
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
	function isValid(props) {
	  const type = typeof props;
	  const isArray = Array.isArray(props);
	  if (props === void 0 || props === null)
	    return false;
	  if (isArray) {
	    return props.length > 0;
	  }
	  if (type == "object") {
	    return JSON.stringify(props) !== "{}";
	  }
	  return true;
	}
	function getJson(path) {
	  return __async$1(this, null, function* () {
	    const files = [];
	    const response = yield fetch(path);
	    const filelist = yield response.json();
	    slog("log", `Loading json files from ${path}:`, filelist);
	    const folder = path.split("/").slice(0, -1).join("/");
	    const requests = filelist.map((file) => __async$1(this, null, function* () {
	      return new Promise((resolve, reject) => __async$1(this, null, function* () {
	        dlog("log", "trying to load json file: ", folder + "/" + file, "...");
	        const response2 = yield fetch(folder + "/" + file);
	        const json = yield response2.json();
	        if (!json || !isValid(json))
	          resolve(`[error] ${now()} | Failed to load json file: ${file}`);
	        files.push([file, json]);
	        dlog("log", `Loaded json file: ${file}:`, json);
	        resolve(json);
	      }));
	    }));
	    slog("log", `Waiting for json files to load...`);
	    yield Promise.all(requests);
	    slog("log", `All json files loaded!`);
	    return files;
	  });
	}
	function isObject(props) {
	  return Object.prototype.toString.call(props) === "[object Object]";
	}
	function inrange(x, min, max) {
	  return x >= min && x <= max;
	}
	function ensureIsArray(x, check = false) {
	  if (check)
	    x = ensure(x, []);
	  if (Array.isArray(x))
	    return x;
	  return [x];
	}
	function ensure(x, y) {
	  return x == void 0 ? y : x;
	}
	function between(x, min, max) {
	  return x > min && x < max;
	}
	function random(min, max) {
	  if (!max) {
	    max = min;
	    min = 0;
	  }
	  return Math.floor(Math.random() * (max - min + 1) + min);
	}
	Number.prototype.fixed = function(a) {
	  if (!a)
	    a = 2;
	  return parseFloat(this.toFixed(a));
	};
	function maybe(arr) {
	  let txt;
	  arr.forEach((v, i) => {
	    if (random(100) < v[1])
	      txt = v[0];
	  });
	  if (!txt) {
	    return arr[0][0];
	  }
	  return txt;
	}
	function compares(key) {
	  return function(m, n) {
	    let a = m[key];
	    let b = n[key];
	    return b - a;
	  };
	}
	function roll(times, max) {
	  if (!times)
	    times = 1;
	  if (!max)
	    max = 6;
	  let re;
	  re = {
	    roll: [],
	    result: 0,
	    bonus: 0
	  };
	  for (let i = 0; i < times; i++) {
	    let r = random(1, max);
	    re.roll[i] = r;
	    re.result += r;
	    if (r == max)
	      re.bonus++;
	  }
	  re.roll = re.roll.join();
	  return re;
	}
	function CtoF(c) {
	  return c * 1.8 + 32;
	}
	function groupmatch(value, ...table) {
	  return table.includes(value);
	}
	function draw(array) {
	  if (!Array.isArray(array) || array.length == 0)
	    return null;
	  var a = array.length - 1;
	  return array[random(0, a)];
	}
	function sum(obj) {
	  let sum2 = 0;
	  for (var el in obj) {
	    if (obj.hasOwnProperty(el)) {
	      sum2 += parseFloat(obj[el]);
	    }
	  }
	  return sum2;
	}
	function findkey(data, value, compare = (a, b) => a === b) {
	  return Object.keys(data).find((k) => compare(data[k], value));
	}
	function swap(arr, a, b) {
	  let c = arr[a];
	  let d = arr[b];
	  arr[b] = c;
	  arr[a] = d;
	  return arr;
	}
	function arrShift(arr, n) {
	  if (Math.abs(n) > arr.length)
	    n = n % arr.length;
	  return arr.slice(-n).concat(arr.slice(0, -n));
	}
	function clone(obj) {
	  var copy;
	  if (null == obj || "object" != typeof obj)
	    return obj;
	  if (obj instanceof Date) {
	    copy = new Date();
	    copy.setTime(obj.getTime());
	    return copy;
	  }
	  if (obj instanceof Array) {
	    copy = [];
	    for (var i = 0, len = obj.length; i < len; i++) {
	      copy[i] = clone(obj[i]);
	    }
	    return copy;
	  }
	  if (obj instanceof Function) {
	    copy = function() {
	      return obj.apply(this, arguments);
	    };
	    return copy;
	  }
	  if (obj instanceof Object) {
	    copy = {};
	    for (var attr in obj) {
	      if (obj.hasOwnProperty(attr))
	        copy[attr] = clone(obj[attr]);
	    }
	    return copy;
	  }
	  throw new Error("Unable to copy obj as type isn't supported " + obj.constructor.name);
	}
	function download(content, fileName, contentType) {
	  var a = document.createElement("a");
	  var file = new Blob([content], { type: contentType });
	  a.href = URL.createObjectURL(file);
	  a.download = fileName;
	  a.click();
	}
	function countArray(arr, element) {
	  return arr.reduce((count, subarr) => count + (subarr.includes(element) ? 1 : 0), 0);
	}
	function setPath(obj, path, value) {
	  const pathArray = path.split(".");
	  const last = pathArray.pop();
	  for (const p of pathArray) {
	    obj = obj[p] || {};
	  }
	  if (value) {
	    obj[last] = value;
	  }
	  return obj[last];
	}
	function getKeyByValue(object, value) {
	  const findArray = (arr, val) => {
	    return arr.find((item) => typeof item.includes === "function" && item.includes(val));
	  };
	  return Object.keys(object).find(
	    (key) => object[key] === value || object[key].includes(value) || Array.isArray(object[key]) && (object[key].includes(value) || findArray(object[key], value))
	  );
	}
	function getIndexByValue(array, value) {
	  return array.findIndex((item) => item === value);
	}
	Object.defineProperties(window, {
	  isObject: { value: isObject },
	  inrange: { value: inrange },
	  ensureIsArray: { value: ensureIsArray },
	  ensure: { value: ensure },
	  between: { value: between },
	  random: { value: random },
	  maybe: { value: maybe },
	  compares: { value: compares },
	  roll: { value: roll },
	  groupmatch: { value: groupmatch },
	  draw: { value: draw },
	  sum: { value: sum },
	  findkey: { value: findkey },
	  swap: { value: swap },
	  arrshift: { value: arrShift },
	  clone: { value: clone },
	  CtoF: { value: CtoF },
	  download: { value: download },
	  countArray: { value: countArray },
	  setPath: { value: setPath },
	  getKeyByValue: { value: getKeyByValue },
	  getIndexByValue: { value: getIndexByValue },
	  isValid: { value: isValid },
	  getJson: { value: getJson }
	});

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
	function loadBasicDefinationJson() {
	  return __async(this, null, function* () {
	    const filesdata = yield getJson("./data/main.json").then((res) => {
	      slog("log", "Main data file loaded:", res);
	      return res;
	    });
	    if (!filesdata)
	      return;
	    filesdata.forEach(([filename, filedata]) => {
	      slog("log", "Loading data from file:", filename, "...");
	      if (!filedata)
	        return;
	      for (let key in filedata) {
	        D[key] = filedata[key];
	      }
	    });
	    slog("log", "All basic defination json files are loaded:", D);
	    if (D.expGroup) {
	      D.exp = {};
	      Object.keys(D.expGroup).forEach((key) => {
	        Object.assign(D.exp, D.expGroup[key]);
	        D.expGroup[key] = Object.keys(D.expGroup[key]);
	      });
	    }
	  });
	}
	scEra.version = "0.5.0";
	console.time("scEra startup");
	$(document).one("sugarcube:startup", () => __async(void 0, null, function* () {
	  yield loadBasicDefinationJson();
	  console.timeLog("scEra startup");
	  scEra.status = "ready";
	}));
	$(document).one(":initstory", () => {
	  const checkId = setInterval(() => {
	    if (scEra.status !== "ready") {
	      return;
	    }
	    slog("log", "Era and SugarCube both ready to next step....");
	    jQuery.event.trigger({ type: "scEra:ready" });
	    clearInterval(checkId);
	  }, 50);
	});
	$(document).one("scEra:ready", () => __async(void 0, null, function* () {
	  slog("log", "Start to apply modules:", Object.keys(scEra.modules).join(", "));
	  for (let i = 0; i < scEra.loadorder.length; i++) {
	    if (!scEra.modules[scEra.loadorder[i]]) {
	      slog("warn", `Module ${scEra.loadorder[i]} is not loaded. Skipping this module.`);
	      scEra.loadorder.splice(i, 1);
	      i--;
	    }
	    const key = scEra.loadorder[i];
	    yield scEra.applyMod(key);
	  }
	  for (const key in scEra.modules) {
	    if (scEra.loadorder.includes(key)) {
	      continue;
	    }
	    yield scEra.applyMod(key);
	  }
	  console.timeLog("scEra startup");
	  slog("log", "Finish to apply modules.");
	  slog("log", "Applying classes to global namespace...");
	  applyClass();
	  console.timeLog("scEra startup");
	  slog("log", "Finish to apply classes.");
	  jQuery(document).trigger("scEra:apply");
	}));
	$(document).one("scEra:apply", function() {
	  return __async(this, null, function* () {
	    slog("log", "All modules are applied successfully. Start to initialization...");
	    console.timeLog("scEra startup");
	    console.log(scEra.startupInit);
	    for (let i = 0, iend = scEra.startupInit.length; i < iend; i++) {
	      slog("log", `Start to run initialization function ${scEra.startupInit[i]}...`);
	      let func = scEra.initialization[scEra.startupInit[i]];
	      if (func && typeof func === "function")
	        yield func();
	      else
	        slog("warn", `Initialization function ${scEra.startupInit[i]} is not found, skipping...`);
	    }
	    console.timeLog("scEra startup");
	    slog("log", "All initialization functions are applied successfully.");
	    jQuery(document).trigger(":modulesloaded");
	    jQuery.event.trigger({ type: ":afterload" });
	  });
	});
	$(document).one(":modulesloaded", () => {
	  slog("log", "All modules are loaded successfully.");
	  console.timeEnd("scEra startup");
	  scEra.status = "storyready";
	});
	$(document).one(":storyready", () => {
	  slog("log", "Story is ready.");
	});

	exports.CtoF = CtoF;
	exports.addModule = addModule;
	exports.applyClass = applyClass;
	exports.arrShift = arrShift;
	exports.between = between;
	exports.clone = clone;
	exports.compares = compares;
	exports.countArray = countArray;
	exports.download = download;
	exports.draw = draw;
	exports.ensure = ensure;
	exports.ensureIsArray = ensureIsArray;
	exports.findkey = findkey;
	exports.getIndexByValue = getIndexByValue;
	exports.getJson = getJson;
	exports.getKeyByValue = getKeyByValue;
	exports.groupmatch = groupmatch;
	exports.inrange = inrange;
	exports.isObject = isObject;
	exports.isValid = isValid;
	exports.maybe = maybe;
	exports.random = random;
	exports.roll = roll;
	exports.setPath = setPath;
	exports.sum = sum;
	exports.swap = swap;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
