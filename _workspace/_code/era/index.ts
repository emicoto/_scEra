import { applyClass, loadBasicDefinationJson } from "./main";
import { loadJson } from "./utils";

export * from "./utils";
export * from "./version";
export * from "./main";

declare global {
	interface Window {
		game: {
			InitStory: () => void;
		};
	}
}

declare var scEra: typeof window.scEra;
declare function slog(type: "log" | "warn" | "error", ...args: any[]): void;
declare function dlog(type: "log" | "warn" | "error", ...args: any[]): void;
declare var jQuery: typeof window.jQuery;
declare var V: typeof window.V;
//-------------------------------------------------------------
//
//   startup
//
//-------------------------------------------------------------
console.time("scEra startup");
$(document).one("sugarcube:startup", async () => {
	let config = await loadJson("config.json");
	if (config.loadorder) {
		scEra.loadorder = config.loadorder;
	}
	if (config.disable) {
		config.disable.forEach((modid) => {
			scEra.config.mod.disable[modid] = true;
		});
	}

	await loadBasicDefinationJson();
	console.timeLog("scEra startup");

	scEra.status = "ready";
});

$(document).one("Era:start", () => {
	scEra.config.onEra = true;
	scEra.status = "start";

	// those properties are not defined at this point, so we just define them as empty objects
	Object.defineProperties(window, {
		Story: { value: scEra.story, writable: false },
		Wikifier: { value: scEra.wikifier },
		V: { get: () => scEra.state.variables },
		T: { get: () => scEra.state.temporary },
		C: { get: () => scEra.state.variables.chara },
		Flag: {
			get: () => scEra.state.variables.flag,
		},
	});

	console.log("variables is ready:", V);
	// delete parser that adds unneeded line breaks -ng
	scEra.wikifier.Parser.delete("lineBreak");
});

$(document).one(":initstorydata", () => {
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
$(document).one("scEra:ready", async () => {
	slog("log", "Start to apply modules:", Object.keys(scEra.modules).join(", "));

	for (let i = 0; i < scEra.loadorder.length; i++) {
		const key = scEra.loadorder[i];

		if (!scEra.modules[key]) {
			slog("warn", `Module ${key} is not loaded. Skipping this module.`);
			scEra.loadorder.splice(i, 1);
			i--;
		}

		if (scEra.config.mod.disable[key]) {
			dlog("warn", `Module ${key} is disabled in config. Skipping this module.`);
			scEra.loadorder.splice(i, 1);
			delete scEra.modules[key];
			i--;
			continue;
		}

		await scEra.applyMod(key);
	}

	for (const key in scEra.modules) {
		if (scEra.loadorder.includes(key)) {
			continue;
		}

		if (scEra.config.mod.disable[key]) {
			dlog("warn", `Module ${key} is disabled in config. Skipping this module.`);
			delete scEra.modules[key];
			continue;
		}

		await scEra.applyMod(key);
	}

	console.timeLog("scEra startup");
	slog("log", "Finish to apply modules.");

	//apply the class
	slog("log", "Applying classes to global namespace...");
	applyClass();
	console.timeLog("scEra startup");
	slog("log", "Finish to apply classes.");

	scEra.status = "initmodules";
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
	for (let i = 0, iend = scEra.startupInit.length; i < iend; i++) {
		slog("log", `Start to run initialization function ${scEra.startupInit[i]}...`);
		let func = scEra.initialization[scEra.startupInit[i]];
		if (func && typeof func === "function") await func();
		else slog("warn", `Initialization function ${scEra.startupInit[i]} is not found, skipping...`);
	}

	console.timeLog("scEra startup");
	slog("log", "All initialization functions are applied successfully.");

	scEra.status = "modulesready";
	jQuery(document).trigger("modules:init");
});

$(document).one("modules:init", () => {
	//start to init the scripting.
	////start to init the maps, game, characters, etc.

	slog("log", "All modules are loaded successfully.");
	console.timeLog("scEra startup");

	jQuery(document).trigger("modules:loaded");
});

$(document).one("modules:loaded", () => {
	//everything is ready
	scEra.status = "storyready";
});

$(document).one(":storyready", () => {
	console.timeEnd("scEra startup");
	slog("log", "Story is ready.");
});
