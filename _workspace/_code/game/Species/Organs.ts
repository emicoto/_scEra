import { genderFull, organAdjustment } from "../types";

declare function slog(type: "log" | "warn" | "error", ...args): void;
declare function isValid(arg): boolean;
declare var D: typeof window.D;

export interface Organs {
	name: string; //name used for describe, the name must in the dictionary
	type: string; //type of structure
	pos: string; //the position in the group
	group: string; //where the part

	side?: string | string[]; //which side the part is on when the pos is "side"
	count?: number; //how many

	sizeLv?: number; //size level for generate diameter and length, max 12

	// diameter and length/depth
	size?: number | [number, number?];
	//sensitivity level, max 12
	sens?: number;

	//shape to describe organ
	shape?: string;

	//extra parts traits
	trait?: string[];

	//the produce of the organ
	//cur is current amount of the produce, max is the capacity of the organ
	//day is the amount of produce per day
	produce?: string;
	amount?: {
		cur?: number;
		day?: number;
		max?: number;
	};

	//the capacity of the organ, the unit is ml
	capacity?: [number, number]; //current capacity, max capacity

	//anything else of detail of organs. the <any> must be object type, and has 'type' property to define what's of it
	hediff?: Array<any>;
}

export class Organs {
	constructor(obj: any) {
		//if the obj is not valid, then return
		if (!isValid(obj)) {
			slog("warn", "Invalid organs object:", obj);
			return;
		}

		const { type, pos, group, name } = obj;

		//set the default value
		this.name = name;
		this.type = type;
		this.pos = pos;
		this.group = group;

		this.initSexStats(name);
		this.init(obj);

		if (!this.hediff) this.hediff = [];
	}
	init(obj) {
		const { side, count, size, sens, shape, trait } = obj;
		if (side) this.side = side;
		if (count) this.count = count;

		if (size) this.sizeLv = size.default;

		if (sens) this.sens = sens.default;
		if (typeof shape === "string") this.shape = shape;

		if (trait) this.initTrait(trait);

		const { adj } = obj;
		if (adj) {
			this.initStats(adj);
		}
	}

	initSexStats(part: string) {
		switch (part) {
			case "vagina":
			case "anus":
			case "penis":
			case "urethral":
				if (!this.size) this.size = [0, 0];
			case "mouth":
			case "clitoris":
				if (!this.size) this.size = 0;
			case "breasts":
				if (!this.sizeLv) this.sizeLv = 0;
				if (!this.sens) this.sens = 0;
				break;
			default:
		}

		return this;
	}

	initStats(adj: organAdjustment) {
		const { sens, d, l, size, trait } = adj;
		if (sens) this.sens = sens;
		if (d) this.size[0] = d;
		if (l) this.size[1] = l;
		if (size) this.sizeLv = size;

		if (trait) this.initTrait(trait);

		return this;
	}

	initProduce(config) {
		this.produce = config.type;
		if (config.amountPerDay || config.amountPerSize) {
			this.amount = { cur: 0 };
		}
		if (config.amountPerDay) {
			this.amount.day = config.amountPerDay;
		}
		if (config.amountPerSize) {
			this.amount.max = config.amountPerSize * (this.sizeLv || 1);
		}

		return this;
	}

	initCapacity(config, size) {
		if (!this.capacity) {
			this.capacity = [0, 0];
		}
		if (config.default) {
			this.capacity[1] = config.default;
		}
		if (config.scale) {
			this.capacity[1] = size * config.scale;
		}

		return this;
	}

	initTrait(config) {
		if (!this.trait) {
			this.trait = [];
		}
		if (typeof config === "string") {
			this.trait.push(config);
		} else if (Array.isArray(config)) {
			this.trait.push(...config);
		}

		return this;
	}

	initClitoris(BodyRatio: number) {
		this.size = this.sizeLv + BodyRatio;
		return this;
	}

	initMouth(height: number) {
		this.size = Organs.MouthDiameter(height, this.sizeLv);
		return this;
	}

	initUrethral(gender: genderFull, config, height) {
		const option: any = this.group;

		//fix the group if it's an object
		if (typeof option === "object" && option[gender]) {
			this.group = option[gender];
		}

		this.initCapacity(config, height);

		//fix the capacity when group is penis
		if (this.group === "penis") {
			this.capacity[1] /= 5;
		}

		return this;
	}

	initUrethralSize(height: number, penis?: Organs) {
		switch (this.group) {
			//if the urethral dependent on penis size
			case "penis":
				if (!penis) {
					slog(
						"error",
						"Caught error on init urethral size. the urethral depent on penis, but not penis data found:",
						this,
						penis
					);
					return;
				}
				this.size[0] = Organs.UrethralDiameter(penis.size[0], this.sizeLv);
				this.size[1] = Math.floor(penis.size[1] * 1.2 + 0.5);
				break;

			//otherwise just use general setting
			default:
				this.size[0] = Organs.UrethralGeneralDiameter(height, this.sizeLv);
				this.size[1] = Organs.UrethralGeneralDepth(height);
		}

		return this;
	}

	initVagina(height: number, config) {
		this.size[0] = Organs.VagiDiameter(height, this.sizeLv);
		this.size[1] = Organs.VagiDepth(height);
		this.initCapacity(config, height);

		return this;
	}

	initAnal(height: number, config) {
		this.size[0] = Organs.AnalDiameter(height, this.sizeLv);
		this.size[1] = Organs.AnalDepth(height);

		if (config?.trait) this.trait = config.trait;
		this.initCapacity(config, height);

		return this;
	}

	initPenis() {
		const size = D.Psize[this.sizeLv];
		const d = random(size.d[0], size.d[1]) + random(8);
		const l = random(size.l[0], size.l[1]) + random(8);

		if (!this.size[0]) this.size[0] = d;
		if (!this.size[1]) this.size[1] = l;

		return this;
	}

	//theoritical maxium size
	public static theoriticalMaxiumHoleSize(height: number) {
		return (height / 10) * 0.9;
	}

	public static strechLevelSize(height: number) {
		//max level 12
		return this.theoriticalMaxiumHoleSize(height) / 12;
	}

	public static VagiDiameter(height: number, sizeLv: number) {
		const max = this.strechLevelSize(height) * 1.1;
		return Math.floor(max + sizeLv * max) + random(-2, 2);
	}

	public static VagiDepth(height: number) {
		return Math.floor(height / 21 + 0.5) + random(-4, 8);
	}

	public static AnalDiameter(height: number, sizeLv: number) {
		const max = this.strechLevelSize(height);
		return Math.floor(max + sizeLv * max) + random(-2, 2);
	}

	public static AnalDepth(height: number) {
		return Math.floor(height / 12 + 0.5) + random(-4, 8);
	}

	public static MaxUrethralSize(height: number) {
		return this.theoriticalMaxiumHoleSize(height) / 4;
	}

	public static UrethralStrechLevelSize(height: number) {
		return this.MaxUrethralSize(height) / 12;
	}

	public static UrethralGeneralDiameter(height: number, sizeLv: number) {
		const max = this.UrethralStrechLevelSize(height);
		return Math.floor(max + sizeLv * max) + random(-2, 4) / 10;
	}

	public static UrethralGeneralDepth(height: number) {
		return Math.floor(height / 30) + random(-4, 8);
	}

	public static UrethralDiameter(penisDiameter: number, sizeLv: number) {
		const max = (penisDiameter * 0.8) / 12;
		return Math.floor(max + sizeLv * max) + random(-2, 2) / 10;
	}

	public static MouthDiameter(height: number, sizeLv: number) {
		const multip = 1 + sizeLv * 0.15;
		return Math.floor((height / 40) * multip) + random(10);
	}

	public static addHediff(organ: Organs, type, hediff) {
		organ.hediff.push({ type, ...hediff });
		return organ;
	}
}
