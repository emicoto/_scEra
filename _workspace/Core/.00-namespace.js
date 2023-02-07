/**
 * @name slog
 * @description it is a shortcut for console.log, console.warn, console.error with format and time.
 * @param {'log'|'warn'|'error'} type
 * @param  {...any} args
 */
const slog = function (type = "log", ...args) {
	if (!["log", "warn", "error"].includes(type)) {
		args.unshift(type);
		type = "log";
	}
	console[type](`[${type}] ${new Date().toLocaleTimeString()} |`, ...args);
};

const dlog = function (type = "log", ...args) {
	if (!["log", "warn", "error"].includes(type)) {
		args.unshift(type);
		type = "log";
	}
	if (Config.debug) console[type](`[${type}] ${new Date().toLocaleTimeString()} |`, ...args);
};

/**
 * @name now
 * @description it is a shortcut for new Date().toLocaleTimeString()
 * @returns {string} the current time in the format of hh:mm:ss
 */
const now = () => new Date().toLocaleTimeString();
window.slog = slog;
window.now = now;

/**
 * @namespace
 * @name Era
 * @description
 * The Era namespace is the root namespace for all of the Era modules.
 * All the variables and functions names must follow this rules:
 * 1. All the variables and functions names must be in camelCase.
 * 2. All the variables and functions names must be in English.
 * 3. If need to use number in the name, it must be like this: name_1, name_2.
 * 4. If the name is a abbreviation, it must be all in upper case.
 */
window.scEra = {
	/**
	 * @namespace
	 * @name scEra.loadOrder
	 * @description
	 * The scEra.loadOrder namespace is the root namespace for all of the Era core load order modules.
	 */
	loadorder: {},

	/**
	 * @namespace
	 * @name scEra.data
	 * @description
	 * The scEra.data namespace is the root namespace for all of the data that is used to configure the main system and games.
	 * @see {@link scEra.data}
	 */
	data: {},

	/**
	 * @namespace
	 * @name scEra.database
	 * @description
	 * The scEra.database namespace is the root namespace for all games data that is used to the game modules.
	 * @see {@link scEra.database}
	 */
	database: {},

	/**
	 *
	 *  document files
	 *
	 */

	csv: new Map(),
	xml: new Map(),
	table: new Map(),
	template: {},

	/**
	 * @namespace
	 * @name scEra.utils
	 * @description
	 * The scEra.utils namespace is the root namespace for all the utils functions that are hard to categorize.
	 * @see {@link scEra.utils}
	 */
	utils: {},

	/**
	 * @namespace
	 * @name scEra.documentGenerator
	 * @description
	 * The scEra.documentGenerator namespace is the root namespace for all the functions that are used to generate the text/html...any document.
	 * @see {@link scEra.documentGenerator}
	 */
	documentGenerator: {},

	/**
	 * @namespace
	 * @name scEra.modules
	 * @description
	 * The scEra.modules namespace is the root namespace for all the game modules.
	 * the modules are the main part of the game, they are the main functions that are used to run the game.
	 * the modEvents and mods is an API that used to load and manage player mods.
	 * @see {@link scEra.mPodules}
	 */
	modules: {},
	modEvents: {},
	mods: {},
	modlist: [],

	/**
	 * @namespace
	 * @name scEra.config
	 * @description
	 * The scEra.config namespace is the root namespace for configuration data that is used to configure the system and games.
	 * @see {@link scEra.config}
	 */
	config: {},

	/**
	 * @namespace
	 * @name scEra.UIControl
	 * @description
	 * The scEra.UI namespace is the root namespace for all UI controls. These are the controls that are used to build the UI or change the UI.
	 * @see {@link scEra.data}
	 */
	UIControl: {},

	/**
	 * @namespace
	 * @name scEra.conditions
	 * @description
	 * The scEra.conditions namespace is the root namespace for all the game conditions short cuts.
	 * @see {@link scEra.conditions}
	 */
	conditions: {},

	/**
	 * @namespace
	 * @name scEra.fixer
	 * @description
	 * The scEra.fixer namespace is the root namespace for all the fixer functions.
	 * @see {@link scEra.fixer}
	 */
	fixer: {},

	/**
	 * @namespace
	 * @name scEra.classObj
	 * @description
	 * The scEra.classObj namespace is the root namespace for all the class objects.
	 * @see {@link scEra.classObj}
	 */
	classObj: {},

	/**
	 * @namespace
	 * @name scEra.language
	 * @description
	 * The scEra.language namespace is the root namespace for all the language data and functions.
	 * @see {@link scEra.language}
	 */
	language: {},

	/**
	 * @namespace
	 * @name scEra.initialization
	 * @description
	 * The scEra.initialization namespace is the root namespace for all the initialization functions should initialize at the beginning of the game.
	 */
	initialization: {},

	/**
	 * @namespace
	 * @name scEra.game
	 * @description
	 * The scEra.game namespace is the root namespace for game variables.
	 * @see {@link scEra.game}
	 */
	game: {},
};

Object.defineProperties(window, {
	Config: { get: () => scEra.config },
	game: { value: scEra.game, writable: false },
	Mod: { value: scEra.modules, writable: false },
});

console.log("Era namespace is ready.");

/* Make each of these namespaces available at the top level as well */
window.defineGlobalNamespaces = (namespaces) => {
	Object.entries(namespaces).forEach(([name, namespaceObject]) => {
		try {
			if (window[name] && window[name] !== namespaceObject) {
				slog(
					"warn",
					`Attempted to set ${name} in the global namespace, but it's already in use. Skipping this assignment. Existing Object:`,
					window[name]
				);
			} else {
				/* Make it more difficult to shadow/overwrite things (users can still Object.defineProperty if they really mean it) */
				Object.defineProperty(window, name, { value: namespaceObject, writeable: false });
			}
		} catch (e) {
			if (window[name] !== namespaceObject) {
				slog("error", `Failed to setup global namespace object ${name}. Attempting to continue. Source Error:`, e);
			}
		}
	});
};

slog("log", `Era just started.`);

//------------------------------------------------------------------------------
//
//   Shortcuts
//
//------------------------------------------------------------------------------

window.defineGlobalShortcuts = (shortcuts) => {
	Object.entries(shortcuts).forEach(([name, shortcutObject]) => {
		try {
			if (window[name] && window[name] !== shortcutObject) {
				slog(
					"warn",
					`Attempted to set ${name} in the global namespace, but it's already in use. Skipping this assignment. Existing Object:`,
					window[name]
				);
			} else {
				/* make a short cut getter for the object */
				Object.defineProperty(window, name, {
					get: () => shortcutObject,
					writeable: false,
				});
			}
		} catch (e) {
			if (window[name] !== shortcutObject) {
				slog("error", `Failed to setup global shortcut object ${name}. Attempting to continue. Source Error:`, e);
			}
		}
	});
};

// defineGlobalShortCuts
// use a self excuting function to define the shortcuts, prevents the shortcuts from being overwritten.
(() => {
	const shortcuts = {
		D: scEra.data,
		Db: scEra.database,
		F: scEra.utils,
		L: scEra.language,
		M: scEra.modules,
		P: scEra.documentGenerator,
		Cond: scEra.conditions,
		Fix: scEra.fixer,
		Init: scEra.initialization,
		Ui: scEra.UIControl,
	};

	defineGlobalShortcuts(shortcuts);
})();

//------------------------------------------------------------------------------
window.addEventListener("error", (event) => {
	console.log(`[error] ${now()} | caught error :`);
	console.log(event);
});
