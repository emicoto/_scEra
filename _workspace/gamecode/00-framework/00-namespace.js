/**
 *
 * All the global shortcuts are defined here.
 * You can extend any variable or function by adding it to the list below.
 * Don't try to edit any variable under the window.Era namespace.
 *
 */

const list = ["Base", "Stats", "Palam", "Source", "Sup", "Cflag", "Tsv", "Exp", "Juel", "Using", "Liquid", "Skin"];
const Errors = {};
const Perflog = {};

Object.defineProperties(window.game, {
	State: { value: State },
});

Object.defineProperties(window.scEra, {
	Errors: { value: Errors },
	Perflog: { value: Perflog },
});

list.forEach((name) => {
	window.game[name] = {};
});

defineGlobalNamespaces(window.game);

const shortcuts = {
	Story: Story,
	Wikifier: Wikifier,
	State: State,

	Errors: window.scEra.Errors,
	Perflog: window.scEra.Perflog,
};

defineGlobalShortcuts(shortcuts);

// those properties are not defined at this point, so we just define them as empty objects
Object.defineProperties(window, {
	V: { get: () => State.variables },
	T: { get: () => State.temporary },
	S: { get: () => window.scEra.setup },
	C: { get: () => State.variables.chara },
	Flag: {
		get: () => State.variables.flag,
	},
	tc: { get: () => State.variables.tc, set: (v) => (State.variables.tc = v) },
	pc: {
		get: () => State.variables.pc,
		set: (v) => (State.variables.pc = v),
	},
	player: {
		get: () => State.variables.chara[pc],
	},
	target: {
		get: () => State.variables.chara[tc],
	},
});

console.timeLog("scEra startup");

slog("log", "All the namespace are registered in window.game and window.cEra.");
slog("log", "Checking the SugarCube state, story, setup:", State.variables);

Config.lan = State.variables.lan || "CN";
