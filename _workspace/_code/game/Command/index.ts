export * from "./com";

import { Com, InitComMacros, InitComList } from "./com";

const modules = {
	name: "Command",
	des: "A classic era-like command system.",
	version: "1.0.0",
	database: Com.data,
	classObj: {
		Com,
	},
	func: {
		Init: {
			InitComMacros,
			InitComList,
		},
	},
	config: {
		globaldata: true,
	},
	Init: ["InitComMacros", "InitComList"],
};

declare function addModule(modules): boolean;
addModule(modules);
