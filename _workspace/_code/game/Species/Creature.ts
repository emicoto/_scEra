import { Organs, Species, GenerateHeight, GenerateWeight, RandomSpeciesName } from ".";
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

declare function lan(arg, ...args): string;
declare function slog(type: "log" | "warn" | "error", ...args): void;
declare function draw(arr: any[]): any;
declare var D: typeof window.D;

export interface Creature {
	type?: creaturetype; // only use in the database
	id?: string; //the id in the database

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

	//the comfortable temperature of the creature
	temper?: {
		min?: number;
		max?: number;
		best?: number;
		body?: number;
	};

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
		const { type = "charatemplate", species = "human" } = obj;
		this.type = type;
		this.species = species;
		this.id = Creature.newId(species);

		this.name = "";
		this.gender = "none";
		this.traits = [];
		this.talent = [];
		this.skill = [];
		this.stats = {};
		this.base = {};
		this.palam = {};
		this.appearance = {};
		this.body = {};
		this.bodysize = 1;
		this.source = {};
		this.state = [];
		this.tsv = {};
		this.abl = {};
		this.sbl = {};
	}

	Init(obj = {} as Creature) {
		const { name = "", gender = "" } = obj;
		console.log("init creature:", obj);
		this.r = Species.data[this.species];

		this.name = name;

		if (gender) {
			this.gender = gender;
		} else {
			let g: genderFull[] = ["female", "herm", "male"];
			this.gender = g[random(2)];
		}

		if (!this.name) {
			if (!this.r) this.name = lan(draw(D.randomCharaNamePool));
			else this.name = RandomSpeciesName(this.species);
			this.randomchara = true;
		}

		this.InitCommon();

		if (this.r) {
			this.initSpecies(obj);
		}

		if (this.randomchara) {
			this.RandomInitDefault();
		}

		return this;
	}
	InitCommon() {
		this.initStats();
		this.initBase();
		this.initPalam();

		this.initAbility();
		this.initEquipment();
	}

	RandomInitDefault() {
		this.randomStats();
		this.randomAbility();
		this.randomSituAbility();
		if (!this.r) {
			this.RandomInitBody();
			this.RandomInitApp();
		} else {
			let adj = { bodysize: random(5), breasts: { sizeLv: this.gender === "male" ? 0 : random(10) } };
			this.initSpecies(adj);
		}
	}

	initSpecies(obj = {} as any) {
		this.bodysize = obj.bodysize || random(5);
		this.initApp(obj);
		this.body = this.r.configureBody(this.gender, this.appearance.height, obj);
		this.initTalent(obj);
		this.initTraits(obj);
		this.initSkill(obj);

		if (this.r.temper) this.temper = this.r.temper;
	}
	initTraits(obj = {} as any) {
		this.traits = this.r.initTraits() || [];
		if (!obj.traits) return;

		if (typeof obj.traits === "string") {
			this.traits.push(obj.traits);
		} else if (Array.isArray(obj.traits)) {
			this.traits = this.traits.concat(obj.traits);
		} else {
			slog("error", "TypeError: traits must be string or array:", obj.traits);
		}
	}
	initTalent(obj = {} as any) {
		this.talent = this.r.initTalent() || [];
		if (!obj.talent) return;

		if (typeof obj.talent === "string") {
			this.talent.push(obj.talent);
		} else if (Array.isArray(obj.talent)) {
			this.talent = this.talent.concat(obj.talent);
		} else {
			slog("error", "TypeError: talent must be string or array:", obj.talent);
		}
	}
	initSkill(obj = {} as any) {
		this.skill = this.r.initSkill() || [];
		if (!obj.skill) return;

		if (typeof obj.skill === "string") {
			this.skill.push(obj.skill);
		} else if (Array.isArray(obj.skill)) {
			this.skill = this.skill.concat(obj.skill);
		} else {
			slog("error", "TypeError: skill must be string or array:", obj.skill);
		}
	}
	initApp(obj = {} as any) {
		const app = this.appearance;

		app.height = obj.height || GenerateHeight(this.bodysize);
		app.weight = obj.weight || GenerateWeight(app.height);
		app.beauty = 1000;

		const list = ["haircolor", "eyecolor", "skincolor", "hairstyle"];
		list.forEach((key) => {
			if (obj[key]) app[key] = obj[key];
			else if (this.r?.avatar[key]) app[key] = draw(this.r.avatar[key]);
			else app[key] = draw(D[key + "Pool"]);
		});
	}
	initBody(obj = {} as any) {
		const size = obj.bodysize || random[5];
		let range = D.bodysize[size];
		this.appearance.height = obj.height || random(range[0], range[1]);
	}
	initBust(obj) {
		const app = this.appearance;
		const breast: Organs = this.body.breasts as Organs;
		if (this.r || obj.bust) app.bust = obj.bust || this.r.GenerateBust(app.height, this.gender, breast.sizeLv);
		else app.bust = Math.floor(app.height * 0.52) + random(-10, 10);
	}
	initWaist(obj) {
		const app = this.appearance;
		if (this.r || obj.waist) app.waist = obj.waist || this.r.GenerateWaist(app.height, this.gender);
		else app.waist = Math.floor(app.height * 0.37) + random(-10, 10);
	}
	initHip(obj) {
		const app = this.appearance;
		if (this.r || obj.hip) app.hip = obj.hip || this.r.GenerateHip(app.height, this.gender);
		else app.hip = Math.floor(app.height * 0.54) + random(-10, 10);
	}
	init3Size(obj = {} as any) {
		this.initBust(obj);
		this.initWaist(obj);
		this.initHip(obj);
	}
	initStats() {
		this.stats = {};
		D.stats.forEach((key) => {
			this.stats[key] = [10, 10];
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
		Object.keys(D.abl).forEach((key) => {
			this.abl[key] = { lv: 0, exp: 0 };
		});
	}
	initSituAbility() {
		this.sbl = {};
		Object.keys(D.sbl).forEach((key) => {
			this.sbl[key] = 0;
		});
	}
	initEquipment() {
		this.equip = {};
		Object.keys(D.equipSlot).forEach((key) => {
			this.equip[key] = {};
		});
		return this;
	}

	getRandomStats(key) {
		if (Species.data[this.species]) {
			let r = Species.data[this.species].basicStats;
			if (r[key]?.min && r[key]?.max) return [r[key].min, r[key].max];
			else if (r?.min && r?.max) return [r.min, r.max];
		}
		return [5, 18];
	}
	randomStats() {
		D.stats.forEach((key) => {
			const v = this.getRandomStats(key);
			const value = random(v[0], v[1]);
			this.stats[key] = [value, value];
		});
	}
	randomAbility() {
		Object.keys(D.abl).forEach((key) => {
			this.abl[key].lv = random(0, 8);
		});
	}
	randomSituAbility() {
		Object.keys(D.sbl).forEach((key) => {
			this.sbl[key] = random(0, 6);
		});
	}
	RandomInitBody() {
		this.body = {};
		this.bodysize = random(0, 5);
		D.basicBodypart.forEach((key) => {
			this.body[key] = {
				type: random(100) < 12 ? "artifact" : "natural",
				dp: [10, 10],
				hediff: [],
			};
		});
	}
	RandomInitApp() {
		this.appearance = {
			eyecolor: draw(D.eyecolorPool),
			haircolor: draw(D.haircolorPool),
			skincolor: draw(D.skincolorPool),
			hairstyle: draw(D.hairstylePool),

			beauty: 1000,
			height: GenerateHeight(this.bodysize),
		};
		const app = this.appearance;
		this.appearance.weight = GenerateWeight(app.height);
		this.init3Size();
	}
	End() {
		delete this.r;
	}
	Freeze() {
		Object.freeze(this);
	}
}

Creature.data = {};
