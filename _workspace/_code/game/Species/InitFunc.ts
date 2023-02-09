import { Species } from "./Species";
import { bodyDict, bodyGroup, posDict } from "./bodyparts";
declare function groupmatch(arg, ...args): boolean;
declare function slog(type: string, ...args: any[]): void;

export function fixLanArr(obj) {
	const lang = ["CN", "EN", "JP"];
	let result = [];
	for (const [key, value] of Object.entries(obj)) {
		if (Array.isArray(value) && value[0].lan) {
			value.forEach((obj) => {
				const i = lang.indexOf(obj.lan);
				delete obj.lan;
				let k = Object.keys(obj)[0];
				result[i] = obj[k];
			});
			obj[key] = result;
			result = [];
		}
	}
}

export function initBodyObj(body) {
	const bodytype = body.type;

	const fixkey = function (obj, key) {
		if (obj[key] && Array.isArray(obj[key])) {
			obj.parts = obj[key];
			delete obj[key];
		} else if (obj[key] && typeof obj[key] === "string") {
			obj.name = obj[key];
			delete obj[key];
		}
	};

	const fillObj = function (obj, key, parent?) {
		if (groupmatch(key, "group", "option", "sens", "size", "config", "setting", "tags")) return;

		if (!obj.name) obj.name = key;
		if (parent?.name && !obj.group) obj.group = parent.name;
		if (!obj.type) obj.type = parent?.type || bodytype || "natural";
		if (!obj.count && key !== "organs") obj.count = 1;
	};

	const fixObj = function (obj) {
		for (let [key, value] of Object.entries(obj)) {
			//fix the position and side
			if (typeof value === "string" && posDict[value]) {
				obj[key] = posDict[value];

				//fix the position and side
			} else if (typeof value === "string" && value.includes("/")) {
				let side = value.split("/");
				side = side.map((s) => posDict[s]);
				obj[key] = side;
			} else if (typeof value === "object" && !Array.isArray(value)) {
				//fix the keyname
				let v: any = value;

				fixkey(v, key);
				fillObj(v, key, obj);

				//go deeper
				fixObj(value);

				//otherwise, just keep it
			} else {
				obj[key] = value;
			}
		}
	};
	//fix the position and side, extend it.
	fixObj(body);

	body.parts = listAllParts(body);
	body.settings = {};
	//organaize all the part to detailsettings
	for (const [key, value] of Object.entries(body)) {
		if (bodyDict[key]) {
			body.settings[key] = value;
			delete body[key];
		}
	}

	return body;
}

export function listAllParts(obj) {
	let parts = Object.keys(obj);

	const listObj = function (obj) {
		for (let key in obj) {
			let value = obj[key];
			if (value.parts) {
				parts = parts.concat(value.parts);
			}
			if (typeof value === "object" && !Array.isArray(value)) {
				parts = parts.concat(Object.keys(value));
				listObj(value);
			}
		}
	};
	listObj(obj);
	//remove duplicate
	parts = [...new Set(parts)];
	parts = parts.filter((part) => bodyDict.hasOwnProperty(part) && !bodyGroup.includes(part));
	return parts;
}

declare var scEra: typeof window.scEra;

export function InitSpecies() {
	let xml: Map<string, any> = scEra.xml;
	xml.forEach((value, key) => {
		if (key.includes("Species")) {
			let obj = value.race;
			fixLanArr(obj);
			Species.data[obj.id] = new Species(obj);
		}
	});
	slog("log", "All Species Loaded: ", Species.data);
}
