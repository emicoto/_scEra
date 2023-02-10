declare global {
	interface Number {
		fixed(a?: number): number;
	}
}
declare function slog(type: "log" | "warn" | "error", ...args: any[]): void;
declare function dlog(type: "log" | "warn" | "error", ...args: any[]): void;
declare function now(): string;
//------------------------------------------------------------------------------
//
// utils
//
//------------------------------------------------------------------------------

//make sure the props is valid variables (not null, undefined, empty array, empty object)
export function isValid(props) {
	const type = typeof props;
	const isArray = Array.isArray(props);

	if (props === undefined || props === null) return false;

	if (isArray) {
		return props.length > 0;
	}

	if (type == "object") {
		return JSON.stringify(props) !== "{}";
	}

	return true;
}

export async function getJson(path) {
	const files: any[] = [];

	const response = await fetch(path);
	const filelist = await response.json();

	slog("log", `Loading json files from ${path}:`, filelist);

	//pop the last element of the array, which is the file name
	const folder = path.split("/").slice(0, -1).join("/");

	const requests = filelist.map(async (file) => {
		return new Promise(async (resolve, reject) => {
			dlog("log", "trying to load json file: ", folder + "/" + file, "...");
			const response = await fetch(folder + "/" + file);
			const json = await response.json();

			if (!json || !isValid(json)) resolve(`[error] ${now()} | Failed to load json file: ${file}`);

			files.push([file, json]);
			dlog("log", `Loaded json file: ${file}:`, json);
			resolve(json);
		});
	});

	slog("log", `Waiting for json files to load...`);

	await Promise.all(requests);

	slog("log", `All json files loaded!`);

	return files;
}

//make sure the value is an object
export function isObject(props) {
	return Object.prototype.toString.call(props) === "[object Object]";
}

//check x is in range of min and max
export function inrange(x: number, min: number, max: number) {
	return x >= min && x <= max;
}

//make sure the value is an array
export function ensureIsArray(x, check = false) {
	if (check) x = ensure(x, []);
	if (Array.isArray(x)) return x;
	return [x];
}

//ensure the value is not null or undefined
export function ensure(x, y) {
	/* lazy comparison to include null. */
	return x == undefined ? y : x;
}

//check x is between min and max
export function between(x: number, min: number, max: number) {
	return x > min && x < max;
}

//make a random number
export function random(min: number, max?: number) {
	if (!max) {
		max = min;
		min = 0;
	}
	return Math.floor(Math.random() * (max - min + 1) + min);
}

//fix the number to any decimal places
Number.prototype.fixed = function (a) {
	if (!a) a = 2;
	return parseFloat(this.toFixed(a));
};

//return a random element from an array by rate
export function maybe(arr: Array<[string, number]>) {
	let txt;
	arr.forEach((v, i) => {
		if (random(100) < v[1]) txt = v[0];
	});

	if (!txt) {
		return arr[0][0];
	}
	return txt;
}

//compare two elements in an object
export function compares(key) {
	return function (m, n) {
		let a = m[key];
		let b = n[key];
		return b - a;
	};
}

//roll dice
export function roll(times?: number, max?: number) {
	if (!times) times = 1;
	if (!max) max = 6;

	let re;

	re = {
		roll: [],
		result: 0,
		bonus: 0,
	};

	for (let i = 0; i < times; i++) {
		let r = random(1, max);
		re.roll[i] = r;
		re.result += r;
		if (r == max) re.bonus++;
	}

	re.roll = re.roll.join();

	return re;
}

//transfer celsius to fahrenheit
export function CtoF(c: number) {
	return c * 1.8 + 32;
}

//check if the value is in the given array
export function groupmatch(value, ...table: Array<number | string>) {
	return table.includes(value);
}

//draw a random element from an array
export function draw(array: any[]) {
	if (!Array.isArray(array) || array.length == 0) return null;
	var a = array.length - 1;
	return array[random(0, a)];
}

//sum all the values in an object
export function sum(obj) {
	let sum = 0;
	for (var el in obj) {
		if (obj.hasOwnProperty(el)) {
			sum += parseFloat(obj[el]);
		}
	}
	return sum;
}

//find the key of an object by value
export function findkey(data, value, compare = (a, b) => a === b) {
	return Object.keys(data).find((k) => compare(data[k], value));
}

//swap two elements in an array
export function swap(arr: any[], a, b) {
	let c = arr[a];
	let d = arr[b];
	arr[b] = c;
	arr[a] = d;
	return arr;
}

//shift an array by given number
export function arrShift(arr, n) {
	if (Math.abs(n) > arr.length) n = n % arr.length;
	return arr.slice(-n).concat(arr.slice(0, -n));
}

//deep clone an object
export function clone(obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle export Function
	if (obj instanceof Function) {
		copy = function () {
			return obj.apply(this, arguments);
		};
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj as type isn't supported " + obj.constructor.name);
}

//create a download file by given content
export function download(content, fileName, contentType) {
	var a = document.createElement("a");
	var file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}

//count an element in a 2d array
export function countArray(arr, element) {
	return arr.reduce((count, subarr) => count + (subarr.includes(element) ? 1 : 0), 0);
}

//get and set object by path
export function setPath(obj, path, value?) {
	const pathArray = path.split(".");
	const last = pathArray.pop();
	for (const p of pathArray) {
		if (!obj[p]) obj[p] = {};
		obj = obj[p];
	}
	if (value) {
		obj[last] = value;
	}
	return obj[last];
}

//get key by value
export function getKeyByValue(object, value) {
	const findArray = (arr, val) => {
		return arr.find((item) => typeof item.includes === "function" && item.includes(val));
	};
	return Object.keys(object).find(
		(key) =>
			object[key] === value ||
			object[key].includes(value) ||
			(Array.isArray(object[key]) && (object[key].includes(value) || findArray(object[key], value)))
	);
}

//get index by value
export function getIndexByValue(array, value) {
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
	getJson: { value: getJson },
});
