export * from "./main";

import { Kojo, convertKojo, checkTxtWithCode, countText } from "./main";

const module = {
	name: "Kojo",
	version: "1.0.0",
	des: "A management system for character event, custom action, schedule, etc.",
	database: Kojo.data,
	classObj: {
		Kojo,
	},
	func: {
		P: {
			convertKojo,
			checkTxtWithCode,
			countText,
		},
	},
	dependencies: ["Dialog"],
};

declare function addModule(module): boolean;
addModule(module);
