import { getJson } from "./utils";

export * from "./utils";
declare var scEra: typeof window.scEra;
declare function slog(type: "log" | "warn" | "error", ...args: any[]): void;
declare var jQuery: typeof window.jQuery;
declare var D: typeof window.D;
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
	applyClass: {
		value: applyClass,
		writable: false,
	},
});

Object.defineProperties(window, {
	addModule: { get: () => scEra.addModule },
	applyClass: { get: () => scEra.applyClass },
});

//-------------------------------------------------------------
//
//  load all the basic defination json files
//
//-------------------------------------------------------------
async function loadBasicDefinationJson() {
	const filesdata: any[] = await getJson("./data/main.json").then((res) => {
		slog("log", "Main data file loaded:", res);
		return res;
	});

	if (!filesdata) return;

	filesdata.forEach(([filename, filedata]) => {
		slog("log", "Loading data from file:", filename, "...");
		if (!filedata) return;
		for (let key in filedata) {
			D[key] = filedata[key];
		}
	});

	slog("log", "All basic defination json files are loaded:", D);

	if (D.expGroup) {
		//assign all the expgroup from expgroup to exp
		D.exp = {};
		Object.keys(D.expGroup).forEach((key) => {
			Object.assign(D.exp, D.expGroup[key]);
			D.expGroup[key] = Object.keys(D.expGroup[key]);
		});
	}
}

//-------------------------------------------------------------
//
//   startup
//
//-------------------------------------------------------------

scEra.version = "0.5.0";
console.time("scEra startup");

$(document).one("sugarcube:startup", async () => {
	await loadBasicDefinationJson();
	console.timeLog("scEra startup");

	scEra.status = "ready";
});

$(document).one(":initstory", () => {
	const checkId = setInterval(() => {
		//check if the basic defination json files are loaded
		if (scEra.status !== "ready") {
			return;
		}

		slog("log", "Era and SugarCube both ready to next step....");
		jQuery.event.trigger({ type: "scEra:ready" });
		clearInterval(checkId);
	}, 50);
});

//-------------------------------------------------------------
//
//   scEra.apply
//   apply the module
//
//-------------------------------------------------------------
$(document).one("scEra:ready", () => {
	slog("log", "Start to apply modules:", Object.keys(scEra.modules).join(", "));

	scEra.loadorder.forEach(async (key) => {
		await scEra.applyMod(key);
	});

	Object.keys(scEra.modules).forEach(async (key) => {
		if (scEra.loadorder.includes(key)) {
			return;
		} else {
			await scEra.applyMod(key);
		}
	});
	console.timeLog("scEra startup");
	slog("log", "Finish to apply modules.");

	//apply the class
	slog("log", "Applying classes to global namespace...");
	applyClass();
	console.timeLog("scEra startup");
	slog("log", "Finish to apply classes.");

	jQuery(document).trigger("scEra:apply");
});

//-----------------------------------------------------------
//
//   scEra.init
//
//-----------------------------------------------------------

$(document).one("scEra:apply", async function () {
	slog("log", "All modules are applied successfully. Start to initialization...");
	console.timeLog("scEra startup");

	console.log(scEra.startupInit);

	scEra.startupInit.forEach(async (key) => {
		slog("log", `Start to run initialization function ${key}...`);
		let func = scEra.initialization[key];
		if (func && typeof func === "function") await func();
		else slog("warn", `Initialization function ${key} is not found, skipping...`);
	});

	slog("log", "All initialization functions are applied successfully.");
	jQuery(document).trigger(":modulesloaded");
	jQuery.event.trigger({ type: ":afterload" });
});

$(document).one(":modulesloaded", () => {
	slog("log", "All modules are loaded successfully.");
	console.timeEnd("scEra startup");
	scEra.status = "storyready";
});

$(document).one(":storyready", () => {
	slog("log", "Story is ready.");
});
