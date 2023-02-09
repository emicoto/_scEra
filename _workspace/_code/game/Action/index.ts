export * from "./Action";
export * from "./initFunc";
export * from "./utils";

import { Action } from "./Action";
import { InitActionList, InitKojoAction } from "./initFunc";
import {} from "./utils";

const modules = {
	name: "Action",
	version: "1.0.0",
	des: "Action module for interaction",
	data: {},
	database: Action.data,
	classObj: {
		Action,
	},
	func: {
		Init: {
			InitActionList,
			KojoAction: InitKojoAction,
		},
	},
	config: {
		globalFunc: {},
		globaldata: true,
	},
	Init: ["InitActionList"],
};

declare function addModule(modules): boolean;
addModule(modules);
