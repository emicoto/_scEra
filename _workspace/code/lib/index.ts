declare global {
	interface Window {
		scEra;
		addModule: typeof addModule;
		applyModule: typeof applyModule;
		config;
		slog: (type: "log" | "warn" | "error", ...args: any[]) => void;
		now: () => string;
	}
	interface scEra {
		modules;
	}
}
declare var scEra: typeof window.scEra;
declare function slog(type: "log" | "warn" | "error", ...args: any[]): void;

//config.debug = true;
//------------------------------------------------------------------------------
// debug log
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
//
//   scEra.regist
//
//------------------------------------------------------------------------------
export const addModule = function (modules) {
	//check if the module is already loaded before registering it
	if (window.scEra.modules[modules.name]) {
		slog("warn", `Module ${modules.name} is already loaded. Skipping this registration.`);
		return false;
	}

	//register the module
	scEra.modules[modules.name] = {
		Info: {
			name: modules.name,
			des: modules.des,
			version: modules.version,
		},
	};

	for (let key in modules) {
		if (["name", "des", "version"].includes(key)) continue;
		scEra.modules[modules.name][key] = modules[key];
	}

	slog("log", `Module ${modules.name} is registered.`);
	return true;
};

export const applyModule = async function (moduleName) {
	const module = scEra.modules[moduleName];
	const { config, func, apply, language, setup, data } = module;

	if (!module) {
		slog("warn", `Module ${moduleName} is not loaded. Skipping this apply.`);
		return false;
	}
	//apply the module
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
		Init: "initialization",
	};

	if (func) {
		//merge the module into the scEra
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

	const mergeData = (type, data) => {
		if (data) {
			slog("log", `Merging data from module ${moduleName} into ${type}...`);

			Object.keys(data).forEach((key) => {
				if (Array.isArray(scEra[type][key]) && Array.isArray(data[key])) {
					scEra[type][key] = scEra[type][key].concat(data[key]);
					//remove duplicates
					scEra[type][key] = Array.from(new Set(scEra[type][key]));
					slog("log", `The data is an array. Concatenate successfully: ${key}`);
				} else if (typeof scEra[type][key] === "object" && typeof data[key] === "object") {
					scEra[type][key] = Object.assign(scEra[type][key], data[key]);
					//remove duplicates
					scEra[type][key] = Object.fromEntries(new Map(Object.entries(scEra[type][key])));

					slog("log", `The data is an object. Merge successfully: ${key}`);
				} else if (typeof scEra[type][key] === "undefined" && typeof data[key] !== "undefined") {
					scEra[type][key] = data[key];

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

	//merge data
	if (data) {
		mergeData("data", data);
	}

	//merge setup
	if (setup) {
		mergeData("setup", setup);
	}

	//merge language
	if (language) {
		mergeData("language", language);
	}

	//apply database
	scEra.database[moduleName] = module.database;

	//check the config

	if (config?.globalFunc && Object.keys(config.globalFunc).length > 0) {
		slog("log", `Start to make a getter for global functions...`);

		Object.keys(config.globalFunc).forEach((key) => {
			if (window[key] && window[key] !== config.globalFun[key]) {
				slog(
					"warn",
					`Attempted to set ${key} in the global namespace, but it's already in use. Skipping this assignment. Existing Object:`,
					window[key]
				);
			} else {
				// make a short cut getter for the object
				Object.defineProperty(window, key, {
					get: () => config.globalFunc[key],
				});
				slog("log", `Getter for ${key} is created successfully.`);
			}
		});
	}

	if (config?.globaldata) {
		Object.defineProperty(window, moduleName.toUpperFirst() + "Data", {
			get: () => window.scEra.database[moduleName],
		});
		slog("log", `Getter for ${moduleName.toUpperFirst()}Data is created successfully.`);
	}

	if (apply) {
		slog("log", `Detected external apply function, start to apply...`);

		await apply();
		slog("log", `External apply function is applied successfully.`);
	}

	return true;
};

export const applyClass = function () {
	//apply the class
	Object.keys(scEra.classObj).forEach((key) => {
		if (window[key] && window[key] !== scEra.classObj[key])
			slog(
				"warn",
				`Attempted to set ${key} in the global namespace, but it's already in use. Skipping this assignment. Existing Object:`,
				window[key]
			);

		try {
			Object.defineProperty(window, key, {
				value: scEra.classObj[key],
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
		writable: false,
	},
	applyModule: {
		value: applyModule,
		writable: false,
	},
	applyClass: {
		value: applyClass,
		writable: false,
	},
});

Object.defineProperties(window, {
	addModule: { get: () => scEra.addModule },
	applyModule: { get: () => scEra.applyModule },
	applyClass: { get: () => scEra.applyClass },
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

$(document).one("scEra:apply", async function () {
	slog("log", "All modules are applied successfully. Start to initialization...");

	for (const [key, func] of Object.entries(scEra.initialization)) {
		slog("log", `Start to run initialization function ${key}...`);
		if (func && typeof func === "function") await func();
	}

	slog("log", "All initialization functions are applied successfully.");

	jQuery(document).trigger(":modulesloaded");
});

$(document).one(":modulesloaded", () => {
	slog("log", "All modules are loaded successfully.");
});

$(document).one(":storyready", () => {
	console.timeEnd("scEra startup");
	slog("log", "Story is ready.");
});
