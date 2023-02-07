import {
	Dict,
	P,
	ablkey,
	appearance,
	basekey,
	bodypartInfo,
	creaturetype,
	genderFull,
	palamkey,
	sblkey,
	statskey,
} from "../types";
import { Organs } from "./Organs";
import { Species } from "./Species";

declare function groupmatch(arg, ...args): boolean;
declare function lan(arg, ...args): string;
declare function slog(type: "log" | "warn" | "error", ...args): void;
declare function isValid(arg): boolean;
declare function NameGenerator(gender: genderFull): string;
declare var scEra: typeof window.scEra;
declare var D: typeof window.D;

export interface Creature {
	type?: creaturetype; // only use in the database
	id?: string; //the id in the database
	cid?: string; //the id of character

	name: string; //the name of the creature
	gender: genderFull;
	species: string;

	//the traits to define who the creature is
	traits: string[];
	//the talent to define what the creature can do
	talent: string[];

	//the skill they own, the skill is mean specific skills. like thunderbolt, fireball, etc.
	skill: string[];

	//the basic stats of the creature
	stats: Dict<P, statskey>;
	//the base needs and palameters
	base: Dict<P, basekey>;
	//the palameters of the creature
	palam: Dict<P, palamkey>;

	//the appearance information of the creature
	appearance?: appearance;

	//the body parts of the creature
	body: Dict<Organs | bodypartInfo>;
	bodysize: number;

	//sources
	source: Dict<number>;
	//states
	state: string[];

	//temporal situation value
	tsv: any;
	//abilities
	abl: Dict<{ lv: number; exp: number }, ablkey>;
	//sexual or situation abilities
	sbl: Dict<number, sblkey>;

	//the equipment of creature is wearing
	equip?: any;

	//a temporary value to store species data
	r?: Species;

	//a flag to indicate if the creature is a random generated character
	randomchara?: boolean;
}

export class Creature {
	static data: Dict<Creature>;
	static newId(species) {
		const len = Object.keys(Creature.data).length;
		return `${species}_${len}`;
	}
	constructor(obj = {} as Creature) {
		const { type = "charatemplate", species = "Human" } = obj;
		this.type = type;
		this.species = species;
		this.id = Creature.newId(species);

		this.preInit(obj);
	}
	preInit(obj = {} as Creature) {
		const { name, gender } = obj;

		this.r = Species.data[this.species];

		this.name = name;

		if (gender) {
			this.gender = gender;
		} else {
			let g: genderFull[] = ["female", "herm", "male"];
			this.gender = g[random(2)];
		}

		if (!this.name) {
			this.name = NameGenerator(this.gender);
			this.randomchara = true;
		}

		if (!this.r) {
			this.init();
		} else {
			this.init();
			this.initSpecies();
		}
	}
	init() {
		this.traits = [];
		this.talent = [];
		this.skill = [];

		this.initStats();
		this.initBase();
		this.initPalam();

		this.appearance = {};
		this.body = {};
		this.bodysize = 0;

		this.state = [];
		this.tsv = {};
		this.initAbility();
		this.equip = {};
	}
	initStats() {
		this.stats = {};
		D.stats.forEach((key) => {
			let v = random(5, 18);
			this.stats[key] = [v, v];
		});
		return this;
	}
	initBase() {
		this.base = {};
		Object.keys(D.basicNeeds).forEach((key) => {
			this.base[key] = [1000, 1000];
		});
		Object.keys(D.basicPalam).forEach((key) => {
			this.base[key] = [0, 1200];
		});
		return this;
	}

	initPalam() {
		this.palam = {};
		this.source = {};
		Object.keys(D.palam).forEach((key) => {
			this.palam[key] = [0, 1200];
			this.source[key] = 0;
		});
		return this;
	}
	initAbility() {
		this.abl = {};
		this.sbl = {};
		Object.keys(D.abl).forEach((key) => {
			this.abl[key] = { lv: 0, exp: 0 };
		});
		Object.keys(D.sbl).forEach((key) => {
			this.sbl[key] = 0;
		});
	}
	initBodyDefault() {
		this.body = {};
		this.bodysize = 0;
		D.basicBodypart.forEach((key) => {
			this.body[key] = {
				type: "natural",
				dp: [10, 10],
				hediff: [],
			};
		});
	}
	initAppearance() {
		this.appearance = {
			eyecolor: "blue",
			haircolor: "brown",
			skincolor: "white",
		};
	}
}

Creature.data = {};
