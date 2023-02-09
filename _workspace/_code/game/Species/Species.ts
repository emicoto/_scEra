import { Dict, cycleInfo, genderFull, statskey } from "../types";
import { BodyRatio, fixPenisProduce } from "./CommonFunc";
import { initBodyObj } from "./InitFunc";
import { Organs } from "./Organs";
declare function groupmatch(arg, ...args): boolean;
declare function slog(type: "log" | "warn" | "error", ...args): void;

export interface Species {
	type: "chara" | "monster";
	id: string;
	name: string[]; //CN, EN
	des: string[]; //CN, EN
	lifespan?: number; //lifespan

	availableGender?: genderFull[];
	speciesTalent?: Array<{ name: string; rate: number }>; //species talents
	speciesTraits?: Array<{ name: string; rate: number }>; //species traits
	speciesSkill?: Array<{ name: string; rate: number }>; //species skills
	speciesBuffs?: Dict<number>; //species buffs
	basicStats?: {
		[key in statskey | "min" | "max"]: number;
	};

	bodyConfig?: any; //configurations of body
	bodyScale?: number; //body scale
	threeSizeScale?: { bust?; waist?; hip? }; //the scale of three size
	bodyheight?: number | [number, number]; //body height range

	//body comfotable temperature
	//If the species does not have this value, it means that it is not affected by temperature.
	temper?: {
		low: number; //the lowest comfortable temperature
		high: number; //the highest comfortable temperature
		best: number; //the best comfortable temperature
		current: number; //the current comfortable temperature
	};

	//if the species hasnot this value, it means that it does not have menstrual cycle and pregnancy
	cycleInfo?: cycleInfo; // menstrual cycle and pregnancy settings

	//body produuce
	produce?: Dict<{ type; volume?; amountPerDay?; volumePerSize? }, string>;

	//avatar configuration
	//this is for generate avatar for the species
	//if none of the value is set, it means no avatar available for this species
	avatar?: {
		headtype?: string[];
		bodytype?: string[];
		eartype?: string[];
		tailtype?: string[];
		wingtype?: string[];
		skincolor?: string[];
		eyecolor?: string[];
		haircolor?: string[];
	};

	options?: any; // any other options
	initFunc?: Function; // the init function for build creature or characters

	args?: any; // the temporary args for init function
}

export class Species {
	public static data: Dict<Species>;
	public static get(name: string, type?: string, ...args) {
		const data = this.data[name];
		if (type === "buffs" && data.speciesBuffs) {
			if (args[0] && data.speciesBuffs[args[0]]) {
				return data.speciesBuffs[args[0]];
			} else if (args[0]) {
				slog("warn", "Caught Error on Species.get, no such buff", name, args[0]);
			}

			return data.speciesBuffs;
		}

		if (type && data[type]) {
			return data[type];
		} else if (type) {
			slog("warn", "Caught Error on Species.get, no such type", name, type);
		}
		if (data) {
			return data;
		} else {
			slog("warn", "Caught Error on Species.get, no such species", name);
		}
	}
	constructor(obj) {
		const {
			type,
			name,
			des,
			gender = ["male", "female"],
			talent = [],
			buffs = {},
			bodysize = { scale: 1, min: 1300, max: 2000 },
			trait = [],
			skill = [],
		} = obj;

		//main information of the species
		this.type = type;
		this.name = name;
		this.des = des;
		this.availableGender = gender;
		this.speciesTalent = talent;
		this.speciesTraits = trait;
		this.speciesSkill = skill;
		this.speciesBuffs = buffs;
		this.bodyScale = bodysize.scale;
		this.bodyheight = [bodysize.min, bodysize.max];

		//the optional information of the species

		const { cycle, threesize, bodygroup } = obj;
		const list = ["id", "basicStats", "avatar", "temper", "lifespan", "produce"];

		list.forEach((item) => {
			if (obj[item]) {
				this[item] = obj[item];
			}
		});

		if (cycle) this.cycleInfo = cycle;
		if (threesize) this.threeSizeScale = threesize;

		const ignore = Object.keys(this);
		ignore.push("bodygroup", "bodysize", "threesize", "cycle", "gender", "talent", "buffs", "trait", "skill");

		//the other options of the species
		this.options = {};
		for (let key in obj) {
			if (ignore.includes(key)) continue;
			this.options[key] = obj[key];
		}

		this.initBody(bodygroup);
	}
	Options(key, obj) {
		this.options[key] = obj;
		return this;
	}

	InitFunc(callback: Function) {
		this.initFunc = callback;
		return this;
	}

	initBody(body) {
		//the body object still at raw state, need to be init
		this.bodyConfig = initBodyObj(body);
	}

	initTalent() {
		if (!this.speciesTalent || !this.speciesTalent.length) return;

		const talent = [];
		for (const t of this.speciesTalent) {
			if (Math.random() < t.rate) {
				talent.push(t.name);
			}
		}
		return talent;
	}

	initTraits() {
		if (!this.speciesTraits || !this.speciesTraits.length) return;

		const traits = [];
		for (const t of this.speciesTraits) {
			if (Math.random() < t.rate) {
				traits.push(t.name);
			}
		}
		return traits;
	}

	initSkill() {
		if (!this.speciesSkill || !this.speciesSkill.length) return;

		const skill = [];
		for (const t of this.speciesSkill) {
			if (Math.random() < t.rate) {
				skill.push(t.name);
			}
		}
		return skill;
	}

	//common configuration for all species
	configureBody(gender: genderFull, height: number, adj?: any) {
		//configure the organs
		const body: Dict<Organs> = {};

		const set = clone(this.bodyConfig.settings);
		//add produce to bodyparts
		for (const key in this.produce) {
			if (set[key]) {
				set[key].produce = this.produce[key];
			}
		}

		//add adj to bodyparts
		if (adj) {
			for (const key in adj) {
				if (set[key]) {
					set[key].adj = adj[key];
				}
			}
		}

		for (const key in set) {
			const part: any = set[key];

			if (gender == "female" && groupmatch(key, "penis", "prostate", "testicles")) {
				continue;
			}
			if (gender == "male" && groupmatch(key, "vagina", "clitoris", "uterus")) {
				continue;
			}

			if (gender == "herm") {
				if (key == "clitoris" && !part.herm) continue;
				if (key == "prostate" && !part.herm) continue;
				if (key == "testicles" && !part.herm) continue;
			}

			body[key] = new Organs(part);

			switch (key) {
				case "vagina":
					body[key].initVagina(height, part);
					break;
				case "anus":
					body[key].initAnal(height, part);
					break;
				case "penis":
					body[key].initPenis(part?.scale || 1);
					break;
				case "urethral":
					body[key].initUrethral(gender, part, height);
					break;
				case "mouth":
					body[key].initMouth(height);
					break;
				case "clitoris":
					body[key].initClitoris(BodyRatio(height));
					break;
			}
			if (part.produce && key !== "penis") {
				body[key].initProduce(part.produce);
			}
			if (part.capacity && !body[key].capacity) {
				body[key].initCapacity(part.capacity, height);
			}
		}

		//the urethral depent on gender and other organ, so init it at last.
		if (body.urethral) {
			body.urethral.initUrethralSize(height, body.penis);
		}
		//fix the produce
		if (body.penis) {
			fixPenisProduce(body.penis, this.id);
		}

		return body;
	}

	GenerateBust(height: number, gender: genderFull, cup: number) {
		//r is the ratio of bust to height
		const r = gender == "male" ? 0.61 : 0.51;
		const standard = height * r + random(-5, 5);
		const cupsize = (standard / 12) * cup;

		let result = cupsize + standard * (this.threeSizeScale.bust || 1);

		return result.fixed(2);
	}
	GenerateWaist(height: number, gender: genderFull) {
		const r = gender == "male" ? 0.4 : 0.42;
		const standard = height * r + random(-5, 5);

		let result = standard * (this.threeSizeScale.waist || 1);

		return result.fixed(2);
	}
	GenerateHip(height: number, gender: genderFull) {
		const r = gender == "male" ? 0.51 : 0.54;
		const standard = height * r + random(-5, 5);

		let result = standard * (this.threeSizeScale.hip || 1);

		return result.fixed(2);
	}
}

Species.data = {};
