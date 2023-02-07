/*
    Concatenates one or more unique elements to the end of the base array
    and returns the result as a new array.  Elements which are arrays will
    be merged—i.e. their elements will be concatenated, rather than the
    array itself.
*/

/**
 * @param {string[]} arg
 * @returns {boolean}
 * @description
 * Checks if the string or array contains the given argument.
 * @example
 * "Hello World".has("Hello"); // 1
 * "Hello World".has("Hello", "World", "Foo"); // 2
 * "Hello World".has("Foo"); // false
 * "Hello World".has("Foo", "Bar"); // false
 */
String.prototype.has = function (...arg) {
	if (Array.isArray(arg[0])) arg = arg[0];
	let count = 0;
	for (let i = 0; i < arg.length; i++) {
		if (this.includes(arg[i])) count++;
	}
	if (!count) return false;
	return count;
};
Array.prototype.has = function (...arg) {
	if (Array.isArray(arg[0])) arg = arg[0];
	let count = 0;
	for (let i = 0; i < arg.length; i++) {
		if (this.includes(arg[i])) count++;
	}
	if (!count) return false;
	return count;
};

/**
 *
 * @param {number} index
 * @param {string} string
 * @returns {string}
 * @description
 * Inserts a string at the given index.
 */
String.prototype.insert = function (index, string) {
	this.splice(index, 0, string);
	return this;
};

/**
 *
 * @param {number} index
 * @param {any} element
 * @returns {Array}
 * @description
 * Inserts an element at the given index.
 */
Array.prototype.insert = function (index, element) {
	this.splice(index, 0, element);
	return this;
};

Object.defineProperty(Array.prototype, "concatUnique", {
	configurable: true,
	writable: true,

	value(/* variadic */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.concatUnique called on null or undefined");
		}

		const result = Array.from(this);

		if (arguments.length === 0) {
			return result;
		}

		const items = Array.prototype.reduce.call(arguments, (prev, cur) => prev.concat(cur), []);
		const addSize = items.length;

		if (addSize === 0) {
			return result;
		}

		const indexOf = Array.prototype.indexOf;
		const push = Array.prototype.push;

		for (let i = 0; i < addSize; ++i) {
			const value = items[i];

			if (indexOf.call(result, value) === -1) {
				push.call(result, value);
			}
		}

		return result;
	},
});

/*
    Returns the number of times the given element was found within the array.
*/
Object.defineProperty(Array.prototype, "count", {
	configurable: true,
	writable: true,

	value(/* needle [, fromIndex ] */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.count called on null or undefined");
		}

		const indexOf = Array.prototype.indexOf;
		const needle = arguments[0];
		let pos = Number(arguments[1]) || 0;
		let count = 0;

		while ((pos = indexOf.call(this, needle, pos)) !== -1) {
			++count;
			++pos;
		}

		return count;
	},
});

/*
    Returns the number elements within the array that pass the test
    implemented by the given predicate function.
*/
Object.defineProperty(Array.prototype, "countWith", {
	configurable: true,
	writable: true,

	value(predicate, thisArg) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.countWith called on null or undefined");
		}
		if (typeof predicate !== "function") {
			throw new Error("Array.prototype.countWith predicate parameter must be a function");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return 0;
		}

		let count = 0;

		for (let i = 0; i < length; ++i) {
			if (predicate.call(thisArg, this[i], i, this)) {
				++count;
			}
		}

		return count;
	},
});

/*
    Removes and returns all of the given elements from the array.
*/
Object.defineProperty(Array.prototype, "delete", {
	configurable: true,
	writable: true,

	value(/* needles */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.delete called on null or undefined");
		}

		if (arguments.length === 0) {
			return [];
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return [];
		}

		const needles = Array.prototype.concat.apply([], arguments);
		const needlesLength = needles.length;
		const indices = [];

		for (let i = 0; i < length; ++i) {
			const value = this[i];

			for (let j = 0; j < needlesLength; ++j) {
				const needle = needles[j];

				if (value === needle || (value !== value && needle !== needle)) {
					indices.push(i);
					break;
				}
			}
		}

		const result = [];

		// Copy the elements (in original order).
		for (let i = 0, iend = indices.length; i < iend; ++i) {
			result[i] = this[indices[i]];
		}

		const splice = Array.prototype.splice;

		// Delete the elements (in reverse order).
		for (let i = indices.length - 1; i >= 0; --i) {
			splice.call(this, indices[i], 1);
		}

		return result;
	},
});

/*
    Removes and returns all of the elements at the given indices from the array.
*/
Object.defineProperty(Array.prototype, "deleteAt", {
	configurable: true,
	writable: true,

	value(/* indices */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.deleteAt called on null or undefined");
		}

		if (arguments.length === 0) {
			return [];
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return [];
		}

		const splice = Array.prototype.splice;
		const cpyIndices = [
			...new Set(
				Array.prototype.concat
					.apply([], arguments)
					// Map negative indices to their positive counterparts,
					// so the Set can properly filter out duplicates.
					.map((x) => (x < 0 ? Math.max(0, length + x) : x))
			).values(),
		];
		const delIndices = [...cpyIndices].sort((a, b) => b - a);
		const result = [];

		// Copy the elements (in originally specified order).
		for (let i = 0, iend = cpyIndices.length; i < iend; ++i) {
			result[i] = this[cpyIndices[i]];
		}

		// Delete the elements (in descending numeric order).
		for (let i = 0, iend = delIndices.length; i < iend; ++i) {
			splice.call(this, delIndices[i], 1);
		}

		return result;
	},
});

/*
    Removes and returns all of the elements that pass the test implemented
    by the given predicate function from the array.
*/
Object.defineProperty(Array.prototype, "deleteWith", {
	configurable: true,
	writable: true,

	value(predicate, thisArg) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.deleteWith called on null or undefined");
		}
		if (typeof predicate !== "function") {
			throw new Error("Array.prototype.deleteWith predicate parameter must be a function");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return [];
		}

		const splice = Array.prototype.splice;
		const indices = [];
		const result = [];

		// Copy the elements (in original order).
		for (let i = 0; i < length; ++i) {
			if (predicate.call(thisArg, this[i], i, this)) {
				result.push(this[i]);
				indices.push(i);
			}
		}

		// Delete the elements (in reverse order).
		for (let i = indices.length - 1; i >= 0; --i) {
			splice.call(this, indices[i], 1);
		}

		return result;
	},
});

/*
    Returns the first element from the array.
*/
Object.defineProperty(Array.prototype, "first", {
	configurable: true,
	writable: true,

	value() {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.first called on null or undefined");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return;
		}

		return this[0];
	},
});

/*
    Returns whether all of the given elements were found within the array.
*/
Object.defineProperty(Array.prototype, "includesAll", {
	configurable: true,
	writable: true,

	value(/* needles */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.includesAll called on null or undefined");
		}

		if (arguments.length === 1) {
			if (Array.isArray(arguments[0])) {
				return Array.prototype.includesAll.apply(this, arguments[0]);
			}

			return Array.prototype.includes.apply(this, arguments);
		}

		for (let i = 0, iend = arguments.length; i < iend; ++i) {
			if (
				!Array.prototype.some.call(
					this,
					function (val) {
						return val === this.val || (val !== val && this.val !== this.val);
					},
					{ val: arguments[i] }
				)
			) {
				return false;
			}
		}

		return true;
	},
});

/*
    Returns whether any of the given elements were found within the array.
*/
Object.defineProperty(Array.prototype, "includesAny", {
	configurable: true,
	writable: true,

	value(/* needles */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.includesAny called on null or undefined");
		}

		if (arguments.length === 1) {
			if (Array.isArray(arguments[0])) {
				return Array.prototype.includesAny.apply(this, arguments[0]);
			}

			return Array.prototype.includes.apply(this, arguments);
		}

		for (let i = 0, iend = arguments.length; i < iend; ++i) {
			if (
				Array.prototype.some.call(
					this,
					function (val) {
						return val === this.val || (val !== val && this.val !== this.val);
					},
					{ val: arguments[i] }
				)
			) {
				return true;
			}
		}

		return false;
	},
});

/*
    Returns the last element from the array.
*/
Object.defineProperty(Array.prototype, "last", {
	configurable: true,
	writable: true,

	value() {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.last called on null or undefined");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return;
		}

		return this[length - 1];
	},
});

/*
    Randomly removes an element from the base array and returns it.
    [DEPRECATED] Optionally, from within the given bounds.
*/
Object.defineProperty(Array.prototype, "pluck", {
	configurable: true,
	writable: true,

	value(/* DEPRECATED: [min ,] max */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.pluck called on null or undefined");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return;
		}

		const index = arguments.length === 0 ? _random(0, length - 1) : _randomIndex(length, [...arguments]);

		return Array.prototype.splice.call(this, index, 1)[0];
	},
});

/*
    Randomly removes the given number of unique elements from the base array
    and returns the removed elements as a new array.
*/
Object.defineProperty(Array.prototype, "pluckMany", {
	configurable: true,
	writable: true,

	value(wantSize) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.pluckMany called on null or undefined");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return [];
		}

		let want = Math.trunc(wantSize);

		if (!Number.isInteger(want)) {
			throw new Error("Array.prototype.pluckMany want parameter must be an integer");
		}

		if (want < 1) {
			return [];
		}

		if (want > length) {
			want = length;
		}

		const splice = Array.prototype.splice;
		const result = [];
		let max = length - 1;

		do {
			result.push(splice.call(this, _random(0, max--), 1)[0]);
		} while (result.length < want);

		return result;
	},
});

/*
    Appends one or more unique elements to the end of the base array and
    returns its new length.
*/
Object.defineProperty(Array.prototype, "pushUnique", {
	configurable: true,
	writable: true,

	value(/* variadic */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.pushUnique called on null or undefined");
		}

		const addSize = arguments.length;

		if (addSize === 0) {
			return this.length >>> 0;
		}

		const indexOf = Array.prototype.indexOf;
		const push = Array.prototype.push;

		for (let i = 0; i < addSize; ++i) {
			const value = arguments[i];

			if (indexOf.call(this, value) === -1) {
				push.call(this, value);
			}
		}

		return this.length >>> 0;
	},
});

/*
    Randomly selects an element from the base array and returns it.
    [DEPRECATED] Optionally, from within the given bounds.
*/
Object.defineProperty(Array.prototype, "random", {
	configurable: true,
	writable: true,

	value(/* DEPRECATED: [min ,] max */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.random called on null or undefined");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return;
		}

		const index = arguments.length === 0 ? _random(0, length - 1) : _randomIndex(length, [...arguments]);

		return this[index];
	},
});

/*
    Randomly selects the given number of unique elements from the base array
    and returns the selected elements as a new array.
*/
Object.defineProperty(Array.prototype, "randomMany", {
	configurable: true,
	writable: true,

	value(wantSize) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.randomMany called on null or undefined");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return [];
		}

		let want = Math.trunc(wantSize);

		if (!Number.isInteger(want)) {
			throw new Error("Array.prototype.randomMany want parameter must be an integer");
		}

		if (want < 1) {
			return [];
		}

		if (want > length) {
			want = length;
		}

		const picked = new Map();
		const result = [];
		const max = length - 1;

		do {
			let i;
			do {
				i = _random(0, max);
			} while (picked.has(i));
			picked.set(i, true);
			result.push(this[i]);
		} while (result.length < want);

		return result;
	},
});

/*
    Randomly shuffles the array and returns it.
*/
Object.defineProperty(Array.prototype, "shuffle", {
	configurable: true,
	writable: true,

	value() {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.shuffle called on null or undefined");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return this;
		}

		for (let i = length - 1; i > 0; --i) {
			const j = Math.floor(_nativeMathRandom() * (i + 1));

			if (i === j) {
				continue;
			}

			// [this[i], this[j]] = [this[j], this[i]];
			const swap = this[i];
			this[i] = this[j];
			this[j] = swap;
		}

		return this;
	},
});

/*
    Prepends one or more unique elements to the beginning of the base array
    and returns its new length.
*/
Object.defineProperty(Array.prototype, "unshiftUnique", {
	configurable: true,
	writable: true,

	value(/* variadic */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.unshiftUnique called on null or undefined");
		}

		const addSize = arguments.length;

		if (addSize === 0) {
			return this.length >>> 0;
		}

		const indexOf = Array.prototype.indexOf;
		const unshift = Array.prototype.unshift;

		for (let i = 0; i < addSize; ++i) {
			const value = arguments[i];

			if (indexOf.call(this, value) === -1) {
				unshift.call(this, value);
			}
		}

		return this.length >>> 0;
	},
});

/*
    Returns a bound function that supplies the given arguments to the base
    function, followed by the arguments are supplied to the bound function,
    whenever it is called.
*/
Object.defineProperty(Function.prototype, "partial", {
	configurable: true,
	writable: true,

	value(/* variadic */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Function.prototype.partial called on null or undefined");
		}

		const slice = Array.prototype.slice;
		const fn = this;
		const bound = slice.call(arguments, 0);

		return function () {
			const applied = [];
			let argc = 0;

			for (let i = 0; i < bound.length; ++i) {
				applied.push(bound[i] === undefined ? arguments[argc++] : bound[i]);
			}

			return fn.apply(this, applied.concat(slice.call(arguments, argc)));
		};
	},
});

/*
    Returns the given numerical clamped to the specified bounds.
*/
Object.defineProperty(Math, "clamp", {
	configurable: true,
	writable: true,

	value(num, min, max) {
		const value = Number(num);
		return Number.isNaN(value) ? NaN : value.clamp(min, max);
	},
});

/*
		Returns a decimal number eased from 0 to 1.

		NOTE: The magnitude of the returned value decreases if num < 0.5 or increases if num > 0.5.
	*/
Object.defineProperty(Math, "easeInOut", {
	configurable: true,
	writable: true,

	value(num) {
		return 1 - (Math.cos(Number(num) * Math.PI) + 1) / 2;
	},
});

/*
		Returns the number clamped to the specified bounds.
	*/
Object.defineProperty(Number.prototype, "clamp", {
	configurable: true,
	writable: true,

	value(/* min, max */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Number.prototype.clamp called on null or undefined");
		}

		if (arguments.length !== 2) {
			throw new Error("Number.prototype.clamp called with an incorrect number of parameters");
		}

		let min = Number(arguments[0]);
		let max = Number(arguments[1]);

		if (min > max) {
			[min, max] = [max, min];
		}

		return Math.min(Math.max(this, min), max);
	},
});

/*
		Returns whether the given string was found within the string.
	*/
Object.defineProperty(String.prototype, "contains", {
	configurable: true,
	writable: true,

	value(/* needle [, fromIndex] */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("String.prototype.contains called on null or undefined");
		}

		return String.prototype.indexOf.apply(this, arguments) !== -1;
	},
});

/*
		Returns the number of times the given substring was found within the string.
	*/
Object.defineProperty(String.prototype, "count", {
	configurable: true,
	writable: true,

	value(/* needle [, fromIndex ] */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("String.prototype.count called on null or undefined");
		}

		const needle = String(arguments[0] || "");

		if (needle === "") {
			return 0;
		}

		const indexOf = String.prototype.indexOf;
		const step = needle.length;
		let pos = Number(arguments[1]) || 0;
		let count = 0;

		while ((pos = indexOf.call(this, needle, pos)) !== -1) {
			++count;
			pos += step;
		}

		return count;
	},
});

/*
		Returns the first Unicode code point from the string.
	*/
Object.defineProperty(String.prototype, "first", {
	configurable: true,
	writable: true,

	value() {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("String.prototype.first called on null or undefined");
		}

		// Required as `this` could be a `String` object or come from a `call()` or `apply()`.
		const str = String(this);

		// Get the first code point—may be one or two code units—and its end position.
		const { char } = _getCodePointStartAndEnd(str, 0);

		return char;
	},
});

/*
		Returns the last Unicode code point from the string.
	*/
Object.defineProperty(String.prototype, "last", {
	configurable: true,
	writable: true,

	value() {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("String.prototype.last called on null or undefined");
		}

		// Required as `this` could be a `String` object or come from a `call()` or `apply()`.
		const str = String(this);

		// Get the last code point—may be one or two code units—and its end position.
		const { char } = _getCodePointStartAndEnd(str, str.length - 1);

		return char;
	},
});

/*
		Returns a copy of the base string with `delCount` characters replaced with
		`replacement`, starting at `startAt`.
	*/
Object.defineProperty(String.prototype, "splice", {
	configurable: true,
	writable: true,

	value(startAt, delCount, replacement) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("String.prototype.splice called on null or undefined");
		}

		const length = this.length >>> 0;

		if (length === 0) {
			return "";
		}

		let start = Number(startAt);

		if (!Number.isSafeInteger(start)) {
			start = 0;
		} else if (start < 0) {
			start += length;

			if (start < 0) {
				start = 0;
			}
		}

		if (start > length) {
			start = length;
		}

		let count = Number(delCount);

		if (!Number.isSafeInteger(count) || count < 0) {
			count = 0;
		}

		let res = this.slice(0, start);

		if (typeof replacement !== "undefined") {
			res += replacement;
		}

		if (start + count < length) {
			res += this.slice(start + count);
		}

		return res;
	},
});

/*
		Returns an array of strings, split from the string, or an empty array if the
		string is empty.
	*/
Object.defineProperty(String.prototype, "splitOrEmpty", {
	configurable: true,
	writable: true,

	value(/* [ separator [, limit ]] */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("String.prototype.splitOrEmpty called on null or undefined");
		}

		// Required as `this` could be a `String` object or come from a `call()` or `apply()`.
		if (String(this) === "") {
			return [];
		}

		return String.prototype.split.apply(this, arguments);
	},
});

/*
		Returns a copy of the base string with the first Unicode code point uppercased,
		according to any locale-specific rules.
	*/
Object.defineProperty(String.prototype, "toLocaleUpperFirst", {
	configurable: true,
	writable: true,

	value() {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("String.prototype.toLocaleUpperFirst called on null or undefined");
		}

		// Required as `this` could be a `String` object or come from a `call()` or `apply()`.
		const str = String(this);

		// Get the first code point—may be one or two code units—and its end position.
		const { char, end } = _getCodePointStartAndEnd(str, 0);

		return end === -1 ? "" : char.toLocaleUpperCase() + str.slice(end + 1);
	},
});

/*
		Returns a copy of the base string with the first Unicode code point uppercased.
	*/
Object.defineProperty(String.prototype, "toUpperFirst", {
	configurable: true,
	writable: true,

	value() {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("String.prototype.toUpperFirst called on null or undefined");
		}

		// Required as `this` could be a `String` object or come from a `call()` or `apply()`.
		const str = String(this);

		// Get the first code point—may be one or two code units—and its end position.
		const { char, end } = _getCodePointStartAndEnd(str, 0);

		return end === -1 ? "" : char.toUpperCase() + str.slice(end + 1);
	},
});

/*******************************************************************************************************************
		Extensions, Deprecated.
	*******************************************************************************************************************/
/*
		[DEPRECATED] Returns whether the given element was found within the array.
	*/
Object.defineProperty(Array.prototype, "contains", {
	configurable: true,
	writable: true,

	value(/* needle [, fromIndex] */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.contains called on null or undefined");
		}

		return Array.prototype.includes.apply(this, arguments);
	},
});

/*
		[DEPRECATED] Returns whether all of the given elements were found within the array.
	*/
Object.defineProperty(Array.prototype, "containsAll", {
	configurable: true,
	writable: true,

	value(/* needle [, fromIndex] */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.containsAll called on null or undefined");
		}

		return Array.prototype.includesAll.apply(this, arguments);
	},
});

/*
		[DEPRECATED] Returns whether any of the given elements were found within the array.
	*/
Object.defineProperty(Array.prototype, "containsAny", {
	configurable: true,
	writable: true,

	value(/* needle [, fromIndex] */) {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.containsAny called on null or undefined");
		}

		return Array.prototype.includesAny.apply(this, arguments);
	},
});

/*
		[DEPRECATED] Returns a new array consisting of the flattened source array.
	*/
Object.defineProperty(Array.prototype, "flatten", {
	configurable: true,
	writable: true,

	value() {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("Array.prototype.flatten called on null or undefined");
		}

		return Array.prototype.flat.call(this, Infinity);
	},
});

/*
		[DEPRECATED] Returns an array of link titles, parsed from the string.

		NOTE: Unused in SugarCube, only included for compatibility.
	*/
Object.defineProperty(String.prototype, "readBracketedList", {
	configurable: true,
	writable: true,

	value() {
		if (this == null) {
			// lazy equality for null
			throw new TypeError("String.prototype.readBracketedList called on null or undefined");
		}

		// RegExp groups: Double-square-bracket quoted | Unquoted.
		const re = new RegExp("(?:\\[\\[((?:\\s|\\S)*?)\\]\\])|([^\"'\\s]\\S*)", "gm");
		const names = [];
		let match;

		while ((match = re.exec(this)) !== null) {
			if (match[1]) {
				// double-square-bracket quoted
				names.push(match[1]);
			} else if (match[2]) {
				// unquoted
				names.push(match[2]);
			}
		}

		return names;
	},
});
