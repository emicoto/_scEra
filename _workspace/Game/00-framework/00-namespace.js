/**
 *
 * All the global shortcuts are defined here.
 * You can extend any variable or function by adding it to the list below.
 * Don't try to edit any variable under the window.Era namespace.
 *
 */
const Errors = {};
const Perflog = {};

(() => {
	//------------------------------------------------------------------------------
	//
	// write in the self execute function to prepend the local value won't effect other scripts
	//
	//------------------------------------------------------------------------------
	const list = ["Base", "Stats", "Palam", "Source", "Sup", "Cflag", "Tsv", "Exp", "Juel", "Using", "Liquid", "Skin"];

	Object.defineProperties(window.game, {
		State: { value: State },
		Errors: { value: Errors },
		Perflog: { value: Perflog },
	});

	list.forEach((name) => {
		window.game[name] = {};
	});

	defineGlobalNamespaces(window.game);

	const shortcuts = {
		Errors: window.game.Errors,
		Perflog: window.game.Perflog,
	};

	defineGlobalShortcuts(shortcuts);

	// those properties are not defined at this point, so we just define them as empty objects
	Object.defineProperties(window, {
		player: {
			get: () => State.variables.player,
		},
		target: {
			get: () => State.variables.target,
		},
	});

	console.timeLog("scEra startup");

	slog("log", "All the namespace are registered in window.game and window.scEra.");

	//------------------------------------------------------------------------------
})();
