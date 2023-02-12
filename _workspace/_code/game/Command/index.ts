export * from "./com";
export * from "./main";
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
	dependencies: ["Dialogs", "Kojo"],
};

declare function addModule(modules): boolean;
addModule(modules);
