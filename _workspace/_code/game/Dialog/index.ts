export * from "./initFunc";
export * from "./main";
export * from "./utils";

import { Dialogs } from "./main";
import { InitDialogMain } from "./initFunc";
import { converTxt, flow, setMsg, resetMsg, errorView } from "./utils";

const module = {
	name: "Dialogs",
	des: "A flow type dialog system.",
	version: "1.0.0",
	classObj: {
		Dialogs,
	},
	func: {
		Init: {
			InitDialogMain,
		},
		P: {
			flow,
			txt: converTxt,
			msg: setMsg,
			error: errorView,
			resetMsg,
		},
	},
	Init: ["InitDialogMain"],
};

declare function addModule(module): boolean;
addModule(module);
