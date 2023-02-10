export * from "./com";

import { Com } from "./com";
import { InitComList, InitComSystem } from "./initFunc";

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
			InitComList,
			InitComSystem,
		},
	},
	config: {
		globaldata: true,
	},
	Init: ["InitComList", "InitComSystem"],
};

declare function addModule(modules): boolean;
addModule(modules);
