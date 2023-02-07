import { Dict } from "../types";
declare var D: typeof window.D;

export interface Talent {
	type: "talent" | "trait";
	name: [string, string?];
	des: [string, string?];

	rate?: number;

	effect?: Function;
}

export interface Trait extends Talent {
	id: string;
	order: number;
	group: string;
	conflict: string[];
	get: any;
	lose: any;

	onOrder?: Function;
	onSource?: Function;
	onFix?: Function;
}

export interface setTrait {
	id?: string;
	name: string | string[];
	des: string | string[];
	order?: number;
	group: string;
	conflict?: string[];
	sourceEffect?: Array<[string, number, string?]>;
	rate?: number;
}

export class Talent {
	constructor(name: [string, string?], des: [string, string?], rate: number = 0.1) {
		this.type = "talent";
		this.name = name;
		this.des = des;
		this.effect = function () {};
		this.rate = rate;
	}
	Effects(callback) {
		this.effect = callback;
		return this;
	}
}

export class Trait extends Talent {
	static data: Dict<Trait>;
	public static async init() {
		D.traits.forEach((obj) => {
			let id;
			if (typeof obj.name == "string") id = obj.name;
			else id = `${obj.name[1] || obj.name[0]}`;
			obj.id = id;
			Trait.data[id] = new Trait(obj as setTrait);
		});
		console.log(Trait.data);
	}
	public static set(type, name) {
		const traitdata = Object.values(Trait.data).filter((trait) => {
			return trait.name.includes(name) && trait.type == type;
		});

		if (traitdata) {
			return traitdata[0];
		} else {
			console.log("trait has not found:", name);
			return null;
		}
	}
	public static get(type: "trait" | "talent", name: string, key: string = "", event?: string) {
		const traitdata = this.set(type, name);
		if (traitdata) {
			if (key == "") {
				return traitdata;
			}
			if (traitdata[key] && event) {
				return traitdata[key](event);
			}
			if (traitdata[key]) return traitdata[key];
			else {
				console.log("key has not found:", name, key);
				return null;
			}
		} else {
			return null;
		}
	}
	public static list(type) {
		return Object.values(Trait.data).filter((trait) => {
			return trait.group == type;
		});
	}
	constructor({ id, name, des, order, group, rate, sourceEffect, conflict } = <setTrait>{}) {
		if (typeof name == "string") {
			name = [name, name];
		}
		if (typeof des == "string") {
			des = [des, des];
		}
		super(name as [string, string?], des as [string, string?], rate);
		this.type = "trait";
		this.id = id;
		this.order = order;
		this.group = group;
		this.get = {};
		this.lose = {};
		this.conflict = conflict;

		this.init(sourceEffect);
	}
	init(source) {
		if (source?.length) {
			source.forEach(([key, value, option]) => {
				if (option) {
					this.lose[key] = value;
				} else {
					this.get[key] = value;
				}
			});
		}
	}

	initConflict(conflict) {
		//let traitname in conflict to be trait id
		conflict.forEach((traitname, index) => {
			conflict[index] = Trait.get("trait", traitname).id;
		});
		this.conflict = conflict;
	}

	Order(callback) {
		this.onOrder = callback;
		return this;
	}
	Source(callback) {
		this.onSource = callback;
		return this;
	}
	Fix(callback) {
		this.onFix = callback;
		return this;
	}
}

Trait.data = <Dict<Trait>>{};

export function findConflic(source, conflicGroup) {
	let conflicArr = source.filter((val) => conflicGroup.includes(val));
	if (conflicArr.length < 2) {
		return source;
	} else {
		let index = random(conflicArr.length - 1);
		source.delete(conflicGroup);
		source.push(conflicArr[index]);
		return source;
	}
}

export async function InitTraitsConflict() {
	Object.values(Trait.data).forEach((trait) => {
		if (trait.conflict) {
			trait.initConflict(trait.conflict);
		}
	});
}

export const traitslist: Array<setTrait> = [
	{
		name: ["盲目", "Blind"],
		group: "mental",
		conflict: ["狂热"],
		des: [
			"你总是在做出错误的决定。你的所有技能检定都有-1减值。",
			"You always make the wrong decision. All your skill checks have a -1 penalty.",
		],
		order: 2,
	},
	{
		name: ["狂热", "Fanatic"],
		group: "mental",
		conflict: ["盲目"],
		des: [
			"你的信仰是你生命的全部。你的所有技能检定都有+1加值。",
			"Your faith is your life. All your skill checks have a +1 bonus.",
		],
		order: 2,
	},
];

export const talentlist = [
	{
		name: ["笨蛋", "Idiot"],
		des: ["你的智力是-2。", "Your intelligence is -2."],
	},
];
