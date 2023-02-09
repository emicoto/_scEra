import { Action } from "./Action";

declare var scEra: typeof window.scEra;

export const InitActionList = function () {
	let tables = scEra.table.get("ActionList") as any;
	for (const type of Object.keys(tables)) {
		let list = tables[type];
		//init all the list
		list.forEach((data) => {
			if (data.actPart) data.actPart = extendParts(data.actPart);
			if (data.targetPart) data.targetPart = extendParts(data.targetPart);

			Action.data[data.id] = new Action(type, data);
		});
	}
	console.log("ActionList", Action.data);
};

export const InitKojoAction = function () {};

const extendParts = function (raw) {
	let list = "mbpcvauehfnsrgd";
	let re = raw;

	if (raw.match(/^--\S+$/)) {
		raw = raw.replace("--", "");
		for (let i in raw) {
			list = list.replace(raw[i], "");
		}
		re = list;
	}

	if (raw == "all") {
		re = list;
	}

	const part = {
		m: "mouth",
		b: "breast",
		p: "penis",
		c: "clitoris",
		v: "vagina",
		a: "anal",
		u: "urin",
		e: "ears",
		h: ["handL", "handR"],
		f: "foot",
		n: "neck",
		s: "butts",
		r: "nipple",
		g: "thighs",
		d: "abdomen",
	};

	const arr = re
		.split("")
		.map((char) => part[char])
		.flat();
	return arr;
};
