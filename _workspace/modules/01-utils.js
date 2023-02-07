;(function () {
	'use strict';

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
	  isValid: { value: isValid },
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
	  getIndexByValue: { value: getIndexByValue }
	});

	slog("log", `utils/index.ts is loaded.`);

})();
