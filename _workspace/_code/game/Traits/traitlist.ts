import { InitTraitsConflict, setTrait, Trait } from "./Trait";
declare var D: typeof window.D;
declare function getJson(path: string): Promise<any>;
declare function slog(type: "log" | "warn" | "error", ...args: any[]): void;
declare function dlog(type: "log" | "warn" | "error", ...args: any[]): void;

export async function TraitList() {
	let list: setTrait[] = [];

	let conflict = [];

	let loadjson = await getTraitJson();
	slog("log", `Get file list from json`, loadjson);
	if (loadjson) {
		list = list.concat(loadjson.list);
		conflict = conflict.concat(loadjson.conflict);
	}

	//add conflict to trait
	for (const cf of conflict) {
		for (const name of cf) {
			const trait = list.find((trait) => trait.name.includes(name));
			if (!trait) continue;

			if (!trait?.conflict) {
				trait.conflict = [];
			}
			let conf = cf.filter((traitname) => traitname !== name);
			trait.conflict = trait.conflict.concat(conf);
			//remove duplicate
			trait.conflict = [...new Set(trait.conflict)];
		}
	}

	D.traits = D.traits.concat(list);
	Trait.init();
	InitTraitsConflict();
	//after all trait init to database, delete and release it from memory
	setTimeout(() => {
		delete D.traits;
	}, 2000);
}

export async function getTraitJson() {
	let list: setTrait[] = [];
	let conflict: string[][] = [];

	const filesData: any[] | void = await getJson("./data/traits.json").then((res) => {
		slog("log", "Get file list from traits.json:", res);
		return res;
	});

	if (filesData) {
		filesData.forEach(([filename, trait]) => {
			dlog("log", "Get traits from " + filename, trait);
			//if is conflict file
			if (filename.includes("conflict")) {
				//ensure is array
				if (!Array.isArray(trait)) {
					slog("warn", "Error: format error, skip this file. conflict file must be array:", trait);
				}
				conflict = conflict.concat(trait);
			}

			//if is trait file
			else if (Array.isArray(trait)) {
				if (trait.length === 0) {
					slog("warn", "Error: format error, skip this file. trait file must be array and not empty:", trait);
				}
				//ensure the format is correct
				if (trait[0].name && trait[0].group && trait[0].des) {
					list = list.concat(trait);
				} else {
					slog("warn", "Error: format error, skip this file:", trait);
				}
			}
		});
		dlog("log", "Get all the list done:", list, conflict);
	}
	return { list, conflict };
}
