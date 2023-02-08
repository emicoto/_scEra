import { Creature } from ".";
import { Dict, jobclass, sblkey, markkey, charaposi, dailykeys, ablkey, expkey, appearance, statskey } from "../types";

declare function lan(arg, ...args): string;
declare function slog(type: "log" | "warn" | "error", ...args): void;
declare function draw(arr: any[]): any;
declare var D: typeof window.D;
declare var S: typeof window.S;

interface iName {
	v?: string;
	m?: string; //middle
	s?: string; //surname
	n?: string; //nick
	c?: string; //call master
}

export interface Chara extends Creature {
	cid?: string; //the id of character
	name: string; //the name of the character
	midname?: string;
	surname?: string;
	fullname?: string; //the fullname use to display
	nickname?: string; //the nickname of the character
	callname?: string; //the callname of player by character

	title?: string; //the title, like "the great", "the wise", etc.
	class?: jobclass; //the job class, like "warrior", "mage", etc.
	guildRank?: number; //the rank of the guild

	kojo?: string; //kojo id, if different from cid.
	birthday?: [number, number, number]; //the birthday for caculate age and celebrate
	mood?: number;

	intro?: [string?, string?]; //the introduction of the character

	//the role position
	position?: charaposi;

	//the mark is trauma or something else deep in the character's mind.
	mark?: Dict<{ lv: number; history: any[] }, markkey>;

	//daily record
	daily?: Dict<number, dailykeys>;

	//the experience of the character. aware is the earn exp when the character is aware. total is the total exp of the character.
	exp?: Dict<{ aware: number; total: number }, sblkey>;
	expUp?: Dict<number>; //a temp value for record the exp up

	//pregnancy status
	pregnancy?: any;
	//parasite status
	parasite?: any;

	//anything on skin. like tattoo, scar, etc.
	skin?: any;
	//reveal status
	reveals?: any;
	liquid?: any;

	//the virginity record.
	virginity?: Dict<string[]>;

	//the relationship with other character
	//des is the description of the relationship. val is the value of the relationship.
	relation?: Dict<{ des: string; val: number }>;

	//flags
	flag?: any;

	//how many money their own
	wallet?: number | Dict<number>;
	//how many debt they own from player
	debt?: number;
	//the inventory of the character
	inventory?: Array<any>;
}

export class Chara extends Creature {
	static data: Dict<Chara>;

	static get(charaId: string): Chara {
		//copy the data from database
		let chara = new Chara(charaId, {});
		Object.assign(chara, Chara.data[charaId]);
		return chara;
	}
	static new(CharaId: string, obj): Chara {
		//create a new character and add to database
		let chara = new Chara(CharaId, obj).Init(obj);
		this.data[CharaId] = chara;
		return chara;
	}
	static combineName(chara: Chara): string {
		const { name, midname, surname } = chara;
		const fullname = `${name}${midname ? "·" + midname : ""}${surname ? "·" + surname : ""}`.trim();
		return fullname;
	}
	constructor(CharaId: string, obj) {
		super(obj);
		this.cid = CharaId;

		//init names
		if (obj.name) this.name = obj.name;
		else if (!this.name) this.name = lan(draw(D.randomCharaNamePool));
		this.midname = obj.midname || "";
		this.surname = obj.surname || "";
		this.nickname = obj.nickname || "";
		this.callname = obj.callname || "";
		this.fullname = Chara.combineName(this);

		//init information
		this.title = obj.title || "";
		this.class = obj.class || "common";
		this.guildRank = obj.guildRank || 0;

		this.birthday = obj.birthday || [S.startyear - 20, 1, 1];
		this.mood = 50;

		this.intro = obj.intro || [lan("角色简介", "CharaIntro"), lan("角色简介", "CharaIntro")];

		this.position = obj.position || "any";

		//init objects
		this.mark = {};
		this.exp = {};
		this.expUp = {};

		this.pregnancy = {};
		this.virginity = {};
		this.relation = {};
		this.flag = {};

		//init money
		this.wallet = 1000;
		this.debt = 0;
		this.inventory = [];
	}
	initChara(obj) {
		this.initMark();
		this.initExp();
		this.initSkin();
		this.initLiquid();
		this.initReveals();
		this.initVirginity();
		this.initDaily();
		this.initFlag();
		this.initLiquid();
		if (obj.stats) {
			this.Stats(obj.stats);
		}
		if (obj.abl) {
			this.Ability(obj.abl);
		}
		if (obj.sbl) {
			this.SituAbility(obj.sbl);
		}
		if (obj.skill) {
			this.skill.push(...obj.skill);
		}
		if (obj.exp) {
			this.Exp(obj.exp);
		}
		if (obj.flag) {
			this.Flag(obj.flag);
		}
		if (obj.virginity) {
			this.Virginity(obj.virginity);
		}
	}
	initMark() {
		Object.keys(D.mark).forEach((key) => {
			this.mark[key] = { lv: 0, history: [] };
		});
	}
	initExp() {
		Object.keys(D.exp).forEach((key) => {
			this.exp[key] = { aware: 0, total: 0 };
		});
	}
	initSkin() {
		this.skin = {};

		D.skinlayer.forEach((key) => {
			this.skin[key] = [];
		});

		if (this.gender == "male") delete this.skin.vagina;
		if (this.gender == "female") delete this.skin.penis;

		this.skin.total = {};

		return this;
	}

	initReveals() {
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

		if (this.gender === "male") list.delete();
		if (this.gender === "female") list.delete();

		list.forEach((k) => {
			this.virginity[k] = [];
		});

		return this;
	}

	initDaily() {
		this.daily = {};
		D.dailykeys.forEach((key) => {
			this.daily[key] = 0;
		});

		if (this.gender == "female") {
			delete this.daily.cum;
		}
		if (this.gender == "male") {
			delete this.daily.cumV;
			delete this.daily.ogV;
		}

		return this;
	}

	initFlag() {
		D.cflag.forEach((key) => {
			this.flag[key] = 0;
		});
		return this;
	}
	initLiquid() {
		this.liquid = {};
		D.initials.forEach((alpha) => {
			let i = alpha.toLowerCase();
			this.liquid[i] = {};
			D.liquidType.forEach((key) => {
				this.liquid[i][key] = 0;
			});
			this.liquid[i].total = 0;
		});
		return this;
	}
	Names(obj: iName) {
		if (obj.v) this.name = obj.n;
		if (obj.m) this.midname = obj.n;
		if (obj.s) this.surname = obj.n;
		if (obj.n) this.nickname = obj.n;
		if (obj.c) this.callname = obj.n;
		this.fullname = Chara.combineName(this);

		return this;
	}
	set(key, value) {
		this[key] = value;
		return this;
	}
	Stats(obj: Dict<number, statskey>) {
		D.stats.forEach((key) => {
			const v = obj[key] || this.getRandomStats(key);
			this[key] = [v, v];
		});
		return this;
	}
	Ability(obj: Dict<number, ablkey>) {
		Object.keys(obj).forEach((key) => {
			this.abl[key].lv = obj[key];
		});
		return this;
	}
	SituAbility(obj: Dict<number, sblkey>) {
		Object.keys(obj).forEach((key) => {
			this.sbl[key] = obj[key];
		});
		return this;
	}
	Exp(obj: Dict<number, expkey>) {
		Object.keys(obj).forEach((key) => {
			let val = obj[key];
			//let int+random(int)  to number
			if (typeof val === "string") {
				let match = val.match(/\d+/g);
				if (match) {
					console.log(match);
					val = Number(match[0]) + random(Number(match[1]));
				}
			}
			this.exp[key].total = val;
			this.exp[key].aware = val;
		});
		return this;
	}
	Appearance(obj: appearance) {
		Object.keys(obj).forEach((key) => {
			this.appearance[key] = obj[key];
		});
		return this;
	}
	Virginity(obj) {
		Object.keys(obj).forEach((key) => {
			this.virginity[key] = obj[key];
		});
		return this;
	}
	Flag(obj) {
		Object.keys(obj).forEach((key) => {
			this.flag[key] = obj[key];
		});
		return this;
	}
}

Chara.data = {};
