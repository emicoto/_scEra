import { Dict, cycleInfo, creaturetype, bodypart, existency, P, sexStats, genderFull } from "../types";
import { initBodyObj } from "./InitFunc";
import { Organs } from "./Organs";
import { bodysize } from "./bodyparts";
declare function groupmatch(arg, ...args): boolean;
declare function slog(type: "log" | "warn" | "error", ...args): void;

export interface Species {
	type: "chara" | "monster";

	name: string[]; //CN, EN
	des: string[]; //CN, EN

	availableGender?: genderFull[];
	speciesTalent?: Array<{ name: string; rate: number }>; //species talents
	speciesBuffs?: Dict<number>; //species buffs

	bodyConfig?: any; //configurations of body
	bodyScale?: number; //body scale
	threeSizeScale?: { bust?; waist?; hip? }; //the scale of three size
	bodyheight?: number | [number, number]; //body height range

	//body comfotable temperature
	//If the species does not have this value, it means that it is not affected by temperature.
	tempture?: {
		low: number; //the lowest comfortable temperature
		high: number; //the highest comfortable temperature
		best: number; //the best comfortable temperature
		current: number; //the current comfortable temperature
	};

	//if the species hasnot this value, it means that it does not have menstrual cycle and pregnancy
	cycleInfo?: cycleInfo; // menstrual cycle and pregnancy settings

	//body produuce
	produce?: Dict<{ type; amount?; amountPerDay?; amountPerSize? }, string>;

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
	};

	options?: any; // any other options
	initFunc?: string[]; // path to the init function

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
	constructor({ type, name, des, gender, talent, buffs, tempture, bodysize, bodygroup, cycle, avatar, threesize }) {
		this.type = type;
		this.name = name;
		this.des = des;
		this.availableGender = gender;
		this.speciesTalent = talent;
		this.speciesBuffs = buffs;
		this.bodyScale = bodysize.scale;
		this.bodyheight = [bodysize.min, bodysize.max];

		if (cycle) this.cycleInfo = cycle;
		if (avatar) this.avatar = avatar;
		if (tempture) this.tempture = tempture;
		if (threesize) this.threeSizeScale = threesize;

		this.options = {};

		this.initBody(bodygroup);
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
					body[key].initPenis();
					break;
				case "urethral":
					body[key].initUrethral(gender, part, height);
					break;
				case "mouth":
					body[key].initMouth(height);
					break;
				case "clitoris":
					body[key].initClitoris(this.BodyRatio(height));
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

		return body;
	}

	BodySizeCalc(height: number) {
		return Math.floor((height / this.bodyScale - 1300) / 1500);
	}
	BodyRatio(height: number) {
		const select = new SelectCase();
		select
			.case([240, 800], 3.5)
			.case([800, 1240], 4)
			.case([1300, 1400], 4.5)
			.case([1400, 1500], 5)
			.case([1500, 1660], 6)
			.case([1660, 1740], 6.5)
			.case([1740, 1800], 7)
			.else(7.5);
		return select.has(height);
	}
	GenerateHeight(size: number) {
		if (typeof size !== "number") {
			size = random(5);
		}
		const r = bodysize[size];
		const height = random(r[0], r[1]);
		return height * this.bodyScale;
	}
	GenerateWeight(height: number) {
		const r = height / 1000;
		const BMI = 19 + random(-2, 4);
		return Math.floor(r * r * BMI + 0.5) + random(30) / 10;
	}
	HeadSize(height: number) {
		return height / this.BodyRatio(height);
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
