import { getJson } from "./utils";
declare var scEra: typeof window.scEra;
declare function slog(type: "log" | "warn" | "error", ...args: any[]): void;
declare function dlog(type: "log" | "warn" | "error", ...args: any[]): void;
declare var D: typeof window.D;
declare var V: typeof window.V;
declare var F: typeof window.F;
declare var game: typeof window.game;
//--------------------------------------
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

	dlog("log", `Module ${modules.name} is registered.`);
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
		dlog("log", `Class ${key} applied successfully.`);
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
export async function loadBasicDefinationJson() {
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

game.InitStory = function () {
	V.system = S.gameConfig;
	V.flag = S.gameFlags;

	for (const [key, value] of Object.entries(S.gameVars)) {
		V[key] = value;
	}

	V.date = {
		year: S.date[0],
		month: S.date[1],
		day: S.date[2],
		time: S.date[3],
	};

	V.location = {
		name: "",
		mapId: "",
		printname: "",
		chara: [],
	};

	V.event = {};
};

/* Define macro, passing arguments to function and store them in $args, preserving & restoring previous $args
 */
function definemacro(macroName, macroFunction, tags, skipArgs) {
	scEra.macro.add(macroName, {
		isWidget: true,
		tags,
		skipArgs,
		handler() {
			try {
				const oldArgs = SugarCube.State.temporary.args;
				SugarCube.State.temporary.args = this.args.slice();
				macroFunction.apply(this, this.args);
				if (typeof oldArgs === "undefined") {
					delete SugarCube.State.temporary.args;
				} else {
					SugarCube.State.temporary.args = oldArgs;
				}
			} catch (e) {
				slog("error", `Error while executing macro ${macroName}:`, e);
			}
		},
	});
}

/**
 * Define macro, where macroFunction returns text to wikify & print
 */
const DefineMacro = function (macroName, macroFunction, tags, skipArgs, maintainContext) {
	definemacro(
		macroName,
		function () {
			$(this.output).wiki(macroFunction.apply(maintainContext ? this : null, this.args));
		},
		tags,
		skipArgs
	);
};

Object.defineProperties(window, {
	DefineMacros: { get: () => DefineMacro },
	defineMacro: { get: () => definemacro },
});
