//import { inrange } from "Code/utils/efun";
import { finished } from "stream";
import {
	Dict,
	P,
	ablkey,
	basekey,
	expkey,
	genderFull,
	jobclass,
	markkey,
	palamkey,
	race,
	sblkey,
	statskey,
} from "./types";
export function inrange(x: number, min: number, max: number) {
	return x >= min && x <= max;
}
export interface sexStats {
	lv: number;
	type?: string;
	trait?: string[];

	size?: number;
	d?: number;
	l?: number;

	wet?: number;
	cum?: number;
	maxcum?: number;
	milk?: number;
	maxmilk?: number;

	storeable?: number;
	capacity?: number; //ml
	storelist?: Dict<number>;

	pergnany?: any;
	parasite?: any;
}

export interface appearance {
	eyecolor?: string;

	haircolor?: string;
	hairstlye?: string;

	skincolor?: string;
	beauty?: number;
	bodysize?: number; //0=tiny 90~124, 1=small 124~154, 2=normal 154~174, 3=tall 174~184, 4=huge 184~200, 5=giant 200+
	tall?: number; //mm
	weight?: number; //kg
}

export interface Creature {
	type: creaturetype;
	id?: string;
	cid: string;
	name: string;
	gender: genderFull;
	position: "neko" | "tachi" | "both";
	race: race;
	traits: string[];
	talent: string[];
	skill: string[];

	stats: Dict<P, statskey>;
	appearance?: appearance;
	base: Dict<P, basekey>;
	palam: Dict<P, palamkey>;

	source: Dict<number>;
	state: string[];
	mood: number;

	tsv: any;
	abl: Dict<{ lv: number; exp: number }, ablkey>;
	sbl: Dict<number, sblkey>;
	sexstats: Dict<sexStats>;

	drugeffect: Dict<number>;

	pergency?: any;

	equip?: any;
}

export interface Chara extends Creature {
	name: string;
	midname?: string;
	surname?: string;
	fullname?: string;
	nickame?: string;
	callname?: string;

	title?: string;
	class?: jobclass;
	guildRank?: number;

	kojo?: string;
	birthday?: [number, number, number];
	intro?: [string?, string?];

	mark?: Dict<number, markkey>;

	expUp: Dict<number>;

	daily?: any;
	exp?: Dict<{ aware: number; total: number }, expkey>;

	pregnancy?: any;
	parasite?: any;
	scars?: any;

	wear?: any;

	reveals?: any;
	virginity?: any;

	flag: any; //好感、信赖， 学籍情报， 诅咒进展， 诅咒魔力效率等
	wallet?: number;
	debt?: number;
	invetory?: any;
	tempe?: { low: number; high: number; best: number; current: number };
}

interface iName {
	v?: string;
	m?: string; //middle
	s?: string; //surname
	n?: string; //nick
	c?: string; //call master
}

export type creaturetype = "chara" | "nnpc" | "monster";
declare function groupmatch(arg, ...args): boolean;

export class Creature {
	static data: Dict<Creature> = {};
	constructor(type: creaturetype, name: string, gender: genderFull, race: race) {
		this.type = type;
		this.cid = type + "_" + Object.values(Creature.data).length;

		this.name = name;
		this.gender = gender;
		this.race = race;

		this.appearance = {};

		this.traits = [];
		this.talent = [];
		this.skill = [];

		this.stats = {};
		this.base = {};
		this.palam = {};
		this.state = [];
		this.source = {};

		this.tsv = {};
		this.abl = {};
		this.sbl = {};
		this.sexstats = {};

		this.mood = 30;
	}

	init(pos) {
		this.position = pos;
		this.initBase();
		this.initStats();
		this.initAbility();
		this.initSexAbl();
		this.initSexStats();
	}

	initBase() {
		Object.keys(D.base).forEach((k) => {
			this.base[k] = [0, 1000];
		});

		Object.keys(D.palam).forEach((k) => {
			this.palam[k] = [0, 0, 1200];
			this.source[k] = 0;
		});

		D.tsv.forEach((k) => {
			this.tsv[k] = 0;
		});

		return this;
	}

	initStats() {
		D.stats.forEach((k) => {
			this.stats[k] = [10, 10];
		});
		return this;
	}

	initAbility() {
		Object.keys(D.abl).forEach((k, i) => {
			this.abl[k] = {
				lv: 0,
				exp: 0,
			};
		});
		return this;
	}

	initSexAbl() {
		Object.keys(D.sbl).forEach((k, i) => {
			this.sbl[k] = 0;
		});
		return this;
	}

	initSexStats() {
		if (this.gender === "female") {
			this.setOrgan("v");
			this.setOrgan("c");
			this.setOrgan("w");
		} else if (this.gender === "male") {
			this.setOrgan("p");
		} else {
			this.setOrgan("p");
			this.setOrgan("v");
			this.setOrgan("w");
		}

		this.setOrgan("a");
		this.setOrgan("m");
		this.setOrgan("b");
		this.setOrgan("u");
		return this;
	}

	setOrgan(part, adj?) {
		console.log(this, adj);
		this.sexstats[part] = {
			lv: adj?.lv ? adj.lv : 0,
			size: adj?.size ? adj.size : 0,
			storeable: adj?.storeable ? adj.storeable : 0,
		};
		if (groupmatch(part, "p", "a", "v")) {
			this.sexstats[part].wet = 0;
			this.sexstats[part].cum = 0;
		}

		if (part == "p") this.setPenis(adj);
		if (part == "c") this.setCrit(adj);
		if (part == "v") this.setVagi(adj);
		if (part == "a") this.setAnal(adj);
		if (part == "b") this.setBreast(adj);
		if (part == "u") this.setUrin(adj);
		if (part == "m") this.setMouth(adj);
		if (part == "w") this.setWomb(adj);
		return this;
	}

	fixPenisCapacity() {
		const p = this.sexstats.p;
		return (p.size * 50 + 50) * (p.trait.includes("浓厚") ? 10 : 1);
	}

	setPenis(adj?) {
		let type = adj?.type ?? "阴茎",
			trait = adj?.trait ?? [],
			d = adj?.d ?? 0,
			l = adj?.l ?? 0;

		//P标准Size表. 具体会在长度与宽度 +-8/+-6
		const Psize = D.Psize;
		const P = this.sexstats.p;
		const size = Psize[P.size];
		P.type = type;
		P.trait = trait;
		P.d = d ? d : size[1] + random(-8, 8);
		P.l = l ? l : size[0] + random(-8, 8);
		this.sexstats.p.parasite = {
			maxslot: 6,
			type: "",
			eggs: [],
			active: false,
		};

		P.maxcum = this.fixPenisCapacity();
		this.sexstats.p.trait = adj?.trait ? adj.trait : [];
		return this;
	}

	setCrit(adj?) {
		this.sexstats.c.d = this.sexstats.c.size + 5;
		this.sexstats.c.trait = adj?.trait ? adj.trait : [];
		return this;
	}
	setVagi(adj?) {
		this.sexstats.v.d = this.fixVagiDiameter();
		this.sexstats.v.l = this.GenerateVagiDepth();
		this.sexstats.v.trait = adj?.trait ? adj.trait : [];
		return this;
	}
	//TODO
	setWomb(adj?) {
		this.sexstats.w.d = this.fixVagiDiameter();
		this.sexstats.w.l = this.GenerateVagiDepth();
		this.sexstats.w.trait = adj?.trait ? adj.trait : [];
		this.sexstats.w.pergnany = {
			circle: {
				type: "heat",
				basedays: random(6, 9),
				rng: random(1, 3),
				current: 0,
				state: "normal",
				running: true,
				stages: [],
				ovulate: 1,
				frng: random(1, 3),
				lastCircleDays: 0,
			},
			awareof: false,
			fetus: [],
			state: "normal",
			maxslot: 4,
			sperm: [],
		};
		const circle = this.sexstats.w.pergnany.circle;
		const days = circle.basedays;
		circle.lastCircleDays = circle.basedays;
		circle.stages = [0, Math.floor(days / 3 + 0.5), days + 0.5];

		this.sexstats.w.parasite = {
			maxslot: 6,
			type: "",
			eggs: [],
			active: false,
		};

		this.sexstats.w.storeable = 1;
		this.sexstats.w.capacity = this.fixWombCapacity();
		this.sexstats.w.storelist = {};
	}
	fixWombCapacity() {
		return this.bodysize() * 10 + 20 + random(-5, 5);
	}
	maxHoleSize() {
		return this.bodysize() * 2 - 2.4;
	}
	fixVagiDiameter() {
		const max = this.maxHoleSize();
		return this.sexstats.v.size * max + 14 + random(-2, 4);
	}
	GenerateVagiDepth() {
		return this.bodysize() * 21 + 80 + random(-4, 8);
	}
	setAnal(adj?) {
		this.sexstats.a.d = this.fixAnalDiameter();
		this.sexstats.a.l = this.GenerateAnalDepth();
		this.sexstats.a.trait = adj?.trait ? adj.trait : [];
		this.sexstats.a.storeable = 1;
		this.sexstats.a.capacity = this.fixAnalCapacity();
		this.sexstats.a.storelist = {};
		this.sexstats.a.parasite = {
			maxslot: 6,
			type: "",
			eggs: [],
			active: false,
		};
		return this;
	}
	fixAnalDiameter() {
		const max = this.maxHoleSize();
		return this.sexstats.a.size * max + 12 + random(-2, 4);
	}
	fixAnalCapacity() {
		return this.bodysize() * 1000 + 2000 + random(-400, 800);
	}
	GenerateAnalDepth() {
		return this.bodysize() * 32 + 140 + random(-4, 8);
	}
	setBreast(adj?) {
		this.sexstats.b.maxmilk = adj?.maxmilk ? adj.maxmilk : 0;
		this.sexstats.b.milk = this.sexstats.b.maxmilk;
		this.sexstats.b.trait = adj?.trait ? adj.trait : [];
		this.sexstats.b.storeable = 1;
		this.sexstats.b.capacity = adj?.maxmilk ? adj.maxmilk : 0;
		this.sexstats.b.storelist = {};
		this.sexstats.b.parasite = {
			maxslot: 6,
			type: "",
			eggs: [],
			active: false,
		};
		return this;
	}
	setUrin(adj?) {
		const size = this.sexstats.u.size;

		this.sexstats.u.d = this.fixUrinDiameter();
		this.sexstats.u.l = this.GenerateUrinDepth();

		if (this.gender === "female") {
			this.sexstats.u.wet = 0;
			this.sexstats.u.cum = 0;
		}
		this.sexstats.u.trait = adj?.trait ? adj.trait : [];
		this.sexstats.u.storeable = 1;
		this.sexstats.u.capacity = this.fixUrinCapacity();
		this.sexstats.u.storelist = {};
		this.sexstats.u.parasite = {
			maxslot: 6,
			type: "",
			eggs: [],
			active: false,
		};

		return this;
	}
	fixUrinCapacity() {
		return this.bodysize() * 200 + 500 + random(-50, 100);
	}
	bodysize() {
		if (this.appearance.bodysize === undefined) this.appearance.bodysize = 2;
		const { bodysize } = this.appearance;
		return bodysize ? bodysize : 1;
	}
	MaxUrinhole() {
		const bodysize = this.bodysize();
		let max = bodysize / 2 + 0.5;
		if (this.gender !== "female") max = 1;
		return max;
	}
	fixUrinDiameter() {
		const max = this.MaxUrinhole();
		const size = this.sexstats.u.size;
		return size * max + 0.5 + random(-2, 4) / 10;
	}
	GenerateUrinDepth() {
		const penis = this.sexstats?.p?.l;
		if (penis) return penis + random(24, 40);
		return 42 + random(1, 20) + this.bodysize() * 6;
	}
	setMouth(adj?) {
		const size = [25, 40, 50, 60, 70, 80];
		this.sexstats.m.d = size[this.sexstats.m.size] + random(-2, 4);
		this.sexstats.m.trait = adj?.trait ? adj.trait : [];
		this.sexstats.m.storeable = 1;
		this.sexstats.m.capacity = this.fixMouthCapacity();
		this.sexstats.m.storelist = {};
		this.sexstats.m.parasite = {
			maxslot: 6,
			type: "",
			eggs: [],
			active: false,
		};

		return this;
	}
	fixMouthCapacity() {
		return this.bodysize() * 300 + 300 + random(-50, 100);
	}

	GenerateTall(size?) {
		const bodysize = size !== undefined ? size : this.appearance.bodysize;
		switch (bodysize) {
			//0=tiny 90~124, 1=small 124~154, 2=normal 154~174, 3=tall 174~184, 4=huge 184~200, 5=giant 200+
			case 0:
				return random(90, 124);
			case 1:
				return random(124, 154);
			case 2:
				return random(154, 174);
			case 3:
				return random(174, 184);
			case 4:
				return random(184, 200);
			case 5:
				return random(200, 250);
		}
	}

	GenerateBodysize(_tall?) {
		const tall = _tall ? _tall : this.appearance.tall;
		if (inrange(tall, 90, 124)) return 0;
		if (inrange(tall, 124, 154)) return 1;
		if (inrange(tall, 154, 174)) return 2;
		if (inrange(tall, 174, 184)) return 3;
		if (inrange(tall, 184, 200)) return 4;
		if (inrange(tall, 200, 250)) return 5;
	}

	GenerateWeight(_tall) {
		const tall = _tall / 1000;
		return Math.floor(tall * tall * 19 + 0.5) + random(1, 20) / 10;
	}

	initEquipment() {
		this.equip = {};
		Object.keys(D.equip).forEach((k) => {
			this.equip[k] = {};
		});
		return this;
	}

	initAppearance(bodysize) {
		this.appearance.bodysize = bodysize;
		this.appearance.tall = this.GenerateTall();
		this.appearance.weight = this.GenerateWeight(this.appearance.tall);
		return this;
	}

	bp() {
		const s = this.stats;
		return s.STR[1] * 15 + s.CON[1] * 8 + s.DEX[1] * 8 + s.INT[1] * 8 + s.WIL[1] * 10 + s.PSY[1];
	}
}

export class Chara extends Creature {
	static data: Dict<Chara> = {};
	static load(chara: Chara) {
		const { cid, name, gender, race, kojo } = chara;
		const init = new Chara(cid, name, gender, race, kojo, chara);
		return init;
	}
	static new(cid: string, name: string, gender: genderFull, race: race, kojo?) {
		Chara.data[cid] = new Chara(cid, name, gender, race, kojo);
		return Chara.data[cid];
	}
	constructor(id: string, name: string, gender: genderFull, race: race, kojo?: string, chara?) {
		super("chara", name, gender, race);
		if (chara) {
			for (let i in chara) {
				this[i] = clone(chara[i]);
			}
		} else {
			this.cid = id;
			this.name = name;
			this.midname = "";
			this.surname = "";
			this.fullname = "";

			this.mood = 30;
			this.title = "";
			this.class = "";
			this.guildRank = 0;

			this.kojo = kojo ? kojo : id;

			this.mark = {};
			this.exp = {};
			this.expUp = {};
			this.flag = {};
			this.equip = {};
		}
	}

	initChara(pos) {
		this.init(pos);
		this.initMark();
		this.initExp();
		this.initAppearance(2);
		this.initEquipment();
		this.initRevealDetail();
		this.initVirginity();
		this.initDaily();
		this.initScars();
		this.initFlag();
		this.wallet = 1000;
		this.invetory = [];
		this.tempe = {
			low: 16,
			high: 28,
			best: 23,
			current: 36,
		}; //最低适应温度， 最高适应温度, 最佳适应温度， 当前体温. 单位摄氏度
		console.log(this, "finishinit");
		return this;
	}

	initMark() {
		Object.keys(D.mark).forEach((k) => {
			this.mark[k] = 0;
		});
		return this;
	}

	initExp() {
		D.exp.forEach((k) => {
			this.exp[k] = { aware: 0, total: 0 };
		});
		return this;
	}

	initScars() {
		this.scars = {};

		D.skinlayer.forEach((k) => {
			this.scars[k] = [];
		});

		if (this.gender === "male") delete this.scars.vagina;
		if (this.gender === "female") delete this.scars.penis;

		this.scars.total = {};

		return this;
	}

	initRevealDetail() {
		this.reveals = {};

		const ignore = ["vagina", "penis", "buttL", "buttR"];
		this.reveals.expose = 3;
		this.reveals.reveal = 1500;

		this.reveals.detail = {};

		D.skinlayer.forEach((k) => {
			if (ignore.includes(k) === false) this.reveals.detail[k] = { expose: 3, block: 3 };
		});
		//额外处理
		this.reveals.detail.genital = { expose: 3, block: 3 };
		this.reveals.detail.butts = { expose: 3, block: 3 };
		this.reveals.parts = Object.keys(this.reveals.detail);

		return this;
	}

	initVirginity() {
		this.virginity = {};

		// [丧失对象，丧失时间，丧失情景]
		const list = clone(D.virginity);

		if (this.gender === "male") list.splice(5, 2);
		if (this.gender === "female") list.splice(2, 1);

		list.forEach((k) => {
			this.virginity[k] = [];
		});

		return this;
	}

	setNames(names?: iName) {
		if (names?.v) this.name = names.v;
		if (names?.m) this.midname = names.m;
		if (names?.s) this.surname = names.s;
		if (names?.n) this.nickame = names.n;
		if (names?.c) this.callname = names.c;
		this.fullname = `${this.name}${this.midname ? "・" + this.midname : ""}${
			this.surname ? "・" + this.surname : ""
		}`;
		return this;
	}

	setTitle(str) {
		this.title = str;
		return this;
	}

	setJob(str: jobclass) {
		this.class = str;
		return this;
	}

	setBirth(arr: [number, number, number]) {
		this.birthday = arr;
		return this;
	}

	setIntro(arr: [string, string?]) {
		this.intro = arr;
		return this;
	}

	setTraits(arr: string[]) {
		this.traits = arr;
		return this;
	}

	setTalent(arr: string[]) {
		this.talent = arr;
		return this;
	}

	setSkill(arr: string[]) {
		this.skill = arr;
		return this;
	}

	setStats(obj: Dict<number, statskey>) {
		D.stats.forEach((k) => {
			if (obj[k]) this.stats[k] = [obj[k], obj[k]];
			else if (!this.stats[k]) this.stats[k] = [10, 10];

			this.flag[`base${k}`] = this.stats[k][0];
		});
		return this;
	}

	setAbility(obj: Dict<number, ablkey>) {
		for (let i in obj) {
			this.abl[i].lv = obj[i];
		}
		return this;
	}

	setSexAbl(arr: Dict<number, sblkey>) {
		for (let i in arr) {
			this.sbl[i] = arr[i];
		}
		return this;
	}

	setExp(arr: Dict<number, expkey>) {
		for (let i in arr) {
			this.exp[i].total = arr[i];
			this.exp[i].aware = arr[i];
		}
		return this;
	}

	getExp(exp, value) {
		this.exp[exp].total += value;
		if (!this.uncons()) {
			this.exp[exp].aware += value;
		}
		this.expUp[exp] = value;
		return this;
	}

	getBase(key, value) {
		this.base[key][0] += value;
		return this;
	}

	getPalam(key, value) {
		this.palam[key][1] += value;
		return this;
	}

	uncons() {
		return this.state.has("睡眠", "晕厥");
	}

	unable() {
		return this.state.has("拘束", "石化") || !cond.isEnergetic(this.cid, 30);
	}

	active() {
		return (
			!this.state.has("睡眠", "晕厥", "拘束", "石化", "精神崩溃") &&
			!cond.baseLt(this.cid, "health", 0.05) &&
			!cond.baseLt(this.cid, "sanity", 10) &&
			!cond.baseLt(this.cid, "stamina", 10)
		);
	}

	setAppearance({
		eyecolor = "蓝色",
		haircolor = "金色",
		hairstyle = "散发",
		skincolor = "健康",
		bodysize,
		tall,
		weight = 0,
	}) {
		const appearance = {
			eyecolor: eyecolor,
			haircolor: haircolor,
			hairstyle: hairstyle,
			skincolor: skincolor,
			beauty: fix.beauty(this),
			bodysize: bodysize !== undefined ? bodysize : tall ? this.GenerateBodysize(tall) : this.appearance.bodysize,
			tall: tall ? tall : bodysize ? this.GenerateTall() : 1704,
			weight: weight,
		};
		console.log("begin setApp");

		if (!appearance.weight) {
			appearance.weight = this.GenerateWeight(appearance.tall);
		}

		for (let i in appearance) {
			this.appearance[i] = appearance[i];
		}
		return this;
	}

	setVirginity(part, target, time, situation) {
		this.virginity[part] = [target, time, situation];
		return this;
	}
	//每日色色记录
	initDaily() {
		this.daily = {
			cum: 0,
			swallowed: 0,
			cumA: 0,
			cumV: 0,

			origasm: 0,
			onM: 0,
			onB: 0,
			onC: 0,
			onU: 0,
			onV: 0,
			onA: 0,
		};

		if (this.gender === "female") delete this.daily.cum;
		if (this.gender === "male") {
			delete this.daily.cumV;
			delete this.daily.onV;
		}

		return this;
	}

	initFlag() {
		D.cflag.forEach((k) => {
			this.flag[k] = 0;
		});
		return this;
	}

	setFame(key, val) {
		this.flag[`${key}fame`] = val;
		return this;
	}

	resetPalam() {
		for (let i in this.palam) {
			this.palam[i][0] = 0;
			this.palam[i][1] = 0;
		}
		return this;
	}
	resetBase() {
		const list = ["dirty", "drug", "alcohol", "stress"];
		for (let i in this.base) {
			if (list.includes(i)) this.base[i][0] = 0;
			else this.base[i][0] = this.base[i][1];
		}
		return this;
	}
}

Object.defineProperties(window, {
	Creature: { value: Creature },
	Chara: { value: Chara },
});
